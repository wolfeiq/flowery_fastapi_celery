from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator, Field
from typing import List, Optional
import uuid
from openai import OpenAI
from ..core.config import settings
from ..services.embeddings import generate_embedding
from ..services.vector_db import search_similar
from ..models import MemoryChunk, ScentMemory, ScentProfile
from sqlalchemy.orm.attributes import flag_modified
from ..database import get_db
from ..models import User, QueryLog, QueryType
from .auth import get_current_user
from ..core.validation import validate_email, validate_password, sanitize_text, validate_uuid

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
    
    request_q = sanitize_text(request.query, max_length=1000)
    query_embedding = generate_embedding(request_q)
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
    db.refresh(query_log) 

    return {"query_id": str(query_log.id), "response": llm_response, "sources": [str(c.memory_id) for c in chunks]}


class FeedbackRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = None
    disliked_notes: Optional[List[str]] = None

    @field_validator("disliked_notes")
    @classmethod
    def validate_disliked_notes(cls, notes):
        if notes is None:
            return notes

        if len(notes) > 50:
            raise ValueError("Maximum 50 disliked notes allowed")

        cleaned = []
        for note in notes:
            note = note.strip().lower()
            if not note:
                continue
            if len(note) > 50:
                raise ValueError("Each disliked note must be ≤ 50 characters")
            cleaned.append(note)

        return cleaned

    
@router.post("/{query_id}/feedback")
def submit_feedback(
    query_id: uuid.UUID,
    feedback: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query_i = validate_uuid(query_id)

    query = db.query(QueryLog).filter(
        QueryLog.id == query_i,
        QueryLog.user_id == current_user.id
    ).first()

    if not query:
        raise HTTPException(404, "Query not found")

    query.rating = feedback.rating

    if feedback.feedback_text:
        query.feedback_text = sanitize_text(
            feedback.feedback_text,
            max_length=2000
        )

    if feedback.rating <= 2 and feedback.disliked_notes:
        profile = db.query(ScentProfile).filter_by(
            user_id=current_user.id
        ).first()

        if profile:
            existing = set(profile.disliked_notes or [])
            for note in feedback.disliked_notes:
                if note not in existing:
                    profile.disliked_notes.append(note)

            flag_modified(profile, "disliked_notes")

    db.commit()

    return {"status": "feedback recorded"}
