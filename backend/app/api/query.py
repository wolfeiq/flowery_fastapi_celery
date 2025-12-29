from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from ..database import get_db
from ..models import User, QueryLog, QueryType
from .auth import get_current_user

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    query_type: QueryType = QueryType.RECOMMENDATION

@router.post("/search")
def search_memories(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RAG
    
    # to be changed
    query_log = QueryLog(
        user_id=current_user.id,
        query_text=request.query,
        query_type=request.query_type,
        llm_response="[RAG pipeline not implemented yet]",
        model_version="gpt-4"
    )
    db.add(query_log)
    db.commit()
    
    return {
        "query_id": str(query_log.id),
        "response": "RAG pipeline coming next...",
        "sources": []
    }

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