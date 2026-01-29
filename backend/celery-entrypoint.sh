#!/bin/bash
set -e

echo "Waiting for Redis..."
until redis-cli -u "$REDIS_URL" ping 2>/dev/null; do
  sleep 2
done

echo "Starting Celery worker with concurrency=${CELERY_CONCURRENCY:-2}..."
exec celery -A app.tasks.celery_app worker \
    --loglevel=info \
    --concurrency=${CELERY_CONCURRENCY:-2}
