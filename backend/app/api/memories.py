from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from ..tasks.process_memory import process_memory_task
import uuid
from ..core.validation import sanitize_text
from ..database import get_db
from ..models import User, ScentMemory, MemoryType
from .auth import get_current_user
from ..core.validation import validate_email, validate_password, sanitize_text, validate_uuid
import base64

MAX_FILE_SIZE = 10 * 1024 * 1024
BASE64_SIZE_LIMIT = 5 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
}

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
}

router = APIRouter()

#UPLOAD_DIR = Path("uploads")
#UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_memory(
    title: str = Form(...),
    content: str = Form(...), #description
    occasion: str = Form(None),
    emotion: str = Form(None),
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = sanitize_text(title, max_length=255)
    content = sanitize_text(content, max_length=50000)
    occasion = sanitize_text(occasion, max_length=100)
    emotion = sanitize_text(emotion, max_length=100)

    if file:
        if file.content_type.startswith("image"):
            memory_type = MemoryType.PHOTO
        elif file.content_type == "application/pdf":
            memory_type = MemoryType.PDF
        else:
            raise HTTPException(400, "Unsupported file type")
    else:
        memory_type = MemoryType.TEXT

    memory = ScentMemory(
        user_id=current_user.id,
        title=title,
        content=content,
        memory_type=memory_type,
        occasion=occasion,
        emotion=emotion
    )

    db.add(memory)
    db.flush()

    file_data = None
    temp_file_path = None

    if file:
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(400, "File too large (max 10MB)")

        ext = Path(file.filename).suffix.lower()

        if (
            file.content_type not in ALLOWED_MIME_TYPES
            or ext not in ALLOWED_EXTENSIONS
        ):
            raise HTTPException(400, "Unsupported file type")
        
        file_bytes = await file.read()

        if file_size < BASE64_SIZE_LIMIT:
            base64_encoded = base64.b64encode(file_bytes).decode('utf-8')
            file_data = {
                "type": "base64",
                "data": base64_encoded,
                "content_type": file.content_type,
                "extension": ext
            }

        else:
            temp_dir = Path("/tmp/scent_uploads")
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            temp_filename = f"{uuid.uuid4()}{ext}"
            temp_file_path = temp_dir / temp_filename
            
            with temp_file_path.open("wb") as f:
                f.write(file_bytes)
            
            file_data = {
                "type": "temp_file",
                "path": str(temp_file_path),
                "content_type": file.content_type,
                "extension": ext
            }
        
        memory.file_size = file_size
        memory.mime_type = file.content_type

    db.commit()


    process_memory_task.delay(
        str(memory.id), 
        str(current_user.id),
        file_data
    )

    return {
        "id": str(memory.id),
        "title": title,
        "status": "processing"
    }

@router.get("/")
def list_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memories = db.query(ScentMemory).filter(
        ScentMemory.user_id == current_user.id
    ).order_by(ScentMemory.created_at.desc()).all()
    
    return [
        {
            "id": str(m.id),
            "title": m.title,
            "occasion": m.occasion,
            "content": m.content,
            "memory_type": m.memory_type,
            "extracted_scents": m.extracted_scents,
            "emotion": m.emotion,
            "processed": m.processed,
            "created_at": m.created_at
        }
        for m in memories
    ]

@router.get("/{memory_id}")
def get_memory(
    memory_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    memory = validate_uuid(memory_id)

    memory = db.query(ScentMemory).filter(
        ScentMemory.id == memory,
        ScentMemory.user_id == current_user.id
    ).first()
    
    if not memory:
        raise HTTPException(404, "Memory not found")
    
    return {
        "id": str(memory.id),
        "title": memory.title,
        "content": memory.content,
        "occasion": memory.occasion,
        "extracted_scents": memory.extracted_scents,
        "emotion": memory.emotion,
        "processed": memory.processed,
        "chunks_count": len(memory.chunks)
    }