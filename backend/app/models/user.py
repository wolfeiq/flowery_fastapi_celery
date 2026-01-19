from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.sql import func
from ..database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) 


    memories = relationship("ScentMemory", back_populates="user", cascade="all, delete-orphan")
    scent_profile = relationship("ScentProfile", back_populates="user", uselist=False)
    queries = relationship("QueryLog", back_populates="user") 
    fragrances = relationship("UserFragrance", back_populates="user") 
