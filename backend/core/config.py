import os

# Base directory of the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./backend/data/sql_app.db"
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
