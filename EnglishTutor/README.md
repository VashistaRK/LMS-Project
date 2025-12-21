# English Tutor MVP

This is a minimal, working English Tutor application with:

- Mode A: Scenario Roleplay
- Mode C: Free Talk (with voice output)
- Conversation sessions with history (per mode)
- Text-to-Speech (TTS) for tutor replies in Free Talk
- Neon black/green UI with robot avatar

## 1. Prerequisites

- Python 3.10+
- pip
- OpenAI API key

Set your API key (Windows PowerShell):

```powershell
setx OPENAI_API_KEY "sk-proj-xxxx"
```

Then close and reopen your terminal.

## 2. Install dependencies

From the project folder:

```bash
pip install -r requirements.txt
```

## 3. Run the backend

Windows:

```bash
run.bat
```

Or manually:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 4. Open the UI

In your browser (Chrome recommended):

- Go to: http://127.0.0.1:8000/

You will see:

- Left panel: Mode selection + settings
- Right panel: Chat + avatar

## 5. Modes

### A. Scenario Roleplay

- Mode: `Mode A – Scenario Roleplay`
- Persona (e.g., Starbucks barista, HR interviewer)
- Level (beginner / intermediate)
- Goal (text description of task)

The tutor:

- Stays in character
- Reacts to your message
- Gives short corrections and improved sentences
- Guides you to complete the goal

### C. Free Talk (with voice)

- Mode: `Mode C – Free Talk`
- Topic (e.g., "Do you think AI will replace teachers?")

The tutor:

- Starts conversation if you just say "hi" or nothing
- Responds naturally
- Gives short feedback prefixed with `Feedback: ...`
- Always ends with a follow-up question
- Speaks the reply aloud (TTS) when voice toggle is ON

## 6. Sessions

The frontend automatically:

- Creates a session per mode with `/api/session/create`
- Sends `session_id` in every `/api/chat` call
- The model remembers previous messages within that session

You can extend this later to tie session IDs to LMS user IDs.

## 7. API Overview

- `POST /api/session/create`
- `POST /api/chat`
- `POST /api/tts`
- `GET /api/health`
- Static frontend: `GET /`

## 8. LMS Integration (Phase 1)

For now, simplest integration is:

```html
<iframe
  src="http://127.0.0.1:8000/"
  style="width: 100%; height: 700px; border: none; border-radius: 12px; overflow: hidden;"
></iframe>
```

In production, replace the URL with your deployed backend domain.

## 9. Next Steps / Extensions

- Add pronunciation mode using the same history structure
- Add vocabulary trainer mode
- Store sessions in a database instead of memory
- Restrict CORS to your LMS domain(s)
