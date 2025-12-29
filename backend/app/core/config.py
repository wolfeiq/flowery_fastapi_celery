from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:pass@localhost/scent_memory_test"
    REDIS_URL: str = "redis://localhost:6379/0"
    OPENAI_API_KEY: str = ""
    AUTH_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()