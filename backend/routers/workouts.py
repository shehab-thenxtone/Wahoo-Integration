from fastapi import APIRouter, Cookie, HTTPException, Query
from typing import Optional

from config import get_settings
from models.schemas import Activity
from services import session_store, wahoo_client

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


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


@router.get("/analytics", response_model=list[Activity])
async def workout_analytics(
    days: int = Query(default=30, ge=7, le=90),
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_activities(
        session["access_token"], session["wahoo_user_id"], days,
        session_id=session_id or "", refresh_token=session.get("refresh_token", ""),
    )


@router.get("/{workout_id}")
async def workout_detail(
    workout_id: str,
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    detail = await wahoo_client.get_workout_detail(
        session["access_token"], session["wahoo_user_id"], workout_id,
        session_id=session_id or "", refresh_token=session.get("refresh_token", ""),
    )
    if not detail:
        raise HTTPException(status_code=404, detail="Workout not found")
    return detail
