"""
Profile endpoint — portfolio owner profile management.
Public GET, protected PUT.
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ProfileResponse, ProfileUpdate
from app.core.supabase import get_supabase
from app.core.security import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter()
TABLE = "profiles"


@router.get("", response_model=ProfileResponse)
def get_profile():
    """Return the single portfolio owner profile row (public)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).select("*").limit(1).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to fetch profile: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not retrieve profile.")


@router.put("/{profile_id}", response_model=ProfileResponse, dependencies=[Depends(get_current_admin)])
def update_profile(profile_id: int, payload: ProfileUpdate):
    """Update the portfolio owner profile (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).update(payload.model_dump()).eq("id", profile_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update profile %d: %s", profile_id, str(exc))
        raise HTTPException(status_code=500, detail="Failed to update profile.")
