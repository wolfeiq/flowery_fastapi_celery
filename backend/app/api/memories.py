import base64
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from ..core.validation import sanitize_text, validate_uuid
from ..database import get_db
from ..models import User, ScentMemory, MemoryType
from ..schemas.common import (
    MemoryUploadResponse,
    MemoryListItem,
    MemoryDetailResponse,
    MemoryDeleteResponse,
    ExtractedScentResponse,
)
from ..tasks.process_memory import process_memory_task
from .auth import get_current_user


router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
BASE64_SIZE_LIMIT = 5 * 1024 * 1024  # 5MB

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


@router.post(
    "/upload",
    response_model=MemoryUploadResponse,
    summary="Upload a new memory",
    description="Upload a scent memory with optional image or PDF attachment."
)
async def upload_memory(
    title: str = Form(..., description="Title of the memory"),
    content: str = Form(..., description="Description/content of the memory"),
    occasion: Optional[str] = Form(None, description="Occasion associated with the memory"),
    emotion: Optional[str] = Form(None, description="Emotion associated with the memory"),
    file: Optional[UploadFile] = File(None, description="Optional image or PDF file"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MemoryUploadResponse:

    title = sanitize_text(title, max_length=255)
    content = sanitize_text(content, max_length=50000)
    occasion = sanitize_text(occasion, max_length=100) if occasion else None
    emotion = sanitize_text(emotion, max_length=100) if emotion else None

    if file:
        if file.content_type and file.content_type.startswith("image"):
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

    if file:
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(400, "File too large (max 10MB)")

        ext = Path(file.filename).suffix.lower() if file.filename else ""

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

    return MemoryUploadResponse(
        id=str(memory.id),
        title=title,
        status="processing"
    )


@router.get(
    "/",
    response_model=list[MemoryListItem],
    summary="List all memories",
    description="Get all memories for the current user."
)
def list_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[MemoryListItem]:
    memories = db.query(ScentMemory).filter(
        ScentMemory.user_id == current_user.id
    ).order_by(ScentMemory.created_at.desc()).all()

    return [
        MemoryListItem(
            id=str(m.id),
            title=m.title,
            occasion=m.occasion,
            content=m.content,
            memory_type=m.memory_type.value if hasattr(m.memory_type, 'value') else str(m.memory_type),
            extracted_scents=[
                ExtractedScentResponse.model_validate(s) for s in (m.extracted_scents or [])
            ] if m.extracted_scents else None,
            emotion=m.emotion,
            processed=m.processed,
            created_at=m.created_at
        )
        for m in memories
    ]


@router.get(
    "/{memory_id}",
    response_model=MemoryDetailResponse,
    summary="Get memory details",
    description="Get detailed information about a specific memory."
)
def get_memory(
    memory_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MemoryDetailResponse:
    validated_id = validate_uuid(memory_id)

    memory = db.query(ScentMemory).filter(
        ScentMemory.id == validated_id,
        ScentMemory.user_id == current_user.id
    ).first()

    if not memory:
        raise HTTPException(404, "Memory not found")

    return MemoryDetailResponse(
        id=str(memory.id),
        title=memory.title,
        content=memory.content,
        occasion=memory.occasion,
        memory_type=memory.memory_type.value if hasattr(memory.memory_type, 'value') else str(memory.memory_type),
        extracted_scents=[
            ExtractedScentResponse.model_validate(s) for s in (memory.extracted_scents or [])
        ] if memory.extracted_scents else None,
        emotion=memory.emotion,
        processed=memory.processed,
        chunks_count=len(memory.chunks) if memory.chunks else 0
    )


@router.delete(
    "/{memory_id}",
    response_model=MemoryDeleteResponse,
    summary="Delete a memory",
    description="Delete a memory and all associated data."
)
def delete_memory(
    memory_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MemoryDeleteResponse:
    validated_id = validate_uuid(memory_id)

    memory = db.query(ScentMemory).filter(
        ScentMemory.id == validated_id,
        ScentMemory.user_id == current_user.id
    ).first()

    if not memory:
        raise HTTPException(404, "Memory not found")

    db.delete(memory)
    db.commit()

    return MemoryDeleteResponse(
        status="deleted",
        id=str(memory_id)
    )
