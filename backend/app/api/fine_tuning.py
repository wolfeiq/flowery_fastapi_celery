from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, FineTuningJob
from .auth import get_current_user
from ..services.fine_tuning import generate_training_data, export_training_file, start_fine_tuning, check_job_status
import uuid
from ..core.security import get_admin_user

router = APIRouter()

@router.post("/generate-training-data")
def create_training_data(
    min_rating: int = 4,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):

    examples = generate_training_data(min_rating=min_rating)
    
    if not examples:
        raise HTTPException(400, "No high-rated queries found")
    
    filename = export_training_file(examples)
    
    return {
        "status": "generated",
        "count": len(examples),
        "filename": filename
    }

@router.post("/start")
def start_training(
    training_file: str,
    current_user: User = Depends(get_current_user)
):

    try:
        job_id = start_fine_tuning(training_file)
        return {"job_id": str(job_id), "status": "started"}
    except Exception as e:
        raise HTTPException(500, f"Failed to start training: {str(e)}")

@router.get("/jobs")
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    jobs = db.query(FineTuningJob).order_by(FineTuningJob.created_at.desc()).all()
    
    return [
        {
            "id": str(job.id),
            "model_name": job.model_name,
            "status": job.status,
            "training_examples": job.training_example_count,
            "created_at": job.created_at,
            "fine_tuned_model_id": job.fine_tuned_model_id
        }
        for job in jobs
    ]

@router.get("/jobs/{job_id}/status")
def get_job_status(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_user)
):

    return check_job_status(str(job_id))