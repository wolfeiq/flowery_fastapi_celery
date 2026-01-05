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
from pathlib import Path
import shutil

MAX_FILE_SIZE = 10 * 1024 * 1024

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

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_memory(
    title: str = Form(...),
    content: str = Form(...),
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

        user_dir = UPLOAD_DIR / str(current_user.id)
        user_dir.mkdir(parents=True, exist_ok=True)

        file_path = user_dir / f"{memory.id}{ext}"

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        memory.file_path = str(file_path)
        memory.file_size = file_path.stat().st_size
        memory.mime_type = file.content_type

    db.commit()

    process_memory_task.delay(str(memory.id), str(current_user.id))

    return {
        "id": str(memory.id),
        "title": title,
        "status": "uploaded"
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
            "memory_type": m.memory_type,
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
        "emotion": memory.emotion,
        "processed": memory.processed,
        "chunks_count": len(memory.chunks)
    }