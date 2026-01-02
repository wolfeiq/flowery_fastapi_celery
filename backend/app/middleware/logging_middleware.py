from fastapi import Request
import logging
import time

logger = logging.getLogger("scent_memory")
audit_logger = logging.getLogger("security_audit")

async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    logger.info(f"Request: {request.method} {request.url.path}")
    
    if "/auth/" in request.url.path:
        audit_logger.info(f"Auth attempt: {request.method} {request.url.path} from {request.client.host}")
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    logger.info(f"Response: {response.status_code} in {duration:.2f}s")
    
    if response.status_code in [401, 403]:
        audit_logger.warning(f"Unauthorized access: {request.method} {request.url.path} from {request.client.host}")
    
    return response