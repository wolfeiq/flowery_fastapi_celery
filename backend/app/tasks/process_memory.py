from .celery_app import celery_app
from ..database import SessionLocal
from ..models import ScentMemory, MemoryChunk, ImageAnalysis, ExtractedScent
import time
from ..services.embeddings import generate_embedding
from ..services.vector_db import store_embedding

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
    
    analysis = ImageAnalysis(
        memory_id=memory_id,
        detected_objects=["placeholder"],
        dominant_colors=["#FFFFFF"],
        mood="neutral",
        confidence_score=0.0,
        model_used="placeholder"
    )
    db.add(analysis)
    

    process_text(memory_id, db)

def process_pdf(memory_id: str, db):
  
    process_text(memory_id, db)