"""
LangGraph RAG Agent for KAIROS — Harish Kamireddi's AI Twin.

Graph flow:
  START → retrieve_context → generate_response → END
"""
from __future__ import annotations
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from app.core.gemini import get_chat_model, embed_text
from app.core.supabase import get_supabase

# ── Agent state ───────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    user_message: str
    system_prompt: str
    context: str
    response: str


# ── Default system prompt ─────────────────────────────────────────────────────

DEFAULT_SYSTEM_PROMPT = """You are KAIROS, the digital AI representation of Harish Kamireddi's portfolio.
Your role is to answer questions about Harish's skills, projects, experience, and career goals based strictly on the provided context.
If the context does not contain the answer, state that you do not have that information rather than speculating.
Be professional, concise, and direct. Speak as KAIROS, Harish's digital twin."""


# ── Node 1: Retrieve context from Supabase ────────────────────────────────────

def retrieve_context(state: AgentState) -> AgentState:
    """
    Fetch profile, projects, experience from Supabase.
    Also performs a vector similarity search on the knowledge base if available.
    """
    context_parts: list[str] = []

    try:
        sb = get_supabase()

        # Profile
        profile_res = sb.table("profiles").select("*").limit(1).execute()
        if profile_res.data:
            p = profile_res.data[0]
            context_parts.append(
                f"## About Harish\n"
                f"Name: {p.get('name')}\n"
                f"Tagline: {p.get('tagline')}\n"
                f"Bio: {p.get('bio')}\n"
                f"GitHub: {p.get('github_url')}\n"
                f"LinkedIn: {p.get('linkedin_url')}\n"
                f"Email: {p.get('email')}"
            )

        # Projects
        proj_res = sb.table("projects").select("*").order("created_at", desc=True).execute()
        if proj_res.data:
            proj_lines = ["## Projects"]
            for proj in proj_res.data:
                tags = ", ".join(proj.get("tags") or [])
                proj_lines.append(
                    f"- **{proj['title']}**: {proj['description']} (Tags: {tags})"
                    + (f" | GitHub: {proj['github_url']}" if proj.get("github_url") else "")
                )
            context_parts.append("\n".join(proj_lines))

        # Experience
        exp_res = sb.table("experience").select("*").order("sort_order").execute()
        if exp_res.data:
            exp_lines = ["## Work Experience"]
            for exp in exp_res.data:
                exp_lines.append(
                    f"- **{exp['role']}** at {exp['company']} ({exp['period']}): {exp['description']}"
                )
            context_parts.append("\n".join(exp_lines))

        # Skills
        skills_res = sb.table("skills").select("*").order("sort_order").execute()
        if skills_res.data:
            skill_names = [s["name"] for s in skills_res.data]
            context_parts.append(f"## Skills\n{', '.join(skill_names)}")

        # Vector knowledge base (optional — only if table exists)
        try:
            query_embedding = embed_text(state["user_message"])
            kb_res = sb.rpc(
                "match_knowledge",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.75,
                    "match_count": 4,
                },
            ).execute()
            if kb_res.data:
                kb_lines = ["## Additional Knowledge Base Context"]
                for chunk in kb_res.data:
                    kb_lines.append(chunk.get("content", ""))
                context_parts.append("\n".join(kb_lines))
        except Exception:
            pass  # Knowledge base not set up yet — skip gracefully

    except Exception as exc:
        # Backend offline or Supabase not configured — use minimal fallback
        context_parts.append(
            "## About Harish\n"
            "Name: Harish Kamireddi\n"
            "Role: AI Engineer\n"
            "Skills: FastAPI, React, TypeScript, LangGraph, LangChain, Supabase, Gemini API, Python\n"
            "Focus: Building production-quality AI applications and multi-agent systems."
        )

    return {**state, "context": "\n\n".join(context_parts)}


# ── Node 2: Generate response with Gemini ─────────────────────────────────────

def generate_response(state: AgentState) -> AgentState:
    """Call Gemini 1.5 Flash with the retrieved context and user message."""
    system_prompt = state.get("system_prompt") or DEFAULT_SYSTEM_PROMPT
    model = get_chat_model(system_instruction=system_prompt)

    prompt = f"""Use the following context to answer the user's question.

CONTEXT:
{state['context']}

USER QUESTION:
{state['user_message']}

Answer:"""

    response = model.generate_content(prompt)
    return {**state, "response": response.text}


# ── Build the graph ───────────────────────────────────────────────────────────

def build_agent() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("retrieve_context", retrieve_context)
    graph.add_node("generate_response", generate_response)
    graph.add_edge(START, "retrieve_context")
    graph.add_edge("retrieve_context", "generate_response")
    graph.add_edge("generate_response", END)
    return graph.compile()


# Compiled agent (singleton)
portfolio_agent = build_agent()


def run_agent(user_message: str, system_prompt: str = "") -> str:
    """Public helper — run the agent and return the response string."""
    result = portfolio_agent.invoke({
        "user_message": user_message,
        "system_prompt": system_prompt,
        "context": "",
        "response": "",
    })
    return result["response"]

