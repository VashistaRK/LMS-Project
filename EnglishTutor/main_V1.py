# =============================
# English Free Talk Tutor (FastAPI)
# =============================

from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from pathlib import Path
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
import threading

# ==== CONFIG ====

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise Exception(
        "OPENAI_API_KEY is not set. "
        "Set it in Windows using:\n"
        '  setx OPENAI_API_KEY "your-key-here"\n'
        "Then close & reopen the terminal."
    )

client = OpenAI(api_key=api_key)

app = FastAPI(title="English Free Talk Tutor")

# CORS: open for dev (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================================
# CONVERSATION HISTORY (IN-MEMORY)
# ========================================

class ConversationStore:
    """
    In-memory conversation storage.
    For production, replace with Redis/DB.
    """

    def __init__(self, max_history_length: int = 20, session_timeout_minutes: int = 60):
        self.sessions: dict[str, dict] = {}
        self.max_history_length = max_history_length
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
        self.lock = threading.Lock()

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        with self.lock:
            self.sessions[session_id] = {
                "id": session_id,
                "mode": "free_talk",
                "metadata": {},   # kept for future extensions
                "history": [],
                "created_at": datetime.now(),
                "last_active": datetime.now(),
            }
        return session_id

    def get_session(self, session_id: str) -> Optional[dict]:
        with self.lock:
            session = self.sessions.get(session_id)
            if session:
                # expire old sessions
                if datetime.now() - session["last_active"] > self.session_timeout:
                    del self.sessions[session_id]
                    return None
                session["last_active"] = datetime.now()
            return session

    def add_message(self, session_id: str, role: str, content: str) -> bool:
        with self.lock:
            session = self.sessions.get(session_id)
            if not session:
                return False

            session["history"].append(
                {"role": role, "content": content, "timestamp": datetime.now().isoformat()}
            )

            if len(session["history"]) > self.max_history_length:
                session["history"] = session["history"][-self.max_history_length :]

            session["last_active"] = datetime.now()
            return True

    def get_history(self, session_id: str) -> list[dict]:
        with self.lock:
            session = self.sessions.get(session_id)
            if not session:
                return []
            return [{"role": m["role"], "content": m["content"]} for m in session["history"]]


conversation_store = ConversationStore(max_history_length=30, session_timeout_minutes=120)


# ======== MODELS ========

class SessionCreateRequest(BaseModel):
    # no fields needed for now
    pass


class SessionCreateResponse(BaseModel):
    session_id: str
    message: str


class ChatRequest(BaseModel):
    user_message: str | None = None
    session_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    message_count: int


class TTSRequest(BaseModel):
    text: str


# ========================================
# PROMPT
# ========================================

def get_free_talk_system_prompt() -> str:
    return """
You are an English tutor having natural FREE CONVERSATION with an ADVANCED learner.

GOAL:
- Help the learner practice fluent English.
- The learner should talk MORE than you.
- Keep the conversation going with open questions.

FIRST MESSAGE:
- If the user message is "START_CONVERSATION", you should:
  - Greet the learner.
  - Introduce a simple topic (e.g., daily life, studies, work, hobbies).
  - Ask an open-ended question to get them talking.

FOR EVERY USER MESSAGE:
1) First, respond naturally (2–4 short sentences).
2) Then give short feedback on their English:
   - Start with: "Feedback: ..."
   - Correct 1–2 important grammar or phrasing issues, in a friendly way.
3) End with an open question that invites a longer answer
   (opinions, reasons, examples, or stories).

STYLE:
- Friendly, conversational, and encouraging.
- Use natural advanced English, but not too academic.
- Do NOT write very long paragraphs.
- Always reply in English only.
"""


# ========================================
# OPENAI HELPER
# ========================================

def call_openai_chat(messages: list[dict]) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",   # stable chat model
            messages=messages,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return content or ""
    except Exception as e:
        print("Chat error:", e)
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")


# ========================================
# STATIC FRONTEND
# ========================================

@app.get("/")
def serve_index():
    index_path = os.path.join("static", "index.html")
    if not os.path.isfile(index_path):
        raise HTTPException(status_code=404, detail="index.html not found in /static")
    return FileResponse(index_path)


if os.path.isdir("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")


# ========================================
# SESSION ENDPOINTS
# ========================================

@app.post("/api/session/create", response_model=SessionCreateResponse)
def create_session(_: SessionCreateRequest | None = None):
    """
    Create a new free-talk session for a learner.
    """
    session_id = conversation_store.create_session()
    return SessionCreateResponse(
        session_id=session_id,
        message="Free talk session created.",
    )


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "active_sessions": len(conversation_store.sessions),
    }


# ========================================
# CHAT ENDPOINT (FREE TALK ONLY)
# ========================================

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    msg = (req.user_message or "").strip()
    if len(msg) > 4000:
        raise HTTPException(status_code=400, detail="Message too long.")

    # Get or create session
    session_id = req.session_id
    session = None

    if session_id:
        session = conversation_store.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or expired. Create a new session.")
    else:
        session_id = conversation_store.create_session()
        session = conversation_store.get_session(session_id)

    # Build messages with history
    system_prompt = get_free_talk_system_prompt()
    history = conversation_store.get_history(session_id)

    # A-mode behaviour: if no/short greeting, start conversation from bot
    raw_msg = msg
    if not raw_msg or raw_msg.lower() in {"hi", "hello", "hey", "start"}:
        user_msg = "START_CONVERSATION"
    else:
        user_msg = raw_msg

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_msg})

    reply = call_openai_chat(messages)

    # Save messages to history
    conversation_store.add_message(session_id, "user", user_msg)
    conversation_store.add_message(session_id, "assistant", reply)

    updated_session = conversation_store.get_session(session_id)
    message_count = len(updated_session["history"]) if updated_session else 0

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        message_count=message_count,
    )


# ========================================
# TTS ENDPOINT (tts-1 + alloy)
# ========================================

@app.post("/api/tts")
def tts(req: TTSRequest):
    """
    Text-to-speech for tutor reply.
    """
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required for TTS.")

    if len(text) > 2000:
        text = text[:2000]

    try:
        tmp_path = Path("tts_temp_output.mp3")

        with client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice="alloy",
            input=text,
        ) as response:
            response.stream_to_file(tmp_path)

        audio_bytes = tmp_path.read_bytes()
        try:
            tmp_path.unlink()
        except Exception:
            pass

        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print("TTS error:", e)
        raise HTTPException(status_code=500, detail=f"TTS error: {e}")


# ========================================
# STARTUP/SHUTDOWN
# ========================================

@app.on_event("startup")
async def on_startup():
    print("English Free Talk Tutor API started.")
    print(f"Max history length: {conversation_store.max_history_length}")
    print(f"Session timeout: {conversation_store.session_timeout}")


@app.on_event("shutdown")
async def on_shutdown():
    print(f"Shutting down. Active sessions: {len(conversation_store.sessions)}")
