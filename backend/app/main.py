from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import asyncio
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from .api import auth, memories, query, rate_limits, profile, health
from .middleware.rate_limit import rate_limit_middleware
from .core.config import settings
from .core.logging_config import setup_logging
from .middleware.logging_middleware import log_requests
from .websockets.redis_listener import redis_listener
from .websockets.routes import router as websocket_router


#error tracking
if settings.is_production() and settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
            RedisIntegration(),
            CeleryIntegration()
        ],
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
        send_default_pii=False
    )

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting application in {settings.ENVIRONMENT} mode")
    redis_task = asyncio.create_task(redis_listener())
    
    yield
    
    logger.info("Shutting down application")
    redis_task.cancel()
    try:
        await redis_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Scent Memory API",
    version="0.1.0",
    docs_url="/docs" if settings.is_development() else None,
    redoc_url="/redoc" if settings.is_development() else None,
    openapi_url="/openapi.json" if settings.is_development() else None,
    lifespan=lifespan
)

app.middleware("http")(rate_limit_middleware)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    
    if settings.is_production():
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


app.middleware("http")(log_requests)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
    allow_headers=["*"],
    max_age=600
)


if settings.is_production():
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "api.thescentmemory.com", 
            "thescentmemory.com",
            "*.thescentmemory.com",
        ]
    )


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(memories.router, prefix="/api/memories", tags=["memories"])
app.include_router(query.router, prefix="/api/query", tags=["query"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(rate_limits.router, prefix="/api", tags=["rate-limits"])
app.include_router(health.router, tags=["health"]) 
app.include_router(websocket_router)


@app.get("/")
def root():
    return {
        "message": "Scent Memory API",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT
    }

logger.info(f"Application initialized in {settings.ENVIRONMENT} mode")