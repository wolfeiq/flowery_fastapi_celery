from sqlalchemy.dialects.postgresql import ARRAY
import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, Numeric, Table, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base
from sqlalchemy.sql import func

class Fragrance(Base):
    __tablename__ = "fragrances"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    fragrance_family = Column(String(100))  
    subfamilies = Column(ARRAY(String))
    notes_top = Column(ARRAY(String))
    notes_middle = Column(ARRAY(String))
    notes_base = Column(ARRAY(String))
    intensity = Column(String(50)) 
    longevity = Column(String(50)) 
    launch_year = Column(Integer)
    perfumer = Column(String(200))
    gender = Column(String(20)) 
    price_min = Column(Numeric(10, 2))
    price_max = Column(Numeric(10, 2))
    vector_id = Column(String, index=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    note_objects = relationship("Note", secondary="fragrance_notes")
    user_collections = relationship("UserFragrance", back_populates="fragrance")
    extracted_mentions = relationship("ExtractedScent", back_populates="fragrance")
    recommendations = relationship("Recommendation", back_populates="fragrance")