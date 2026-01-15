from celery import Celery
from ..core.config import settings

celery_app = Celery("scent_memory", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.update(task_serializer='json', accept_content=['json'], result_serializer='json', timezone='UTC')


#sudo systemctl stop redis
#sudo systemctl start redis
#redis-server
#redis-cli ping
#celery -A app.tasks.celery_app worker --loglevel=info from backend
#uvicorn app.main:app --reload

#Celery for tasks that are:
#slow
#CPU / network heavy
#not required to finish before the API responds
#uvicorn app.main:app --reload