import base64
import json
import logging
import os
from typing import Optional
from uuid import UUID

import redis
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from .celery_app import celery_app
from ..core.config import settings
from ..database import SessionLocal
from ..models import ScentMemory, MemoryChunk, ExtractedScent, ScentProfile
from ..schemas.common import FileData, ScentData, VisionAnalysisResult
from ..services.cache import invalidate_user_recommendations
from ..services.embeddings import generate_embedding
from ..services.pdf_extractor import extract_text_from_pdf
from ..services.scent_extractor import extract_scents
from ..services.vector_db import store_embedding
from ..services.vision_ai import analyze_image


logger = logging.getLogger(__name__)


@celery_app.task
def process_memory_task(
    memory_id: str,
    user_id: str,
    file_data: Optional[FileData] = None
) -> None:
    db: Session = SessionLocal()

    try:
        memory: Optional[ScentMemory] = db.get(ScentMemory, memory_id)

        if not memory:
            raise ValueError(f"Memory {memory_id} not found")

        file_bytes: Optional[bytes] = None

        if file_data:
            if file_data["type"] == "base64":
                file_bytes = base64.b64decode(file_data["data"])
            elif file_data["type"] == "temp_file":
                with open(file_data["path"], "rb") as f:
                    file_bytes = f.read()
                os.remove(file_data["path"])

            if file_bytes and file_data["content_type"].startswith("image"):
                original_content = memory.content or ""
                description = process_image(memory, db, file_bytes)
                memory.content = f"{original_content}\n\n{description}"

            elif file_bytes and file_data["content_type"] == "application/pdf":
                extracted_text = extract_text_from_pdf(file_bytes)
                original_content = memory.content or ""
                if extracted_text:
                    memory.content = f"{memory.content}\n\nAttached PDF Content:\n{extracted_text}"
                else:
                    memory.content = f"{memory.content}\n\n[PDF extraction failed]"

                description = process_text(memory, db)
                memory.content = f"{original_content}\n\n{description}"

        else:
            original_content = memory.content or ""
            description = process_text(memory, db)
            memory.content = f"{original_content}\n\n{description}"

        memory.processed = True
        db.commit()
        invalidate_user_recommendations(user_id)
        logger.info(f"Successfully processed memory {memory_id} and invalidated cache")

        _publish_event(user_id, "memory_processed", memory_id)

    except Exception as e:
        db.rollback()
        logger.error(f"Task failed for memory {memory_id}", exc_info=True)

        if file_data and file_data.get("type") == "temp_file":
            temp_path = file_data.get("path", "")
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

        try:
            memory = db.get(ScentMemory, memory_id)
            if memory:
                memory.processed = False
                memory.processing_error = str(e)[:500]
                db.commit()
        except Exception:
            logger.warning(f"Failed to update memory error status for {memory_id}")

        _publish_event(user_id, "memory_failed", memory_id, error=str(e)[:500])
        raise

    finally:
        db.close()


def _publish_event(
    user_id: str,
    event: str,
    memory_id: str,
    error: Optional[str] = None
) -> None:
    r: redis.Redis[str] = redis.Redis.from_url(
        settings.redis_url_computed,
        decode_responses=True
    )

    message: dict[str, str] = {
        "user_id": user_id,
        "event": event,
        "memory_id": memory_id,
    }

    if error:
        message["error"] = error

    result = r.publish("memory_events", json.dumps(message))

    if result == 0:
        logger.info("No subscribers listening to memory_events!")

    r.close()


def process_image(memory: ScentMemory, db: Session, file_bytes: bytes) -> str:

    vision_result: VisionAnalysisResult = analyze_image(
        file_bytes,
        memory.content or "",
        memory.emotion,
        memory.occasion
    )

    extracted = ExtractedScent(
        memory_id=memory.id,
        scent_name=vision_result.get('scent_name'),
        brand=vision_result.get('brand'),
        top_notes=vision_result.get('top_notes', []),
        heart_notes=vision_result.get('heart_notes', []),
        base_notes=vision_result.get('base_notes', []),
        description=vision_result.get('image_description'),
        emotion=vision_result.get('emotion'),
        scent_family=vision_result.get('scent_family'),
        color=vision_result.get('color'),
        confidence=0.85,
        source='image',
        extraction_method='llm'
    )

    db.add(extracted)
    db.flush()

    enhanced_content = f"{memory.content}\n\nAttached image description: {vision_result.get('image_description')}"

    update_scent_profile(memory.user_id, vision_result, memory, db)

    _create_chunks_and_embeddings(memory, enhanced_content, db)

    return vision_result.get('image_description', '')


def process_text(memory: ScentMemory, db: Session) -> str:

    scent_data: ScentData = extract_scents(
        memory.content or "",
        memory.emotion,
        memory.occasion
    )

    extracted = ExtractedScent(
        memory_id=memory.id,
        scent_name=scent_data.get('scent_name'),
        brand=scent_data.get('brand'),
        top_notes=scent_data.get('top_notes', []),
        heart_notes=scent_data.get('heart_notes', []),
        base_notes=scent_data.get('base_notes', []),
        description=scent_data.get('description'),
        scent_family=scent_data.get('scent_family'),
        emotion=scent_data.get('emotion'),
        color=scent_data.get('color'),
        confidence=0.85,
        source='text',
        extraction_method='llm'
    )

    db.add(extracted)
    db.flush()

    enhanced_content = f"{memory.content}\n\nMemory description: {scent_data.get('description')}"

    update_scent_profile(memory.user_id, scent_data, memory, db)

    _create_chunks_and_embeddings(memory, enhanced_content, db)

    return scent_data.get('description', '')


def _create_chunks_and_embeddings(
    memory: ScentMemory,
    content: str,
    db: Session
) -> None:
    chunks: list[str] = [content[i:i+500] for i in range(0, len(content), 450)]

    for idx, chunk_text in enumerate(chunks):
        embedding: list[float] = generate_embedding(chunk_text)
        chunk = MemoryChunk(
            memory_id=memory.id,
            content=chunk_text,
            chunk_index=idx
        )
        db.add(chunk)
        db.flush()

        store_embedding(
            chunk_id=str(chunk.id),
            embedding=embedding,
            metadata={"user_id": str(memory.user_id), "memory_id": str(memory.id)}
        )

        chunk.vector_id = str(chunk.id)


def update_scent_profile(
    user_id: UUID,
    scent_data: ScentData | VisionAnalysisResult,
    memory: ScentMemory,
    db: Session
) -> None:
    profile: Optional[ScentProfile] = db.query(ScentProfile).filter_by(
        user_id=user_id
    ).first()

    if not profile:
        profile = ScentProfile(
            user_id=user_id,
            preferred_families=[],
            disliked_notes=[],
            note_occurrence_counts={"top": {}, "heart": {}, "base": {}},
            emotional_preferences=[],
        )
        db.add(profile)
        db.flush()

    if not profile.note_occurrence_counts:
        profile.note_occurrence_counts = {"top": {}, "heart": {}, "base": {}}

    for note in scent_data.get('top_notes', []):
        if note:
            profile.note_occurrence_counts["top"][note] = (
                profile.note_occurrence_counts["top"].get(note, 0) + 1
            )

    for note in scent_data.get('heart_notes', []):
        if note:
            profile.note_occurrence_counts["heart"][note] = (
                profile.note_occurrence_counts["heart"].get(note, 0) + 1
            )

    for note in scent_data.get('base_notes', []):
        if note:
            profile.note_occurrence_counts["base"][note] = (
                profile.note_occurrence_counts["base"].get(note, 0) + 1
            )

    family = scent_data.get('scent_family')
    if family and family not in profile.preferred_families:
        profile.preferred_families.append(family)

    if memory.emotion and memory.emotion not in profile.emotional_preferences:
        profile.emotional_preferences.append(memory.emotion)

    emotion = scent_data.get('emotion')
    if emotion and emotion not in profile.emotional_preferences:
        profile.emotional_preferences.append(emotion)

    flag_modified(profile, 'preferred_families')
    flag_modified(profile, 'emotional_preferences')
    flag_modified(profile, 'note_occurrence_counts')

    profile.total_memories += 1
