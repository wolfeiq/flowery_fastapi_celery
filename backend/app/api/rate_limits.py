from fastapi import APIRouter, Depends
from datetime import date
from ..models import User
from .auth import get_current_user
from ..middleware.rate_limit import redis_client

router = APIRouter()

def get_limit_status(user_id: str, limit_type: str, limit: int) -> dict:
    today = date.today().isoformat()
    key = f"{limit_type}_limit:{user_id}:{today}"
    
    try:
        current = redis_client.get(key)
        used = int(current) if current else 0
        remaining = max(0, limit - used)
        
        ttl = redis_client.ttl(key)
        from datetime import datetime, timedelta
        reset_at = (datetime.utcnow() + timedelta(seconds=ttl)).isoformat() if ttl > 0 else None
        
        return {
            "limit": limit,
            "used": used,
            "remaining": remaining,
            "reset_at": reset_at
        }
    except Exception as e:
        return {
            "limit": limit,
            "used": 0,
            "remaining": limit,
            "error": str(e)
        }

@router.get("/limits")
def get_all_limits(current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    
    return {
        "uploads": get_limit_status(user_id, "upload", 3),
        "queries": get_limit_status(user_id, "query", 10),
        "profile_updates": get_limit_status(user_id, "profile_update", 1)
    }

@router.get("/limits/uploads")
def get_upload_limit(current_user: User = Depends(get_current_user)):
    return get_limit_status(str(current_user.id), "upload", 3)

@router.get("/limits/queries")
def get_query_limit(current_user: User = Depends(get_current_user)):
    return get_limit_status(str(current_user.id), "query", 10)

@router.get("/limits/profile")
def get_profile_update_limit(current_user: User = Depends(get_current_user)):
    return get_limit_status(str(current_user.id), "profile_update", 1)


