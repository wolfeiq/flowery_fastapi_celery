from sqlalchemy import Column, ForeignKey, JSON, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from sqlalchemy.orm import relationship
from ..database import Base


class ImageAnalysis(Base):
    __tablename__ = "image_analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    memory_id = Column(
        UUID(as_uuid=True),
        ForeignKey("scent_memories.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
  
    detected_objects = Column(ARRAY(String))  
    dominant_colors = Column(ARRAY(String)) 
    mood = Column(String(100))               
    setting = Column(String(100))            
   
    confidence_score = Column(Float)
    model_used = Column(String(100))          
    raw_response = Column(JSON)             
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    memory = relationship("ScentMemory", back_populates="image_analysis")