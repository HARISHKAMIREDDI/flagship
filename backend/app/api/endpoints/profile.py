"""
Profile endpoint — single-row portfolio owner profile.
Table: profiles (id, name, tagline, bio, github_url, linkedin_url, email, avatar_url)
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ProfileResponse, ProfileUpdate
from app.core.supabase import get_supabase

router = APIRouter()
TABLE = "profiles"


@router.get("", response_model=ProfileResponse)
def get_profile():
    """Return the single portfolio owner profile row."""
    sb = get_supabase()
    result = sb.table(TABLE).select("*").limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found. Add a row to the profiles table.")
    return result.data[0]


@router.put("/{profile_id}", response_model=ProfileResponse)
def update_profile(profile_id: int, payload: ProfileUpdate):
    """Update the portfolio owner profile."""
    sb = get_supabase()
    result = sb.table(TABLE).update(payload.model_dump()).eq("id", profile_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return result.data[0]

