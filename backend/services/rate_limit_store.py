"""
JSON-file-backed rate limit tracker.
rate_limits.json: { "entries": [ { timestamp, endpoint, user_id, remaining, limit, reset_at } ] }
Keeps last 2 000 entries to bound file size.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
RATE_LIMIT_FILE = DATA_DIR / "rate_limits.json"
MAX_ENTRIES = 2000

_DEFAULT_LIMIT = 100
_DEFAULT_REMAINING = 100
_DEFAULT_RESET = ""


def _load() -> dict:
    if not RATE_LIMIT_FILE.exists():
        return {"entries": []}
    try:
        return json.loads(RATE_LIMIT_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {"entries": []}


def _save(data: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    RATE_LIMIT_FILE.write_text(json.dumps(data, indent=2))


def record(
    endpoint: str,
    user_id: str,
    remaining: int,
    limit: int,
    reset_at: str,
) -> None:
    data = _load()
    data["entries"].append(
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "endpoint": endpoint,
            "user_id": user_id,
            "remaining": remaining,
            "limit": limit,
            "reset_at": reset_at,
        }
    )
    # Trim oldest entries if over cap
    if len(data["entries"]) > MAX_ENTRIES:
        data["entries"] = data["entries"][-MAX_ENTRIES:]
    _save(data)


def get_current_status(user_id: str = "all") -> dict:
    """Return the most recent rate limit snapshot (across all users or specific one)."""
    data = _load()
    entries = data.get("entries", [])
    if user_id != "all":
        entries = [e for e in entries if e.get("user_id") == user_id]
    if not entries:
        return {
            "remaining": _DEFAULT_REMAINING,
            "limit": _DEFAULT_LIMIT,
            "reset_at": _DEFAULT_RESET,
            "used": 0,
            "percent_used": 0.0,
        }
    latest = entries[-1]
    used = latest["limit"] - latest["remaining"]
    return {
        "remaining": latest["remaining"],
        "limit": latest["limit"],
        "reset_at": latest["reset_at"],
        "used": used,
        "percent_used": round((used / max(latest["limit"], 1)) * 100, 1),
    }


def get_history(limit: int = 200) -> list[dict]:
    data = _load()
    return data.get("entries", [])[-limit:]


def count_requests_today() -> int:
    today = datetime.now(timezone.utc).date().isoformat()
    data = _load()
    return sum(1 for e in data.get("entries", []) if e.get("timestamp", "").startswith(today))
