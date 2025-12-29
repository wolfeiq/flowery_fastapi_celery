from sqlalchemy import Column, ForeignKey, JSON, Integer, DateTime, String
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from ..database import Base
from sqlalchemy.orm import relationship


class ScentProfile(Base):
    __tablename__ = "scent_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_families = Column(ARRAY(String), default=list)  
    disliked_notes = Column(ARRAY(String), default=list)      
    intensity_preference = Column(String(50))                 
    budget_range = Column(String(50))                         
    total_memories = Column(Integer, default=0)
    total_queries = Column(Integer, default=0)
    profile_data = Column(JSON, default=dict)  
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="scent_profile")