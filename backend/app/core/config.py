import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered IT Support Assistant"
    GEMINI_API_KEY: Optional[str] = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    DATABASE_URL: str = "sqlite:///./support_assistant.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
