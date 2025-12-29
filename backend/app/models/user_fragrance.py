from sqlalchemy import Column, ForeignKey, Integer, Boolean, Text, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from sqlalchemy.orm import relationship
from ..database import Base

class UserFragrance(Base):
    __tablename__ = "user_fragrances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    fragrance_id = Column(UUID(as_uuid=True), ForeignKey("fragrances.id"), nullable=False, index=True)
    rating = Column(Integer)
    owned = Column(Boolean, default=False)
    wishlist = Column(Boolean, default=False)
    personal_notes = Column(Text)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('user_id', 'fragrance_id', name='unique_user_fragrance'),
    )

    user = relationship("User", back_populates="fragrances")
    fragrance = relationship("Fragrance", back_populates="user_collections")