from venv import logger
from .celery_app import celery_app
from ..database import SessionLocal
from ..models import ScentMemory, MemoryChunk, ImageAnalysis, ExtractedScent, ExtractedScent, ScentProfile
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

@celery_app.task
def process_memory_task(memory_id: str, user_id: str, file_data: dict = None):
    db = SessionLocal()
    
    try:
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
                vision_result = analyze_image(file_bytes)
                
                analysis = ImageAnalysis(
                    memory_id=memory_id,
                    detected_objects=vision_result.get('detected_objects', []),
                    dominant_colors=vision_result.get('dominant_colors', []),
                    mood=vision_result.get('mood'),
                    setting=vision_result.get('setting'),
                    confidence_score=0.9,
                    model_used='gpt-4-turbo',
                    raw_response=vision_result
                )
                
                db.add(analysis)
                
                enhanced_content = f"{memory.content}\n\nImage analysis: {vision_result.get('mood')} mood, objects: {', '.join(vision_result.get('detected_objects', []))}"
                memory.content = enhanced_content
            
            elif file_data["content_type"] == "application/pdf":
                print(f"Processing PDF for memory {memory_id}")
                
                extracted_text = extract_text_from_pdf(file_bytes)
                print(f"Extracted {len(extracted_text)} characters from PDF")
                
                if extracted_text:
                    memory.content = f"{memory.content}\n\nPDF Content:\n{extracted_text}"
                else:
                    memory.content = f"{memory.content}\n\n[PDF extraction failed]"
        
        process_text(memory, db)
        
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
            print("No subscribers listening to memory_events!")

        r.close()
        print(f"Successfully processed memory {memory_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Task failed for memory {memory_id}", exc_info=True)
        if file_data and file_data["type"] == "temp_file":
            if os.path.exists(file_data["path"]):
                os.remove(file_data["path"])
        raise
    finally:
        db.close()
    


def process_text(memory: ScentMemory, db):

    print(f"process_text called for {memory.id}")
    print(f"Content length: {len(memory.content)}")

    summary = generate_summary(memory.content, user_context=memory.title)
    memory.summary = summary
    print(f"Generated summary: {summary[:100]}...")
    
    scent_data = extract_scents(memory.content)
    print(f"Extracted scents: {scent_data}")

    if scent_data.get('notes') or scent_data.get('scent_name'):

        extracted = ExtractedScent(
            memory_id=memory.id,
            scent_name=scent_data.get('scent_name'),
            brand=scent_data.get('brand'),
            notes=scent_data.get('notes', []),
            description=scent_data.get('description'),
            confidence=0.85,
            source='text',
            extraction_method='llm'
        )
        db.add(extracted)
        db.flush()
        print(f"Created ExtractedScent: {extracted.id}")
    
    update_scent_profile(memory.user_id, scent_data, db)
    
    chunks = [memory.content[i:i+500] for i in range(0, len(memory.content), 450)]
    print(f"Created {len(chunks)} chunks")

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
    
    print(f"Completed processing for memory {memory.id}")



def update_scent_profile(user_id, scent_data: dict, db):
    print(f"update_scent_profile called for user {user_id}")
    print(f"scent_data: {scent_data}")
    profile = db.query(ScentProfile).filter_by(user_id=user_id).first()
    print(f"Profile found: {profile is not None}")
    
    if not profile:
        profile = ScentProfile(user_id=user_id, preferred_families=[], disliked_notes=[])
        db.add(profile)
        db.flush()
        print(f"created new")
    
    notes = scent_data.get('notes', [])
    for note in notes:
        if note and note not in profile.preferred_families:
            profile.preferred_families.append(note)
    
    family = scent_data.get('fragrance_family')
    if family and family not in profile.preferred_families:
        profile.preferred_families.append(family)

    flag_modified(profile, 'preferred_families')
    
    profile.total_memories += 1
    