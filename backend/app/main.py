from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, memories, query, spotify, rate_limits
from .api import profile
from .api import fine_tuning
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .middleware.rate_limit import rate_limit_middleware
from .core.config import settings
from .core.logging_config import setup_logging
from .middleware.logging_middleware import log_requests
from .api import auth, memories, query, profile, fine_tuning, music
import asyncio
from .websockets.redis_listener import redis_listener
from .api.endpoints import health

#from fastapi import WebSocket, WebSocketDisconnect
#from .websocket import manager
from .websockets.routes import router as websocket_router
#from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

#Will deploy with nginx + SSL certificate -> with Docker


import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

if settings.ENVIRONMENT == "production" and settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
            RedisIntegration(),
            CeleryIntegration()
        ],
        traces_sample_rate=0.1,  # 10% of requests for performance monitoring
        profiles_sample_rate=0.1,
        send_default_pii=False  # Don't send user data
    )
logger = setup_logging()

#sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI(
    title="Scent Memory API",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None
)

app.middleware("http")(log_requests)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=600
)

app.middleware("http")(rate_limit_middleware)

if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["api.scentmemory.com", "*.scentmemory.com"]
    )

#if settings.ENVIRONMENT == "production":
    #app.add_middleware(HTTPSRedirectMiddleware)

#app.mount("/ws", socket_app)

@app.on_event("startup")
async def start_redis_listener():
    asyncio.create_task(redis_listener())

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(memories.router, prefix="/api/memories", tags=["memories"])
app.include_router(query.router, prefix="/api/query", tags=["query"])
#app.include_router(spotify.router, prefix="/api/spotify", tags=["spotify"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(rate_limits.router, prefix="/api", tags=["rate-limits"])
app.include_router(health.router, prefix="/api", tags=["health"])
#app.include_router(fine_tuning.router, prefix="/api/fine-tuning", tags=["fine-tuning"])
#app.include_router(music.router, prefix="/api/v1/music", tags=["music"])
app.include_router(websocket_router)

#app.mount("/ws", socket_app)
#app = socketio.ASGIApp(sio, app)

@app.get("/")
def root():
    return {"message": "Scent Memory API v0.1"}

logger.info(f"Application started in {settings.ENVIRONMENT} mode")