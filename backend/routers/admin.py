from fastapi import APIRouter
from models.schemas import AdminStats, RateLimitStatus
from services import rate_limit_store, session_store
from config import get_settings

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
async def admin_stats():
    settings = get_settings()
    current = rate_limit_store.get_current_status()
    history = rate_limit_store.get_history(limit=200)
    today_count = rate_limit_store.count_requests_today()
    connected = session_store.count_active_sessions()

    return AdminStats(
        current_rate_limit=RateLimitStatus(**current),
        total_requests_today=today_count,
        connected_users=connected,
        rate_limit_history=history,
        demo_mode=settings.is_demo,
    )


@router.get("/rate-limits")
async def rate_limits():
    return rate_limit_store.get_history(limit=500)


@router.get("/current-rate-limit")
async def current_rate_limit():
    return rate_limit_store.get_current_status()
