#!/bin/bash
set -e

echo "Waiting for database..."
while ! pg_isready -h postgres -p 5432 -U scent_user 2>/dev/null; do
  sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
