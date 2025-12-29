from sqlalchemy import Column, String, Integer, Text, DateTime, Numeric, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from enum import Enum
import uuid
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
from sqlalchemy.orm import relationship

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class FineTuningJob(Base):
    __tablename__ = "fine_tuning_jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    model_name = Column(String, nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING, index=True)
    training_file_id = Column(String)
    openai_job_id = Column(String, unique=True)
    fine_tuned_model_id = Column(String)
    training_example_count = Column(Integer)
    metrics = Column(JSON) 
    cost_usd = Column(Numeric(10, 2))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    training_examples = relationship("TrainingExample", back_populates="training_job")