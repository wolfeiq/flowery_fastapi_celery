from sqlalchemy import Column, ForeignKey, JSON, Integer, DateTime, String
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.sql import func
import uuid
from ..database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped, mapped_column


class ScentProfile(Base):
    __tablename__ = "scent_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_families = Column(ARRAY(String), default=list) 
    note_occurrence_counts = Column(JSONB, default=dict)
    disliked_notes = Column(ARRAY(String), default=list)            
    emotional_preferences: Mapped[list] = mapped_column(ARRAY(String))                              
    total_memories = Column(Integer, default=0)
    total_queries = Column(Integer, default=0)
    profile_data = Column(JSON, default=dict)  
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="scent_profile")


    #profile.note_occurrence_counts = {
    #"top": {"citrus": 5, "bergamot": 3},
    #"heart": {"rose": 4, "jasmine": 2},
    #"base": {"vanilla": 6, "sandalwood": 3}
   #}