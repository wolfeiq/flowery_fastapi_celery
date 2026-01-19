import uuid
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, ForeignKey



class TrainingExample(Base):
    __tablename__ = "training_examples"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    prompt = Column(Text, nullable=False)
    completion = Column(Text, nullable=False)
    quality_score = Column(Float) 
    source = Column(String(50))  
    included_in_training = Column(Boolean, default=False)
    training_job_id = Column(UUID(as_uuid=True), ForeignKey("fine_tuning_jobs.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    training_job = relationship("FineTuningJob", back_populates="training_examples")