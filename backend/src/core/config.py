"""Configuration management for AI Chatbot."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str
    
    # Authentication (Better Auth)
    better_auth_secret: str
    better_auth_url: str
    
    # Cohere AI
    cohere_api_key: str = ""
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
