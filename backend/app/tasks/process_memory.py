from venv import logger
from .celery_app import celery_app
from ..database import SessionLocal
from ..models import ScentMemory, MemoryChunk, ImageAnalysis, ExtractedScent, SpotifyLink, ScentProfile
import time
from ..services.embeddings import generate_embedding
from sqlalchemy.orm.attributes import flag_modified
from ..services.vector_db import store_embedding
from ..services.scent_extractor import extract_scents
from ..services.vision_ai import analyze_image
from ..services.pdf_extractor import extract_text_from_pdf
from ..websocket import manager
from app.services.summarization import generate_summary
import asyncio
import redis
import json
import redis
from app.core.config import settings
import os
import base64
from app.services.cache import invalidate_user_recommendations

#Celery needed for this:
#embedding
#Vector DB writes
#RAG
#LLM inference / fine-tuning prep
#Spotify enrichment


#with cache invalidation

#force_failure: bool = True
@celery_app.task
def process_memory_task(memory_id: str, user_id: str, file_data: dict = None):
    db = SessionLocal()
    
    try:
     
        ##if force_failure or memory_id.startswith("test-fail-"):
            ##raise Exception("Test failure: This is a simulated error for testing")

        memory = db.query(ScentMemory).get(memory_id)
        
        if not memory:
            raise ValueError(f"Memory {memory_id} not found")
        
        if file_data:
            if file_data["type"] == "base64":
                file_bytes = base64.b64decode(file_data["data"])
            elif file_data["type"] == "temp_file":
                with open(file_data["path"], "rb") as f:
                    file_bytes = f.read()
                os.remove(file_data["path"])
            
            if file_data["content_type"].startswith("image"):
                original_content = memory.content
                description = process_image(memory, db, file_bytes)
                memory.content = f"{original_content}\n\n{description}"
                
            
            elif file_data["content_type"] == "application/pdf":
                
                extracted_text = extract_text_from_pdf(file_bytes)
                original_content = memory.content
                if extracted_text:
                    memory.content = f"{memory.content}\n\nAttached PDF Content:\n{extracted_text}"         
                else:
                    memory.content = f"{memory.content}\n\n[PDF extraction failed]"

                description = process_text(memory, db)
                memory.content = f"{original_content}\n\n{description}"
        
        else: 
            original_content = memory.content
            description = process_text(memory, db)
            memory.content = f"{original_content}\n\n{description}"
            

        memory.processed = True
        db.commit()
        invalidate_user_recommendations(user_id)
        logger.info(f"Successfully processed memory {memory_id} and invalidated cache")

        r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        
        message = {
            "user_id": user_id,
            "event": "memory_processed",
            "memory_id": memory_id,
        }
        
        result = r.publish("memory_events", json.dumps(message))
    
        if result == 0:
            logger.info("No subscribers listening to memory_events!")

        r.close()

        
    except Exception as e:
        db.rollback()
        logger.error(f"Task failed for memory {memory_id}", exc_info=True)
        if file_data and file_data["type"] == "temp_file":
            if os.path.exists(file_data["path"]):
                os.remove(file_data["path"])


        try:
            memory = db.query(ScentMemory).get(memory_id)
            if memory:
                memory.processed = False 
                memory.processing_error = str(e)[:500]
                db.commit()
        except:
            pass
        r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        error_message = str(e)[:500]
        message = {
            "user_id": user_id,
            "event": "memory_failed",
            "memory_id": memory_id,
            "error": error_message,
        }
        
        result = r.publish("memory_events", json.dumps(message))
    
        if result == 0:
            logger.info("No subscribers listening to memory_events!")

        r.close()
        raise
    finally:
        db.close()
    
def process_image(memory: ScentMemory, db, file_bytes) -> str:

    vision_result = analyze_image(file_bytes, memory.content, memory.emotion, memory.occasion)

    extracted = ExtractedScent(
        memory_id=memory.id,
        scent_name=vision_result.get('scent_name'),
        brand=vision_result.get('brand'),
        top_notes=vision_result.get('top_notes', []),
        heart_notes=vision_result.get('heart_notes', []),
        base_notes=vision_result.get('base_notes', []),
        description=vision_result.get('image_description'), #should include the colors, emotion, and fragrance notes
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
    
    chunks = [enhanced_content[i:i+500] for i in range(0, len(enhanced_content), 450)]

    for idx, chunk_text in enumerate(chunks):
        embedding = generate_embedding(chunk_text)
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
    

    return vision_result.get('image_description', '') 



def process_text(memory: ScentMemory, db) -> str:
    #summary = generate_summary(memory.content, user_context=memory.title)
    #memory.summary = summary
    #print(f"Generated summary: {summary[:100]}...")
    
    scent_data = extract_scents(memory.content, memory.emotion, memory.occasion)


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
    
    chunks = [enhanced_content[i:i+500] for i in range(0, len(enhanced_content), 450)]


    for idx, chunk_text in enumerate(chunks):
        embedding = generate_embedding(chunk_text)
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

    return scent_data.get('description', '') 



def update_scent_profile(user_id, scent_data: dict, memory: ScentMemory, db):
    profile = db.query(ScentProfile).filter_by(user_id=user_id).first()
    
    if not profile:
        profile = ScentProfile(
            user_id=user_id, 
            preferred_families=[], 
            disliked_notes=[],
            note_occurrence_counts = {"top": {}, "heart": {}, "base": {}},
            emotional_preferences=[],
        )
        db.add(profile)
        db.flush()
    
    if not profile.note_occurrence_counts:
        profile.note_occurrence_counts = {"top": {}, "heart": {}, "base": {}}

    top_notes = scent_data.get('top_notes', [])
    for note in top_notes:
        if note:
            profile.note_occurrence_counts["top"][note] = profile.note_occurrence_counts["top"].get(note, 0) + 1

    heart_notes = scent_data.get('heart_notes', [])
    for note in heart_notes:
        if note:
            profile.note_occurrence_counts["heart"][note] = profile.note_occurrence_counts["heart"].get(note, 0) + 1


    base_notes = scent_data.get('base_notes', [])
    for note in base_notes:
        if note:
            profile.note_occurrence_counts["base"][note] = profile.note_occurrence_counts["base"].get(note, 0) + 1


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
    