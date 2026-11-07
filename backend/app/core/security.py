"""
Authentication & Authorization Security Dependencies.
Verifies Supabase JWTs and restricts access to allowlisted administrators.
"""
import logging
from typing import Dict, Any, Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.supabase import create_auth_client

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


def verify_token(token: str) -> Dict[str, Any]:
    """
    Cryptographically verify the Supabase JWT.
    Uses local HS256 verification if SUPABASE_JWT_SECRET is set,
    otherwise verifies through the Supabase Auth API.
    """
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_signature": True, "require": ["exp", "sub"]},
            )
            email = payload.get("email")
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing subject identifier.",
                )
            return {"id": user_id, "email": email}
        except jwt.ExpiredSignatureError:
            logger.info("Provided token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired.",
            )
        except jwt.PyJWTError as exc:
            logger.warning("JWT verification failed: %s", str(exc))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
            )

    # Supabase Auth API validation
    try:
        auth_client = create_auth_client()
        user_resp = auth_client.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
            )
        return {"id": str(user_resp.user.id), "email": user_resp.user.email}
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Supabase token validation error: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials.",
        )


def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    FastAPI dependency that enforces authentication and admin allowlist.
    Returns 401 if missing or invalid credentials.
    Returns 403 if authenticated user is not in ADMIN_EMAILS.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Bearer required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_info = verify_token(credentials.credentials)
    user_email = user_info.get("email")

    allowed_emails = [e.lower() for e in settings.ADMIN_EMAILS]
    if not user_email or user_email.lower() not in allowed_emails:
        logger.warning("Unauthorized write attempt by non-admin: %s", user_email)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User does not have administrator privileges.",
        )

    return user_info

