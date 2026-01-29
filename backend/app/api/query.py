import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from ..core.config import settings
from ..core.validation import sanitize_text, validate_uuid
from ..database import get_db
from ..models import User, QueryLog, QueryType, MemoryChunk, ScentProfile
from ..schemas.common import SearchResponse, FeedbackResponse
from ..services.cache import (
    get_cached_recommendation,
    cache_recommendation,
    find_similar_cached_query,
    invalidate_user_recommendations
)
from ..services.embeddings import generate_embedding
from ..services.vector_db import search_similar
from .auth import get_current_user


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

CRITICAL INSTRUCTION - SPECIFICITY REQUIRED:
You MUST reference CONCRETE, SPECIFIC details from the user's context. DO NOT use vague generalizations.

Examples of what to DO:
✓ "Given your experience with Python, JavaScript, and TensorFlow..."
✓ "Since you worked at Amazon and Goldman Sachs..."
✓ "Your memory of eating apples at the fruit market in [specific location]..."
✓ "The library scene you described with old books..."

Examples of what NOT to do:
✗ "your tech career" (too vague - name specific technologies)
✗ "your work experience" (too vague - name specific companies)
✗ "your memories" (too vague - reference specific scenes/events)

When the user's context includes:
- Professional info: Reference EXACT job titles, companies, technologies, programming languages
- Memories: Reference EXACT locations, people, events, sensory details
- Documents: Quote or paraphrase SPECIFIC passages, not themes

If you find yourself using vague terms like "journey", "career", "experience" without specifics, STOP and find the concrete details to reference instead.

Guidelines:
- Be personal and considerate of their memories
- Reference specific scents/notes they've mentioned
- Suggest 3-5 perfumes with clear reasoning
- Include variety (different price points, occasions, moods)
- Be honest if their preferences are conflicting
- ALWAYS tie recommendations back to specific details from their context

Format your response clearly with:
1. Brief analysis of their profile (with SPECIFIC details quoted)
2. Specific perfume recommendations with reasons (connecting to SPECIFIC details)
3. Any notes or considerations"""


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Search query")
    query_type: QueryType = Field(default=QueryType.RECOMMENDATION, description="Type of query")


class FeedbackRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    feedback_text: Optional[str] = Field(None, max_length=2000, description="Optional feedback text")
    disliked_notes: Optional[list[str]] = Field(None, description="Notes the user disliked")

    @field_validator("disliked_notes")
    @classmethod
    def validate_disliked_notes(cls, notes: Optional[list[str]]) -> Optional[list[str]]:
        if notes is None:
            return notes

        if len(notes) > 50:
            raise ValueError("Maximum 50 disliked notes allowed")

        cleaned: list[str] = []
        for note in notes:
            note = note.strip().lower()
            if not note:
                continue
            if len(note) > 50:
                raise ValueError("Each disliked note must be ≤ 50 characters")
            cleaned.append(note)

        return cleaned


@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Search memories and get recommendations",
    description="Search through memories and get personalized fragrance recommendations."
)
def search_memories(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    use_cache: bool = True
) -> SearchResponse:

    request_q = sanitize_text(request.query, max_length=1000)

    query_embedding = generate_embedding(request_q)
    results = search_similar(query_embedding, str(current_user.id), top_k=5)

    chunk_ids = results['ids'][0] if results['ids'] else []
    chunks = db.query(MemoryChunk).filter(MemoryChunk.id.in_(chunk_ids)).all()
    context = "\n\n".join([f"Memory: {c.content}" for c in chunks])

    logger.info(f"Context being sent to LLM: {context[:500]}...")
    cache_key_data = f"{current_user.id}:{context}:{request_q}"

    # Check exact cache hit
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

            return SearchResponse(
                query_id=str(query_log.id),
                response=cached_response,
                sources=[str(c.memory_id) for c in chunks],
                cached=True
            )

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

            return SearchResponse(
                query_id=str(query_log.id),
                response=similar_response,
                sources=[str(c.memory_id) for c in chunks],
                cached=True
            )

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

    llm_response = response.choices[0].message.content or ""

    usage = response.usage
    if usage and hasattr(usage, 'prompt_tokens_details'):
        cached_tokens = getattr(usage.prompt_tokens_details, 'cached_tokens', 0)
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

    return SearchResponse(
        query_id=str(query_log.id),
        response=llm_response,
        sources=[str(c.memory_id) for c in chunks],
        cached=False
    )


@router.post(
    "/{query_id}/feedback",
    response_model=FeedbackResponse,
    summary="Submit feedback for a query",
    description="Submit rating and optional feedback for a query response."
)
def submit_feedback(
    query_id: uuid.UUID,
    feedback: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> FeedbackResponse:

    validated_query_id = validate_uuid(query_id)

    query = db.query(QueryLog).filter(
        QueryLog.id == validated_query_id,
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
            if profile.disliked_notes is None:
                profile.disliked_notes = []

            existing = set(profile.disliked_notes)
            for note in feedback.disliked_notes:
                if note not in existing:
                    profile.disliked_notes.append(note)

            flag_modified(profile, "disliked_notes")

            invalidate_user_recommendations(str(current_user.id))
            logger.info(f"Invalidated cache for user {current_user.id} due to preference update")

    db.commit()

    return FeedbackResponse(status="feedback recorded")
