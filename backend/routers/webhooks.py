import hashlib
import hmac
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response, status
from pydantic import BaseModel

from config import Settings, get_settings

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

DATA_DIR = Path(__file__).parent.parent / "data"
EVENTS_FILE = DATA_DIR / "webhook_events.json"
MAX_EVENTS = 500
REPLAY_WINDOW_SECONDS = 300  # reject requests older than 5 min


# ── Pydantic models ───────────────────────────────────────────────────────────

class WebhookEvent(BaseModel):
    id: str
    event_type: str
    user_id: str | None = None
    received_at: str
    verified: bool
    payload_preview: dict[str, Any]


class WebhookStatus(BaseModel):
    enabled: bool
    secret_configured: bool
    events_received: int
    recent_events: list[WebhookEvent]


# ── Event log helpers ─────────────────────────────────────────────────────────

def _load_events() -> list[dict]:
    if not EVENTS_FILE.exists():
        return []
    try:
        return json.loads(EVENTS_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return []


def _append_event(event: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    events = _load_events()
    events.append(event)
    if len(events) > MAX_EVENTS:
        events = events[-MAX_EVENTS:]
    EVENTS_FILE.write_text(json.dumps(events, indent=2))


# ── Signature verification ────────────────────────────────────────────────────

def _verify_signature(
    raw_body: bytes,
    signature_header: str | None,
    secret: str,
) -> bool:
    """Verify Wahoo HMAC-SHA256 webhook signature."""
    if not signature_header:
        return False
    expected = hmac.new(
        secret.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    provided = signature_header.removeprefix("sha256=")
    return hmac.compare_digest(expected, provided)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/wahoo", status_code=status.HTTP_200_OK)
async def receive_wahoo_webhook(
    request: Request,
    x_wahoo_signature: str | None = Header(None),
    settings: Settings = Depends(get_settings),
) -> Response:
    """
    Receive push events from Wahoo.
    Wahoo sends: POST /api/webhooks/wahoo
    Header: X-Wahoo-Signature: sha256=<hex>
    """
    raw_body = await request.body()

    # Reject empty bodies
    if not raw_body:
        raise HTTPException(status_code=400, detail="Empty body")

    # Signature verification
    verified = False
    secret = settings.wahoo_webhook_secret
    if secret:
        verified = _verify_signature(raw_body, x_wahoo_signature, secret)
        if not verified:
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
    # If no secret configured, accept but flag as unverified (dev mode)

    # Parse payload
    try:
        payload: dict = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Replay-attack guard: check timestamp field if present
    ts = payload.get("timestamp") or payload.get("event_time")
    if ts:
        try:
            event_ts = int(ts) if str(ts).isdigit() else int(datetime.fromisoformat(str(ts)).timestamp())
            if abs(time.time() - event_ts) > REPLAY_WINDOW_SECONDS:
                raise HTTPException(status_code=400, detail="Webhook timestamp outside replay window")
        except (ValueError, TypeError):
            pass  # can't parse ts → allow through

    event_type = payload.get("event_type") or payload.get("type") or "unknown"
    user_id = str(payload.get("user", {}).get("id", "")) or None

    event_record = {
        "id": payload.get("id") or f"{int(time.time() * 1000)}",
        "event_type": event_type,
        "user_id": user_id,
        "received_at": datetime.now(timezone.utc).isoformat(),
        "verified": verified or not bool(secret),
        "payload_preview": {k: v for k, v in list(payload.items())[:6]},
    }

    _append_event(event_record)
    return Response(status_code=200)


@router.get("/status", response_model=WebhookStatus)
async def webhook_status(settings: Settings = Depends(get_settings)) -> WebhookStatus:
    """Return webhook configuration status and recent events."""
    events_raw = _load_events()
    recent = [WebhookEvent(**e) for e in events_raw[-20:]][::-1]

    return WebhookStatus(
        enabled=True,
        secret_configured=bool(settings.wahoo_webhook_secret),
        events_received=len(events_raw),
        recent_events=recent,
    )


@router.delete("/events", status_code=status.HTTP_204_NO_CONTENT)
async def clear_events() -> Response:
    """Clear the local webhook event log."""
    if EVENTS_FILE.exists():
        EVENTS_FILE.write_text("[]")
    return Response(status_code=204)
