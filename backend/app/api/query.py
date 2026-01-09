from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator, Field
from typing import List, Optional
import uuid
import hashlib
import json
import logging
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
from ..services.cache import (
    get_cached_recommendation,
    cache_recommendation,
    find_similar_cached_query,
    invalidate_user_recommendations
)

router = APIRouter()
logger = logging.getLogger(__name__)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Cache-friendly system prompt with Redis for similar and identical queries 

FRAGRANCE_ADVISOR_SYSTEM_PROMPT = """You are an expert personal fragrance advisor with deep knowledge of perfumery.

Your role:
- Analyze user's scent memories and preferences
- Understand their emotional connections to fragrances
- Recommend perfumes that match their taste profile
- Consider notes, families, occasions, and moods they've enjoyed
- Provide specific brand and perfume names when possible
- Explain why each recommendation fits their preferences

Guidelines:
- Be personal and considerate of their memories
- Reference specific scents/notes they've mentioned
- Suggest 3-5 perfumes with clear reasoning
- Include variety (different price points, occasions, moods)
- Be honest if their preferences are conflicting

Format your response clearly with:
1. Brief analysis of their scent profile
2. Specific perfume recommendations with reasons
3. Any notes or considerations"""

class QueryRequest(BaseModel):
    query: str
    query_type: QueryType = QueryType.RECOMMENDATION

@router.post("/search")
def search_memories(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    use_cache: bool = True
):
    request_q = sanitize_text(request.query, max_length=1000)
    
    query_embedding = generate_embedding(request_q)
    results = search_similar(query_embedding, str(current_user.id), top_k=5)

    chunk_ids = results['ids'][0] if results['ids'] else []
    chunks = db.query(MemoryChunk).filter(MemoryChunk.id.in_(chunk_ids)).all()
    context = "\n\n".join([f"Memory: {c.content}" for c in chunks])

    cache_key_data = f"{current_user.id}:{context}:{request_q}"
    
    if use_cache:
        cached_response = get_cached_recommendation(cache_key_data, str(current_user.id))
        if cached_response:
            logger.info(f"Cache hit (exact) for user {current_user.id}")
            
            query_log = QueryLog(
                user_id=current_user.id,
                query_text=request.query,
                query_type=request.query_type,
                llm_response=cached_response,
                model_version="gpt-4-cached"
            )
            db.add(query_log)
            db.commit()
            db.refresh(query_log)
            
            return {
                "query_id": str(query_log.id),
                "response": cached_response,
                "sources": [str(c.memory_id) for c in chunks],
                "cached": True
            }
        
        similar_response = find_similar_cached_query(
            query=request_q,
            user_id=str(current_user.id),
            threshold=0.85
        )
        if similar_response:
            logger.info(f"Cache hit (similar) for user {current_user.id}")
            
            query_log = QueryLog(
                user_id=current_user.id,
                query_text=request.query,
                query_type=request.query_type,
                llm_response=similar_response,
                model_version="gpt-4-cached-similar"
            )
            db.add(query_log)
            db.commit()
            db.refresh(query_log)
            
            return {
                "query_id": str(query_log.id),
                "response": similar_response,
                "sources": [str(c.memory_id) for c in chunks],
                "cached": True
            }

    logger.info(f"Cache miss for user {current_user.id}, calling LLM")
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": FRAGRANCE_ADVISOR_SYSTEM_PROMPT 
            },
            {
                "role": "user",
                "content": f"""User's scent memories and preferences:
{context}

---

User's question: {request.query}

Please provide personalized perfume recommendations based on their profile."""
            }
        ],
        temperature=0.7,
        max_tokens=1000
    )

    llm_response = response.choices[0].message.content
    
    usage = response.usage
    if hasattr(usage, 'prompt_tokens_details'):
        cached_tokens = usage.prompt_tokens_details.get('cached_tokens', 0)
        if cached_tokens > 0:
            logger.info(f"OpenAI prompt cache hit: {cached_tokens} tokens cached")

    if use_cache:
        cache_recommendation(
            cache_key_data=cache_key_data,
            recommendation=llm_response,
            query=request_q,
            user_id=str(current_user.id),
            context_preview=context[:200],
            ttl=3600 
        )

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

    return {
        "query_id": str(query_log.id),
        "response": llm_response,
        "sources": [str(c.memory_id) for c in chunks],
        "cached": False
    }


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
            
            invalidate_user_recommendations(str(current_user.id))
            logger.info(f"Invalidated cache for user {current_user.id} due to preference update")

    db.commit()

    return {"status": "feedback recorded"}