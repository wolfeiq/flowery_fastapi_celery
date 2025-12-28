from sqlalchemy import Column, ForeignKey, Text, Integer, DateTime, String, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSON
from enum import Enum
import uuid
from sqlalchemy.orm import relationship
from ..database import Base
from sqlalchemy.sql import func

class QueryType(str, Enum):
    RECOMMENDATION = "recommendation"
    MEMORY_SEARCH = "memory_search"
    COMPARISON = "comparison"

class QueryLog(Base):
    __tablename__ = "query_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    

    query_text = Column(Text, nullable=False)
    query_type = Column(SQLEnum(QueryType))
    
 
    retrieved_chunks = Column(JSON) 
    context_used = Column(Text)     

    llm_response = Column(Text, nullable=False)
    model_version = Column(String(100)) 
    
    
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    latency_ms = Column(Integer)
    
  
    rating = Column(Integer) 
    feedback_text = Column(Text)
    feedback_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    user = relationship("User", back_populates="queries")
    recommendations = relationship("Recommendation", back_populates="query", cascade="all, delete-orphan")