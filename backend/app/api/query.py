from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
from openai import OpenAI
from ..core.config import settings
from ..services.embeddings import generate_embedding
from ..services.vector_db import search_similar
from ..models import MemoryChunk, ScentMemory
from ..database import get_db
from ..models import User, QueryLog, QueryType
from .auth import get_current_user

router = APIRouter()

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class QueryRequest(BaseModel):
    query: str
    query_type: QueryType = QueryType.RECOMMENDATION

@router.post("/search")
def search_memories(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    

    query_embedding = generate_embedding(request.query)
    results = search_similar(query_embedding, str(current_user.id), top_k=5)

    chunk_ids = results['ids'][0] if results['ids'] else []
    chunks = db.query(MemoryChunk).filter(MemoryChunk.id.in_(chunk_ids)).all()
    context = "\n\n".join([f"Memory: {c.content}" for c in chunks])

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a personal fragrance advisor based on user memories."},
            {"role": "user", "content": f"User memories:\n{context}\n\nQuery: {request.query}\n\nRecommend perfumes."}
        ]
    )

    llm_response = response.choices[0].message.content

    query_log = QueryLog(
        user_id=current_user.id,
        query_text=request.query,
        query_type=request.query_type,
        llm_response=llm_response,
        model_version="gpt-4"
    )
    db.add(query_log)
    db.commit()
    
    return {"response": llm_response, "sources": [str(c.memory_id) for c in chunks]}

@router.post("/{query_id}/feedback")
def submit_feedback(
    query_id: uuid.UUID,
    rating: int,
    feedback_text: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(QueryLog).filter(
        QueryLog.id == query_id,
        QueryLog.user_id == current_user.id
    ).first()
    
    if not query:
        raise HTTPException(404, "Query not found")
    
    query.rating = rating
    query.feedback_text = feedback_text
    db.commit()
    
    return {"status": "feedback recorded"}