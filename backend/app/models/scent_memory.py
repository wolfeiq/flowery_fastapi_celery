import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, Text, Boolean, DateTime, String, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from ..database import Base

class MemoryType(str, Enum):
    TEXT = "text"
    PHOTO = "photo"
    PDF = "pdf"


class ScentMemory(Base):
    
    __tablename__ = "scent_memories"
   
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),  nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    memory_type = Column(SQLEnum(MemoryType, name="memory_type_enum"), nullable=False, index=True)
    occasion = Column(String(100)) 
    emotion = Column(String(100))  
    season = Column(String(20)) 
    location = Column(String(200))  
    file_path = Column(String(500))
    file_size = Column(Integer)  
    mime_type = Column(String(100))
    processed = Column(Boolean, default=False, nullable=False, index=True)
    processing_error = Column(Text)  
    processed_at = Column(DateTime(timezone=True))
    chunk_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="memories")
    chunks = relationship("MemoryChunk", back_populates="memory", cascade="all, delete-orphan", lazy="select")
    image_analysis = relationship("ImageAnalysis", back_populates="memory", uselist=False,cascade="all, delete-orphan")
    extracted_scents = relationship("ExtractedScent", back_populates="memory", cascade="all, delete-orphan")
    spotify_links = relationship("SpotifyLink", back_populates="memory", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ScentMemory(id={self.id}, title='{self.title}', type={self.memory_type})>"