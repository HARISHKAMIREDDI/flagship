import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Portfolio Platform"
    ENVIRONMENT: str = "development"

    # Supabase configurations
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Admin access allowlist
    ADMIN_EMAILS: Union[str, List[str]] = ["harishkamireddi@zohomail.in"]

    # Gemini API configurations
    GEMINI_API_KEY: str = ""

    # CORS Origins
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("ADMIN_EMAILS", mode="before")
    @classmethod
    def assemble_admin_emails(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [email.strip().lower() for email in v.split(",") if email.strip()]
        elif isinstance(v, list):
            return [str(email).strip().lower() for email in v if str(email).strip()]
        return []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]], values) -> List[str]:
        origins: List[str] = []
        if isinstance(v, str):
            origins = [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            origins = [str(i).strip() for i in v if str(i).strip()]
        else:
            origins = []

        # Enforce no wildcard in production
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env == "production":
            if not origins:
                raise ValueError("BACKEND_CORS_ORIGINS must be explicitly configured in production.")
            if "*" in origins:
                raise ValueError("Wildcard '*' CORS origins are forbidden in production.")

        return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
