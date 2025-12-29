from sqlalchemy import Column, ForeignKey, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base

class SpotifyLink(Base):
    __tablename__ = "spotify_links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    memory_id = Column(UUID(as_uuid=True), ForeignKey("scent_memories.id", ondelete="CASCADE"), nullable=False, index=True)
    track_id = Column(String(100), nullable=False)
    track_name = Column(String(255))
    artist_name = Column(String(255))
    album_name = Column(String(255))
    preview_url = Column(String(500))
    spotify_url = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    memory = relationship("ScentMemory", back_populates="spotify_links")