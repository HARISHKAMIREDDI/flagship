"""
Auth endpoint — Supabase email/password sign-in.
Returns the Supabase access token for use in subsequent admin requests.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import AdminLoginRequest, AdminLoginResponse
from app.core.supabase import get_supabase

router = APIRouter()


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest):
    """
    Authenticate an admin user via Supabase Auth.
    Returns a JWT access token on success.
    """
    try:
        sb = get_supabase()
        response = sb.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
        session = response.session
        user = response.user
        if not session or not user:
            raise HTTPException(status_code=401, detail="Invalid credentials.")

        return AdminLoginResponse(
            access_token=session.access_token,
            user_id=str(user.id),
            email=user.email or payload.email,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {exc}")

