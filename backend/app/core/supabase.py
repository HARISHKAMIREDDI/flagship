"""
Supabase client singleton and factory.
- get_supabase(): Shared service role client for backend operations.
- create_auth_client(): Fresh, isolated client instance for user auth operations.
"""
from supabase import create_client, Client
from app.core.config import settings

_service_client: Client | None = None


def get_supabase() -> Client:
    """Return the shared service client, creating it on first call."""
    global _service_client
    if _service_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        _service_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _service_client


def create_auth_client() -> Client:
    """
    Return a fresh, isolated Supabase client for auth operations.
    Prevents user sessions from mutating the shared service client.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
