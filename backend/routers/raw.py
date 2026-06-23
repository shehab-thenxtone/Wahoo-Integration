import asyncio
import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Cookie, HTTPException

from config import get_settings
from services import session_store, wahoo_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/raw", tags=["raw"])

SAMPLE_FILE = Path(__file__).parent.parent / "data" / "sample_data.json"


def _get_session_or_demo(session_id: Optional[str]) -> dict:
    settings = get_settings()
    if settings.is_demo:
        return {"access_token": "demo", "wahoo_user_id": "demo_user"}
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")
    return session


@router.get("")
async def raw_data(session_id: Optional[str] = Cookie(default=None)) -> dict:
    settings = get_settings()
    session = _get_session_or_demo(session_id)

    if settings.is_demo:
        return json.loads(SAMPLE_FILE.read_text())

    token = session["access_token"]
    uid = session["wahoo_user_id"]
    kw = {
        "session_id": session_id or "",
        "refresh_token": session.get("refresh_token", ""),
    }

    user, workouts, power_zones, routes, plans = await asyncio.gather(
        wahoo_client.get_user_profile(token, uid, **kw),
        wahoo_client.get_raw_workouts(token, uid, **kw),
        wahoo_client.get_power_zones(token, uid, **kw),
        wahoo_client.get_routes(token, uid, **kw),
        wahoo_client.get_plans(token, uid, **kw),
        return_exceptions=True,
    )

    def _unwrap(result: object, fallback: object) -> object:
        return fallback if isinstance(result, Exception) else result

    return {
        "user": _unwrap(user, None),
        "workouts": _unwrap(workouts, []),
        "power_zones": _unwrap(power_zones, []),
        "routes": _unwrap(routes, []),
        "plans": _unwrap(plans, []),
        "heart_rate_daily_summary": [],
        "recovery_data": [],
        "strain_data": [],
    }
