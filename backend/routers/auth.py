import json
import logging
import secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path
from fastapi import APIRouter, Cookie, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from typing import Optional

from config import get_settings
from models.schemas import AuthStatus, OAuthConnectResponse
from services import session_store, wahoo_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# File-backed CSRF state store — survives server reloads with --reload
_STATES_FILE = Path(__file__).parent.parent / "data" / "pending_states.json"


def _load_states() -> dict:
    if not _STATES_FILE.exists():
        return {}
    try:
        return json.loads(_STATES_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def _add_state(state: str) -> None:
    states = _load_states()
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
    states = {s: ts for s, ts in states.items() if ts > cutoff}
    states[state] = datetime.now(timezone.utc).isoformat()
    _STATES_FILE.parent.mkdir(exist_ok=True)
    _STATES_FILE.write_text(json.dumps(states))


def _consume_state(state: str) -> bool:
    states = _load_states()
    if state not in states:
        return False
    del states[state]
    _STATES_FILE.write_text(json.dumps(states))
    return True


@router.get("/status", response_model=AuthStatus)
async def auth_status(session_id: Optional[str] = Cookie(default=None)):
    settings = get_settings()

    if settings.is_demo:
        return AuthStatus(
            connected=True,
            demo_mode=True,
            user_id="demo_user",
            user_name="Demo Athlete",
        )

    if not session_id:
        return AuthStatus(connected=False, demo_mode=False)

    session = session_store.get_session(session_id)
    if not session:
        return AuthStatus(connected=False, demo_mode=False)

    return AuthStatus(
        connected=True,
        demo_mode=False,
        user_id=session["wahoo_user_id"],
        user_name=session.get("user_name", ""),
    )


@router.get("/connect", response_model=OAuthConnectResponse)
async def connect():
    settings = get_settings()

    if settings.is_demo:
        return OAuthConnectResponse(
            auth_url="/",
            demo_mode=True,
        )

    state = secrets.token_urlsafe(32)
    _add_state(state)
    return OAuthConnectResponse(
        auth_url=wahoo_client.build_auth_url(state),
        demo_mode=False,
    )


@router.get("/callback")
async def oauth_callback(
    response: Response,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
):
    settings = get_settings()

    if error:
        return RedirectResponse(f"{settings.frontend_url}/?error={error}")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    if not _consume_state(state):
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    try:
        token_data = await wahoo_client.exchange_code(code)
    except Exception as exc:
        logger.error("OAuth token exchange exception: %s", exc)
        return RedirectResponse(f"{settings.frontend_url}/?error=token_exchange_failed")

    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token", "")
    expires_in = token_data.get("expires_in", 3600)

    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()

    # Fetch user profile to get wahoo_user_id — required to identify the user.
    # If this fails we revoke the token immediately so it doesn't consume a Wahoo slot.
    try:
        profile = await wahoo_client.get_user_profile(access_token, "new")
        wahoo_user_id = str(profile.get("id", ""))
        if not wahoo_user_id:
            raise ValueError(f"User profile returned no id: {profile}")
        first = profile.get("first") or profile.get("first_name", "")
        last = profile.get("last") or profile.get("last_name", "")
        user_name = f"{first} {last}".strip() or "Wahoo User"
    except Exception as exc:
        logger.error("Failed to fetch Wahoo user profile (revoking token): %s", exc)
        try:
            await wahoo_client.revoke_token(access_token)
        except Exception as revoke_exc:
            logger.warning("Token revoke also failed: %s", revoke_exc)
        return RedirectResponse(f"{settings.frontend_url}/?error=profile_fetch_failed")

    session_id = session_store.create_session(
        wahoo_user_id=wahoo_user_id,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=expires_at,
        user_name=user_name.strip(),
    )

    redirect = RedirectResponse(f"{settings.frontend_url}/dashboard")
    redirect.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,  # 30 days
    )
    return redirect


@router.post("/disconnect")
async def disconnect(
    response: Response,
    session_id: Optional[str] = Cookie(default=None),
):
    if session_id:
        session_store.delete_session(session_id)
    response.delete_cookie("session_id")
    return {"ok": True}


@router.get("/me")
async def me(session_id: Optional[str] = Cookie(default=None)):
    settings = get_settings()

    if settings.is_demo:
        sample = wahoo_client._get_sample()
        return sample.get("user", {})

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")

    profile = await wahoo_client.get_user_profile(
        session["access_token"], session["wahoo_user_id"]
    )
    return profile
