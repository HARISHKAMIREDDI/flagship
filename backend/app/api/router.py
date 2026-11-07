from fastapi import APIRouter
from app.api.endpoints import portfolio, auth, profile, projects, experience, skills, chat

api_router = APIRouter()

# Health check
api_router.include_router(portfolio.router, tags=["health"])

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Portfolio data
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(experience.router, prefix="/experience", tags=["experience"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])

# AI Chat Agent (LangGraph + Gemini + Supabase)
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
