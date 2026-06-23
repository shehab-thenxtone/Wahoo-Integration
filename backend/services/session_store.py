"""
File-backed session store.
sessions.json: { session_id: { wahoo_user_id, access_token, refresh_token, expires_at, user_name } }
Persists tokens across server restarts for local dev.
"""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"
SESSION_FILE = DATA_DIR / "sessions.json"


def _load() -> dict:
    if not SESSION_FILE.exists():
        return {}
    try:
        return json.loads(SESSION_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def _save(sessions: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    SESSION_FILE.write_text(json.dumps(sessions, indent=2))


def create_session(
    wahoo_user_id: str,
    access_token: str,
    refresh_token: str,
    expires_at: str,
    user_name: str = "",
) -> str:
    sessions = _load()
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "wahoo_user_id": wahoo_user_id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
        "user_name": user_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _save(sessions)
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    if not session_id:
        return None
    sessions = _load()
    return sessions.get(session_id)


def delete_session(session_id: str) -> None:
    sessions = _load()
    sessions.pop(session_id, None)
    _save(sessions)


def count_active_sessions() -> int:
    return len(_load())


def get_all_sessions() -> dict:
    """Return a shallow copy of all sessions (session_id → session dict)."""
    return dict(_load())


def update_tokens(session_id: str, access_token: str, refresh_token: str, expires_at: str) -> None:
    sessions = _load()
    if session_id in sessions:
        sessions[session_id]["access_token"] = access_token
        sessions[session_id]["refresh_token"] = refresh_token
        sessions[session_id]["expires_at"] = expires_at
        _save(sessions)
