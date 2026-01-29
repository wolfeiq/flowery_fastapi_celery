"""Application configuration using Pydantic settings."""

from typing import List, Optional

from pydantic import field_validator, ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
   
    DATABASE_URL: str
    OPENAI_API_KEY: str
    AUTH_KEY: str
    GENIUS_ACCESS_TOKEN: str = ""
    ADMIN_EMAILS: str = ""
    REDIS_URL: Optional[str] = None
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    CHROMA_HOST: str = "chromadb"
    CHROMA_PORT: int = 8000
    CHROMA_AUTH_TOKEN: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


    ENVIRONMENT: str = "development"
    DEBUG: bool = False


    ALLOWED_ORIGINS: str = ""


    SENTRY_DSN: Optional[str] = None


    RATE_LIMIT_PER_MINUTE: int = 100
    UPLOAD_LIMIT_PER_DAY: int = 3
    QUERY_LIMIT_PER_DAY: int = 4
    PROFILE_UPDATE_LIMIT_PER_DAY: int = 1

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if self.ENVIRONMENT == "production":
            return [
                "https://thescentmemory.com",
                "https://www.thescentmemory.com",
            ]
        else:
            origins = [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
            ]

            if self.ALLOWED_ORIGINS:
                for origin in self.ALLOWED_ORIGINS.split(","):
                    stripped = origin.strip()
                    if stripped and stripped not in origins:
                        origins.append(stripped)
            return origins

    @property
    def admin_email_list(self) -> list[str]:
        return [e.strip() for e in self.ADMIN_EMAILS.split(",") if e.strip()]

    @property
    def redis_url_computed(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    @property
    def chroma_url(self) -> str:
        return f"http://{self.CHROMA_HOST}:{self.CHROMA_PORT}"

    @field_validator("AUTH_KEY")
    @classmethod
    def validate_auth_key(cls, v: str) -> str:
        if not v:
            raise ValueError("AUTH_KEY is required and cannot be empty")
        if len(v) < 32:
            raise ValueError("AUTH_KEY must be at least 32 characters for security")
        return v

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError("DATABASE_URL is required")
        return v

    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_openai_key(cls, v: str) -> str:
        if not v:
            raise ValueError("OPENAI_API_KEY is required")
        if v.lower() in ["test_key", "your_key_here", "changeme"]:
            raise ValueError("OPENAI_API_KEY appears to be a placeholder - use a real API key")
        return v

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        valid_envs = ["development", "staging", "production"]
        if v not in valid_envs:
            raise ValueError(f"ENVIRONMENT must be one of {valid_envs}")
        return v

    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()
