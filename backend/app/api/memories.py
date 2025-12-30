from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from ..tasks.process_memory import process_memory_task
import uuid

from ..database import get_db
from ..models import User, ScentMemory, MemoryType
from .auth import get_current_user

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
    
   
    if file:
        user_dir = UPLOAD_DIR / str(current_user.id)
        user_dir.mkdir(exist_ok=True)
        
        file_path = user_dir / f"{memory.id}_{file.filename}"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        memory.file_path = str(file_path)
        memory.file_size = file_path.stat().st_size
        memory.mime_type = file.content_type
    
    db.add(memory)
    db.commit()
    print(f"Queuing task for memory: {memory.id}")
    process_memory_task.delay(str(memory.id))

    return {"id": str(memory.id), "title": title, "status": "uploaded"}

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
    memory = db.query(ScentMemory).filter(
        ScentMemory.id == memory_id,
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