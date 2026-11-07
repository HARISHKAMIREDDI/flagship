from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=dict)
def health_check():
    """
    Check API Server status and connectivity parameters.
    """
    return {
        "status": "healthy",
        "project_name": settings.PROJECT_NAME,
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }
