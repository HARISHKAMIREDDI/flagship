"""
Chat endpoint for KAIROS — Harish Kamireddi's AI Digital Twin.
Powered by LangGraph RAG Agent with Gemini and Supabase pgvector.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.rag_agent import run_agent

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    timestamp: str


@router.post("", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest):
    """
    Execute LangGraph RAG pipeline:
    Retrieves portfolio context & embeddings, executes Gemini 1.5, returns response.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        reply = run_agent(
            user_message=payload.message,
            system_prompt=payload.system_prompt or ""
        )
        return ChatResponse(
            response=reply,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(exc)}")

