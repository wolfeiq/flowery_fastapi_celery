from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta, date
import redis
import logging
import jwt
from ..core.config import settings

logger = logging.getLogger(__name__)


redis_client = redis.Redis.from_url(settings.redis_url_computed, decode_responses=True)

def get_user_id_from_token(request: Request) -> str | None:
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.replace("Bearer ", "")
        payload = jwt.decode(token, settings.AUTH_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        logger.warning(f"Error decoding token: {e}")
        return None

def get_user_id_from_request(request: Request) -> str | None:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        user_id = get_user_id_from_token(request)
    return user_id

def check_rate_limit(key: str, limit: int, window_seconds: int) -> dict:
    try:
        current = redis_client.get(key)
        current_count = int(current) if current else 0
        
        if current_count >= limit:
            ttl = redis_client.ttl(key)
            reset_at = datetime.utcnow() + timedelta(seconds=ttl) if ttl > 0 else None
            
            return {
                "allowed": False,
                "remaining": 0,
                "used": current_count,
                "limit": limit,
                "reset_at": reset_at.isoformat() if reset_at else None
            }
        
        return {
            "allowed": True,
            "remaining": limit - current_count,
            "used": current_count,
            "limit": limit
        }
    except Exception as e:
        logger.warning(f"Rate limit check failed: {e}")
        return {"allowed": True, "remaining": limit}

def increment_rate_limit(key: str, window_seconds: int):
    try:
        current = redis_client.incr(key)
        if current == 1:
            redis_client.expire(key, window_seconds)
        logger.debug(f"Incremented {key} to {current}")
    except Exception as e:
        logger.warning(f"Failed to increment rate limit: {e}")

def create_rate_limit_response(status_code: int, content: dict, origin: str = None):
    response = JSONResponse(
        status_code=status_code,
        content=content
    )

    if origin and origin in settings.cors_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

async def rate_limit_middleware(request: Request, call_next):

    if request.method == "OPTIONS":
        return await call_next(request)

    skip_paths = ["/", "/health", "/docs", "/openapi.json", "/api/auth/login", "/api/auth/register"]
    if request.url.path in skip_paths or "/admin/" in request.url.path:
        return await call_next(request)

    origin = request.headers.get("origin")
    user_id = get_user_id_from_request(request)

    if request.url.path == "/api/memories/upload" and request.method == "POST":
        if user_id:
            today = date.today().isoformat()
            key = f"upload_limit:{user_id}:{today}"
            
            limit_check = check_rate_limit(
                key, 
                limit=settings.UPLOAD_LIMIT_PER_DAY, 
                window_seconds=86400
            )
            
            if not limit_check["allowed"]:
                return create_rate_limit_response(
                    status_code=429,
                    content={
                        "detail": {
                            "error": "Daily upload limit reached",
                            "message": f"You can upload a maximum of {settings.UPLOAD_LIMIT_PER_DAY} memories per day. Try again tomorrow!",
                            "limit": limit_check["limit"],
                            "used": limit_check["used"],
                            "remaining": 0,
                            "reset_at": limit_check["reset_at"]
                        }
                    },
                    origin=origin
                )
            
            response = await call_next(request)
            
            if 200 <= response.status_code < 300:
                increment_rate_limit(key, window_seconds=86400)
            
            return response
        
        return await call_next(request)
    
    if request.url.path == "/api/query/search" and request.method == "POST":
        if user_id:
            today = date.today().isoformat()
            key = f"query_limit:{user_id}:{today}"
            
            limit_check = check_rate_limit(
                key, 
                limit=settings.QUERY_LIMIT_PER_DAY, 
                window_seconds=86400
            )
            
            if not limit_check["allowed"]:
                return create_rate_limit_response(
                    status_code=429,
                    content={
                        "detail": {
                            "error": "Daily query limit reached",
                            "message": f"You can make a maximum of {settings.QUERY_LIMIT_PER_DAY} queries per day. Try again tomorrow!",
                            "limit": limit_check["limit"],
                            "used": limit_check["used"],
                            "remaining": 0,
                            "reset_at": limit_check["reset_at"]
                        }
                    },
                    origin=origin
                )
            
            response = await call_next(request)
            
            if 200 <= response.status_code < 300:
                increment_rate_limit(key, window_seconds=86400)
            
            return response
        
        return await call_next(request)

    if request.url.path.startswith("/api/profile") and request.method in ["PUT", "PATCH", "POST"]:
        if user_id:
            today = date.today().isoformat()
            key = f"profile_update_limit:{user_id}:{today}"
            
            limit_check = check_rate_limit(
                key, 
                limit=settings.PROFILE_UPDATE_LIMIT_PER_DAY, 
                window_seconds=86400
            )
            
            if not limit_check["allowed"]:
                return create_rate_limit_response(
                    status_code=429,
                    content={
                        "detail": {
                            "error": "Daily profile update limit reached",
                            "message": f"You can update your profile {settings.PROFILE_UPDATE_LIMIT_PER_DAY} time per day. Try again tomorrow!",
                            "limit": limit_check["limit"],
                            "used": limit_check["used"],
                            "remaining": 0,
                            "reset_at": limit_check["reset_at"]
                        }
                    },
                    origin=origin
                )
            
            response = await call_next(request)
            
            if 200 <= response.status_code < 300:
                increment_rate_limit(key, window_seconds=86400)
            
            return response
        
        return await call_next(request)
    
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"
    
    limit_check = check_rate_limit(
        key, 
        limit=settings.RATE_LIMIT_PER_MINUTE, 
        window_seconds=60
    )
    
    if not limit_check["allowed"]:
        return create_rate_limit_response(
            status_code=429,
            content={
                "detail": "Too many requests. Please try again later."
            },
            origin=origin
        )
    
    response = await call_next(request)
    
    increment_rate_limit(key, window_seconds=60)
    
    return response