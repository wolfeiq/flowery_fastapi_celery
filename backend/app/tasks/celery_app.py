import os

from celery import Celery
from ..core.config import settings

celery_app = Celery("scent_memory", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

# Limit concurrency to prevent memory issues on Railway
# Default to 2 workers
CELERY_CONCURRENCY = int(os.getenv("CELERY_CONCURRENCY", "2"))

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    worker_concurrency=CELERY_CONCURRENCY,
    worker_prefetch_multiplier=1,  # Prevent memory bloat from prefetching
    task_acks_late=True,  # Acknowledge after task completes
)


#sudo systemctl stop redis
#sudo systemctl start redis
#redis-server
#redis-cli ping
#celery -A app.tasks.celery_app worker --loglevel=info from backend
#uvicorn app.main:app --reload
