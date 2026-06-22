from fastapi import APIRouter, Cookie, HTTPException
from typing import Optional

from config import get_settings
from models.schemas import PowerZone
from services import session_store, wahoo_client

router = APIRouter(prefix="/api/power-zones", tags=["power-zones"])


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


@router.get("", response_model=list[PowerZone])
async def list_power_zones(session_id: Optional[str] = Cookie(default=None)):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_power_zones(
        session["access_token"], session["wahoo_user_id"],
        session_id=session_id or "", refresh_token=session.get("refresh_token", ""),
    )
