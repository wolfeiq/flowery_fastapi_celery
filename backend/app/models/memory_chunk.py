from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, Table, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base
from sqlalchemy.sql import func

class MemoryChunk(Base):
    __tablename__ = "memory_chunks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    memory_id = Column(UUID(as_uuid=True), ForeignKey("scent_memories.id", ondelete="CASCADE"), nullable=False, index=True)
    
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    
    vector_id = Column(Text, unique=True, index=True)
    embedding_model = Column(Text)
    
  
    chunk_metadata = Column(JSON)  
    

    char_count = Column(Integer)
    word_count = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    memory = relationship("ScentMemory", back_populates="chunks")
    
    __table_args__ = (
        Index('idx_memory_order', 'memory_id', 'chunk_index'),
    )