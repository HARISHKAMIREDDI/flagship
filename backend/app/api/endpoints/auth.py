"""
Auth endpoint — Supabase email/password sign-in with rate limiting and audit logging.
"""
import logging
from fastapi import APIRouter, HTTPException, Request, status
from app.models.schemas import AdminLoginRequest, AdminLoginResponse
from app.core.supabase import create_auth_client
from app.core.config import settings
from app.core.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/login", response_model=AdminLoginResponse)
@limiter.limit("5/minute")
def admin_login(request: Request, payload: AdminLoginRequest):
    """
    Authenticate an admin user via Supabase Auth.
    Enforces rate limiting, email allowlist, and logs errors server-side.
    """
    email_clean = payload.email.strip().lower()

    # Pre-check allowlist before hitting Supabase to avoid unnecessary auth attempts
    allowed_emails = [e.lower() for e in settings.ADMIN_EMAILS]
    if email_clean not in allowed_emails:
        logger.warning("Rejected login attempt for non-allowlisted email: %s", email_clean)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User is not an authorized administrator.",
        )

    try:
        # Use an isolated, short-lived client for auth to prevent mutating the shared service client
        auth_client = create_auth_client()
        response = auth_client.auth.sign_in_with_password(
            {"email": email_clean, "password": payload.password}
        )

        session = response.session
        user = response.user
        if not session or not user:
            logger.warning("Sign-in succeeded without session/user payload for %s", email_clean)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        logger.info("Admin successfully authenticated: %s", email_clean)
        return AdminLoginResponse(
            access_token=session.access_token,
            user_id=str(user.id),
            email=user.email or email_clean,
        )

    except HTTPException:
        raise
    except Exception as exc:
        # Log exception details server-side only; never return raw error messages to clients
        logger.warning("Authentication failure for %s: %s", email_clean, str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
