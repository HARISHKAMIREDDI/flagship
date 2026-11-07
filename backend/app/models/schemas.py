"""
Pydantic schemas for all portfolio domain objects.
These are used for request validation and response serialisation.
"""
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, EmailStr


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------
class ProfileBase(BaseModel):
    name: str
    tagline: str
    bio: str
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------
class ProjectBase(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: Optional[str] = None


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------
class ExperienceBase(BaseModel):
    role: str
    company: str
    period: str
    description: str
    sort_order: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(ExperienceBase):
    pass


class ExperienceResponse(ExperienceBase):
    id: int


# ---------------------------------------------------------------------------
# Skill
# ---------------------------------------------------------------------------
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = "general"
    sort_order: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

