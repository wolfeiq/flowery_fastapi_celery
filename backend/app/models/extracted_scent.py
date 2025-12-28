import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Float, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ExtractedScent(Base):
    """Scents mentioned/detected in memories"""
    __tablename__ = "extracted_scents"
    
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    

    memory_id = Column(
        UUID(as_uuid=True),
        ForeignKey("scent_memories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
   
    fragrance_id = Column(
        UUID(as_uuid=True),
        ForeignKey("fragrances.id", ondelete="SET NULL"),  
        nullable=True,  
        index=True,
    )
    

    scent_name = Column(String(255)) 
    brand = Column(String(100))      
    notes = Column(ARRAY(String))     
    description = Column(Text)        
    

    confidence = Column(Float, nullable=False)
    source = Column(String(50), nullable=False)  
    extraction_method = Column(String(50)) 
   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
  
    memory = relationship("ScentMemory", back_populates="extracted_scents")
    fragrance = relationship("Fragrance") 
    
    def __repr__(self):
        return f"<ExtractedScent(scent_name='{self.scent_name}', confidence={self.confidence})>"