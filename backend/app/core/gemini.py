"""
Gemini client helpers.
Initialises the google-generativeai SDK once and exposes:
  - get_chat_model()   → GenerativeModel for text generation
  - embed_text(text)   → List[float] using text-embedding-004
"""
import google.generativeai as genai
from app.core.config import settings

_configured = False


def _configure():
    global _configured
    if not _configured:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


def get_chat_model(system_instruction: str = "") -> genai.GenerativeModel:
    _configure()
    kwargs = {"model_name": "gemini-1.5-flash"}
    if system_instruction:
        kwargs["system_instruction"] = system_instruction
    return genai.GenerativeModel(**kwargs)


def embed_text(text: str) -> list[float]:
    """Return a 768-dim embedding vector for the given text."""
    _configure()
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_query",
    )
    return result["embedding"]

