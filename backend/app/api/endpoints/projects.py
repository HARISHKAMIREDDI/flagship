"""
Projects endpoint — full CRUD for portfolio projects.
Table: projects (id, title, description, tags, github_url, live_url, featured, created_at)
"""
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.core.supabase import get_supabase

router = APIRouter()
TABLE = "projects"


@router.get("", response_model=List[ProjectResponse])
def list_projects(featured_only: bool = False):
    """Return all projects, optionally filtered to featured only."""
    sb = get_supabase()
    query = sb.table(TABLE).select("*").order("created_at", desc=True)
    if featured_only:
        query = query.eq("featured", True)
    result = query.execute()
    return result.data


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(payload: ProjectCreate):
    """Insert a new project record."""
    sb = get_supabase()
    result = sb.table(TABLE).insert(payload.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create project.")
    return result.data[0]


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, payload: ProjectUpdate):
    """Update an existing project by ID."""
    sb = get_supabase()
    result = sb.table(TABLE).update(payload.model_dump()).eq("id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found.")
    return result.data[0]


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int):
    """Delete a project by ID."""
    sb = get_supabase()
    sb.table(TABLE).delete().eq("id", project_id).execute()

