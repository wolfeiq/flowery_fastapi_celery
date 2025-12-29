from sqlalchemy import Column, ForeignKey, Float, Integer, Text, Boolean, DateTime
from sqlalchemy.sql import func
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(UUID(as_uuid=True), ForeignKey("query_logs.id", ondelete="CASCADE"), nullable=False, index=True)
    fragrance_id = Column(UUID(as_uuid=True), ForeignKey("fragrances.id"), nullable=False, index=True)
    rank = Column(Integer, nullable=False)  
    score = Column(Float, nullable=False)
    reasoning = Column(Text) 
    clicked = Column(Boolean, default=False)
    liked = Column(Boolean)
    purchased = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    query = relationship("QueryLog", back_populates="recommendations")
    fragrance = relationship("Fragrance", back_populates="recommendations")