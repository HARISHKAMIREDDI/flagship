"""
Skills endpoint — CRUD for skill tags.
Public GET, protected POST/PUT/DELETE.
"""
import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import SkillCreate, SkillUpdate, SkillResponse
from app.core.supabase import get_supabase
from app.core.security import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter()
TABLE = "skills"


@router.get("", response_model=List[SkillResponse])
def list_skills():
    """Return all skills ordered by sort_order (public)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).select("*").order("sort_order").execute()
        return result.data or []
    except Exception as exc:
        logger.error("Failed to list skills: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not retrieve skills.")


@router.post("", response_model=SkillResponse, status_code=201, dependencies=[Depends(get_current_admin)])
def create_skill(payload: SkillCreate):
    """Insert a new skill (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).insert(payload.model_dump()).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create skill.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error creating skill: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not create skill.")


@router.put("/{skill_id}", response_model=SkillResponse, dependencies=[Depends(get_current_admin)])
def update_skill(skill_id: int, payload: SkillUpdate):
    """Update a skill by ID (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).update(payload.model_dump()).eq("id", skill_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Skill not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error updating skill %d: %s", skill_id, str(exc))
        raise HTTPException(status_code=500, detail="Could not update skill.")


@router.delete("/{skill_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_skill(skill_id: int):
    """Delete a skill by ID (admin only)."""
    try:
        sb = get_supabase()
        sb.table(TABLE).delete().eq("id", skill_id).execute()
    except Exception as exc:
        logger.error("Error deleting skill %d: %s", skill_id, str(exc))
        raise HTTPException(status_code=500, detail="Could not delete skill.")
