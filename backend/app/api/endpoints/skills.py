"""
Skills endpoint — full CRUD for skill tags.
Table: skills (id, name, category, sort_order)
"""
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import SkillCreate, SkillUpdate, SkillResponse
from app.core.supabase import get_supabase

router = APIRouter()
TABLE = "skills"


@router.get("", response_model=List[SkillResponse])
def list_skills():
    """Return all skills ordered by sort_order."""
    sb = get_supabase()
    result = sb.table(TABLE).select("*").order("sort_order").execute()
    return result.data


@router.post("", response_model=SkillResponse, status_code=201)
def create_skill(payload: SkillCreate):
    """Insert a new skill."""
    sb = get_supabase()
    result = sb.table(TABLE).insert(payload.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create skill.")
    return result.data[0]


@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, payload: SkillUpdate):
    """Update a skill by ID."""
    sb = get_supabase()
    result = sb.table(TABLE).update(payload.model_dump()).eq("id", skill_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Skill not found.")
    return result.data[0]


@router.delete("/{skill_id}", status_code=204)
def delete_skill(skill_id: int):
    """Delete a skill by ID."""
    sb = get_supabase()
    sb.table(TABLE).delete().eq("id", skill_id).execute()

