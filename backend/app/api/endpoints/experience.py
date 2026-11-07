"""
Experience endpoint — full CRUD for work experience entries.
Table: experience (id, role, company, period, description, sort_order)
"""
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.core.supabase import get_supabase

router = APIRouter()
TABLE = "experience"


@router.get("", response_model=List[ExperienceResponse])
def list_experience():
    """Return all experience entries ordered by sort_order."""
    sb = get_supabase()
    result = sb.table(TABLE).select("*").order("sort_order").execute()
    return result.data


@router.post("", response_model=ExperienceResponse, status_code=201)
def create_experience(payload: ExperienceCreate):
    """Insert a new experience entry."""
    sb = get_supabase()
    result = sb.table(TABLE).insert(payload.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create experience entry.")
    return result.data[0]


@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(experience_id: int, payload: ExperienceUpdate):
    """Update an experience entry by ID."""
    sb = get_supabase()
    result = sb.table(TABLE).update(payload.model_dump()).eq("id", experience_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Experience entry not found.")
    return result.data[0]


@router.delete("/{experience_id}", status_code=204)
def delete_experience(experience_id: int):
    """Delete an experience entry by ID."""
    sb = get_supabase()
    sb.table(TABLE).delete().eq("id", experience_id).execute()

