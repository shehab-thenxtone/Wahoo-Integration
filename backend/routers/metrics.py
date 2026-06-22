import logging
from fastapi import APIRouter, Cookie, HTTPException, Query
from typing import Optional

from config import get_settings
from models.schemas import TodayMetrics, HistoricalMetrics
from services import session_store, wahoo_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


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


@router.get("/today", response_model=TodayMetrics)
async def today_metrics(session_id: Optional[str] = Cookie(default=None)):
    session = _get_session_or_demo(session_id)
    token = session["access_token"]
    uid = session["wahoo_user_id"]

    heart_rate, recovery, strain, activities = await _gather_today(token, uid)
    return TodayMetrics(
        heart_rate=heart_rate,
        recovery=recovery,
        strain=strain,
        activities=activities,
    )


async def _gather_today(token: str, uid: str):
    import asyncio
    hr, recovery, strain, activities = await asyncio.gather(
        wahoo_client.get_today_heart_rate(token, uid),
        wahoo_client.get_today_recovery(token, uid),
        wahoo_client.get_today_strain(token, uid),
        wahoo_client.get_activities(token, uid, days=1),
        return_exceptions=True,
    )
    if isinstance(hr, Exception):
        logger.warning("today heart_rate failed: %s", hr)
    if isinstance(recovery, Exception):
        logger.warning("today recovery failed: %s", recovery)
    if isinstance(strain, Exception):
        logger.warning("today strain failed: %s", strain)
    if isinstance(activities, Exception):
        logger.warning("today activities failed: %s", activities)
    return (
        hr if not isinstance(hr, Exception) else None,
        recovery if not isinstance(recovery, Exception) else None,
        strain if not isinstance(strain, Exception) else None,
        activities if not isinstance(activities, Exception) else [],
    )


@router.get("/history", response_model=HistoricalMetrics)
async def history_metrics(
    days: int = Query(default=30, ge=7, le=90),
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    token = session["access_token"]
    uid = session["wahoo_user_id"]

    import asyncio
    hr, recovery, strain, activities = await asyncio.gather(
        wahoo_client.get_heart_rate_history(token, uid, days),
        wahoo_client.get_recovery_history(token, uid, days),
        wahoo_client.get_strain_history(token, uid, days),
        wahoo_client.get_activities(token, uid, days),
        return_exceptions=True,
    )

    return HistoricalMetrics(
        heart_rate_history=hr if not isinstance(hr, Exception) else [],
        recovery_history=recovery if not isinstance(recovery, Exception) else [],
        strain_history=strain if not isinstance(strain, Exception) else [],
        activities=activities if not isinstance(activities, Exception) else [],
        days=days,
    )


@router.get("/heart-rate")
async def heart_rate(
    days: int = Query(default=30, ge=1, le=90),
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_heart_rate_history(session["access_token"], session["wahoo_user_id"], days)


@router.get("/recovery")
async def recovery(
    days: int = Query(default=30, ge=1, le=90),
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_recovery_history(session["access_token"], session["wahoo_user_id"], days)


@router.get("/strain")
async def strain(
    days: int = Query(default=30, ge=1, le=90),
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_strain_history(session["access_token"], session["wahoo_user_id"], days)


@router.get("/activities")
async def activities(
    days: int = Query(default=30, ge=1, le=90),
    session_id: Optional[str] = Cookie(default=None),
):
    session = _get_session_or_demo(session_id)
    return await wahoo_client.get_activities(session["access_token"], session["wahoo_user_id"], days)
