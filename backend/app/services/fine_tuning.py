from openai import OpenAI
from ..core.config import settings
from ..database import SessionLocal
from ..models import QueryLog, TrainingExample, FineTuningJob, JobStatus
import json
from datetime import datetime

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_training_data(min_rating: int = 4, limit: int = 1000):

    db = SessionLocal()
    
    try:

        queries = db.query(QueryLog).filter(
            QueryLog.rating >= min_rating,
            QueryLog.llm_response.isnot(None)
        ).limit(limit).all()
        
        print(f"Found {len(queries)} high-rated queries")
        
        training_examples = []
        for query in queries:

            exists = db.query(TrainingExample).filter_by(
                prompt=query.query_text,
                completion=query.llm_response
            ).first()
            
            if exists:
                continue

            example = TrainingExample(
                user_id=query.user_id,
                prompt=query.query_text,
                completion=query.llm_response,
                quality_score=query.rating / 5.0,
                source='query_log'
            )
            db.add(example)
            
            training_examples.append({
                "messages": [
                    {"role": "system", "content": "You are a personal fragrance advisor based on user memories."},
                    {"role": "user", "content": query.query_text},
                    {"role": "assistant", "content": query.llm_response}
                ]
            })
        
        db.commit()
        print(f"Created {len(training_examples)} new training examples")
        
        return training_examples
    
    finally:
        db.close()


def export_training_file(training_examples: list) -> str:
    """Export to JSONL format"""
    filename = f"training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jsonl"
    
    with open(filename, 'w') as f:
        for example in training_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"Exported to {filename}")
    return filename


def start_fine_tuning(training_file_path: str, model: str = "gpt-4o-mini-2024-07-18"):
    db = SessionLocal()
    
    try:
        with open(training_file_path, 'rb') as f:
            file_response = client.files.create(
                file=f,
                purpose='fine-tune'
            )
        
        print(f"Uploaded file: {file_response.id}")
        
        job = client.fine_tuning.jobs.create(
            training_file=file_response.id,
            model=model
        )
        
        print(f"Started job: {job.id}")
        
        ft_job = FineTuningJob(
            model_name=f"scent_advisor_{datetime.now().strftime('%Y%m%d')}",
            status=JobStatus.RUNNING,
            training_file_id=file_response.id,
            openai_job_id=job.id,
            training_example_count=sum(1 for _ in open(training_file_path))
        )
        db.add(ft_job)
        db.commit()
        
        return ft_job.id
    
    finally:
        db.close()


def check_job_status(job_id: str):
    db = SessionLocal()
    
    try:
        ft_job = db.query(FineTuningJob).filter_by(id=job_id).first()
        if not ft_job:
            return {"error": "Job not found"}
        
        openai_job = client.fine_tuning.jobs.retrieve(ft_job.openai_job_id)
        
        if openai_job.status == 'succeeded':
            ft_job.status = JobStatus.COMPLETED
            ft_job.fine_tuned_model_id = openai_job.fine_tuned_model
            ft_job.completed_at = datetime.now()
        elif openai_job.status == 'failed':
            ft_job.status = JobStatus.FAILED
            ft_job.error_message = openai_job.error.message if openai_job.error else "Unknown error"
        
        db.commit()
        
        return {
            "status": ft_job.status,
            "model_id": ft_job.fine_tuned_model_id,
            "openai_status": openai_job.status
        }
    
    finally:
        db.close()