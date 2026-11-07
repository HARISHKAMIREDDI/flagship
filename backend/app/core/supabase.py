"""
Supabase client singleton.
Initialised once from settings and reused across all endpoints.
"""
from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """Return the shared Supabase client, creating it on first call."""
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in the .env file."
            )
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client

