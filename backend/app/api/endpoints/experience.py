"""
Experience endpoint — CRUD for work experience entries.
Public GET, protected POST/PUT/DELETE.
"""
import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.core.supabase import get_supabase
from app.core.security import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter()
TABLE = "experience"


@router.get("", response_model=List[ExperienceResponse])
def list_experience():
    """Return all experience entries ordered by sort_order (public)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).select("*").order("sort_order").execute()
        return result.data or []
    except Exception as exc:
        logger.error("Failed to list experience: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not retrieve experience entries.")


@router.post("", response_model=ExperienceResponse, status_code=201, dependencies=[Depends(get_current_admin)])
def create_experience(payload: ExperienceCreate):
    """Insert a new experience entry (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).insert(payload.model_dump()).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create experience entry.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error creating experience entry: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not create experience entry.")


@router.put("/{experience_id}", response_model=ExperienceResponse, dependencies=[Depends(get_current_admin)])
def update_experience(experience_id: int, payload: ExperienceUpdate):
    """Update an experience entry by ID (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).update(payload.model_dump()).eq("id", experience_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Experience entry not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error updating experience entry %d: %s", experience_id, str(exc))
        raise HTTPException(status_code=500, detail="Could not update experience entry.")


@router.delete("/{experience_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_experience(experience_id: int):
    """Delete an experience entry by ID (admin only)."""
    try:
        sb = get_supabase()
        sb.table(TABLE).delete().eq("id", experience_id).execute()
    except Exception as exc:
        logger.error("Error deleting experience entry %d: %s", experience_id, str(exc))
        raise HTTPException(status_code=500, detail="Could not delete experience entry.")
