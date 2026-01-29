#!/bin/bash
set -e

echo "Waiting for database..."
while ! pg_isready -d "$DATABASE_URL" 2>/dev/null; do
  sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
