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

#Celery needed for this:
#embedding
#Vector DB writes
#RAG
#LLM inference / fine-tuning prep
#Spotify enrichment


@celery_app.task
def process_memory_task(memory_id: str):
    print(f"Processing memory_id: {memory_id}")  
    db = SessionLocal()
    try:
        memory = db.query(ScentMemory).filter(ScentMemory.id == memory_id).first()
        if not memory:
            return {"error": "Memory not found"}
        if memory.memory_type.value == "photo":
            process_image(memory_id, db)
        elif memory.memory_type.value == "pdf":
            process_pdf(memory_id, db)
        else:
            process_text(memory_id, db)
        
        memory.processed = True
        db.commit()
        return {"status": "processed"}
    finally:
        db.close()

def process_text(memory_id: str, db):
    print(f"process_text called for {memory_id}")
    memory = db.query(ScentMemory).get(memory_id)
    print(f"Memory found: {memory is not None}, content length: {len(memory.content) if memory else 0}")
    
    
    scent_data = extract_scents(memory.content)
    print(f"Extracted scents: {scent_data}")
    

    if scent_data.get('notes') or scent_data.get('scent_name'):
        extracted = ExtractedScent(
            memory_id=memory_id,
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
            memory_id=memory_id,
            content=chunk_text,
            chunk_index=idx
        )
        db.add(chunk)
        db.flush()
        print(f"here 0")
        
        store_embedding(
            chunk_id=str(chunk.id),
            embedding=embedding,
            metadata={"user_id": str(memory.user_id), "memory_id": str(memory_id)}
        )
        print(f"here 00000")
        chunk.vector_id = str(chunk.id)
    print(f"here 4")
    db.commit()

def process_image(memory_id: str, db):
    memory = db.query(ScentMemory).get(memory_id)
    
    vision_data = analyze_image(memory.file_path)
    print(f"Vision analysis: {vision_data}")
    
    analysis = ImageAnalysis(
        memory_id=memory_id,
        detected_objects=vision_data.get('detected_objects', []),
        dominant_colors=vision_data.get('dominant_colors', []),
        mood=vision_data.get('mood'),
        setting=vision_data.get('setting'),
        confidence_score=0.9,
        model_used='gpt-4-turbo',
        raw_response=vision_data
    )
    db.add(analysis)
    
    enhanced_content = f"{memory.content}\n\nImage analysis: {vision_data.get('mood')} mood, objects: {', '.join(vision_data.get('detected_objects', []))}"
    memory.content = enhanced_content
    

    process_text(memory_id, db)
    

def process_pdf(memory_id: str, db):
    memory = db.query(ScentMemory).get(memory_id)
    print(f"Processing PDF: {memory.file_path}")

    extracted_text = extract_text_from_pdf(memory.file_path)
    print(f"Extracted {len(extracted_text)} characters from PDF")
    
    if extracted_text:
        memory.content = f"{memory.content}\n\nPDF Content:\n{extracted_text}"
    else:
        memory.content = f"{memory.content}\n\n[PDF extraction failed]"
    
    process_text(memory_id, db)




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
    