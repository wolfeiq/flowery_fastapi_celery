from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50)) 
    description = Column(Text)
    synonyms = Column(ARRAY(String))  

    fragrances = relationship("Fragrance", secondary="fragrance_notes", back_populates="note_objects")
