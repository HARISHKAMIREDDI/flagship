"""
Projects endpoint — CRUD for portfolio projects.
Public GET, protected POST/PUT/DELETE.
"""
import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.core.supabase import get_supabase
from app.core.security import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter()
TABLE = "projects"


@router.get("", response_model=List[ProjectResponse])
def list_projects(featured_only: bool = False):
    """Return all projects, optionally filtered to featured only (public)."""
    try:
        sb = get_supabase()
        query = sb.table(TABLE).select("*").order("created_at", desc=True)
        if featured_only:
            query = query.eq("featured", True)
        result = query.execute()
        return result.data or []
    except Exception as exc:
        logger.error("Failed to list projects: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not retrieve projects.")


@router.post("", response_model=ProjectResponse, status_code=201, dependencies=[Depends(get_current_admin)])
def create_project(payload: ProjectCreate):
    """Insert a new project record (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).insert(payload.model_dump()).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create project.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error creating project: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not create project.")


@router.put("/{project_id}", response_model=ProjectResponse, dependencies=[Depends(get_current_admin)])
def update_project(project_id: int, payload: ProjectUpdate):
    """Update an existing project by ID (admin only)."""
    try:
        sb = get_supabase()
        result = sb.table(TABLE).update(payload.model_dump()).eq("id", project_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error updating project %d: %s", project_id, str(exc))
        raise HTTPException(status_code=500, detail="Could not update project.")


@router.delete("/{project_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_project(project_id: int):
    """Delete a project by ID (admin only)."""
    try:
        sb = get_supabase()
        sb.table(TABLE).delete().eq("id", project_id).execute()
    except Exception as exc:
        logger.error("Error deleting project %d: %s", project_id, str(exc))
        raise HTTPException(status_code=500, detail="Could not delete project.")
