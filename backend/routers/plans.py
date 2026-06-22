from fastapi import APIRouter, Cookie, HTTPException
from typing import Optional

from config import get_settings
from models.schemas import Plan
from services import session_store, wahoo_client

router = APIRouter(prefix="/api/plans", tags=["plans"])


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


@router.get("", response_model=list[Plan])
async def list_plans(session_id: Optional[str] = Cookie(default=None)):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_plans(
        session["access_token"], session["wahoo_user_id"],
        session_id=session_id or "", refresh_token=session.get("refresh_token", ""),
    )


@router.get("/{plan_id}", response_model=Plan)
async def get_plan(plan_id: int, session_id: Optional[str] = Cookie(default=None)):
    session = _get_session_or_demo(session_id)
    result = await wahoo_client.get_plan(
        session["access_token"], session["wahoo_user_id"], plan_id,
        session_id=session_id or "", refresh_token=session.get("refresh_token", ""),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Plan not found")
    return result
