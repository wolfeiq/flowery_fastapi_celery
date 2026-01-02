from fastapi import Request, HTTPException
from datetime import datetime, timedelta
import redis
from ..core.config import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL)

async def rate_limit_middleware(request: Request, call_next):

    if "/admin/" in request.url.path:
        return await call_next(request)
    
    client_id = request.client.host
    key = f"rate_limit:{client_id}"
    
    current = redis_client.get(key)
    if current and int(current) > settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(429, "Too many requests")
    
    pipe = redis_client.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)
    pipe.execute()
    
    return await call_next(request)