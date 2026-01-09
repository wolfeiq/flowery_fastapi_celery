from pydantic_settings import BaseSettings
from pydantic import validator

class Settings(BaseSettings):
    ADMIN_EMAILS: str = ""
    DATABASE_URL: str = ""
    REDIS_URL: str = ""
    OPENAI_API_KEY: str = ""
    AUTH_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development" 
    RATE_LIMIT_PER_MINUTE: int = 60
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    GENIUS_ACCESS_TOKEN: str = ""

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    RATE_LIMIT_PER_MINUTE: int = 100 
    UPLOAD_LIMIT_PER_DAY: int = 3
    QUERY_LIMIT_PER_DAY: int = 10
    PROFILE_UPDATE_LIMIT_PER_DAY: int = 1

    @property
    def admin_email_list(self) -> list[str]:
        return [e.strip() for e in self.ADMIN_EMAILS.split(",") if e.strip()]
    
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @validator("AUTH_KEY")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("AUTH_KEY - at least 32 characters")
        return v
    
    class Config:
        env_file = ".env"

settings = Settings()
