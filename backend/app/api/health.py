from venv import logger
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from datetime import datetime
from ...database import SessionLocal
from ...middleware.rate_limit import redis_client
from ...tasks.celery_app import celery_app
import logging

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0"
    }

@router.get("/health/ready")
def readiness_check():

    checks = {
        "database": False,
        "redis": False,
        "celery": False
    }
    

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        checks["database"] = True
    except Exception as e:
        logger.error("database_health_check_failed", error=str(e))
    

    try:
        redis_client.ping()
        checks["redis"] = True
    except Exception as e:
        logger.error("redis_health_check_failed", error=str(e))

    try:
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        if stats:
            checks["celery"] = True
    except Exception as e:
        logger.error("celery_health_check_failed", error=str(e))
    
    all_healthy = all(checks.values())
    
    if not all_healthy:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "checks": checks,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    return {
        "status": "ready",
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/live")
def liveness_check():
    return {"status": "alive"}