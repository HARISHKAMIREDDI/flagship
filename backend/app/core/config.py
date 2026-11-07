import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Portfolio Platform"
    
    # Supabase configurations (to be loaded from env)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Gemini API configurations
    GEMINI_API_KEY: str = ""
    
    # CORS Origins (comma-separated string parsed to list)
    BACKEND_CORS_ORIGINS: str | List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        # Look for a .env file in the backend directory
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
