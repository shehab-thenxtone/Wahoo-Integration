"""
Wahoo API client.
- When settings.is_demo is True: returns sample data from backend/data/sample_data.json
- When connected with real OAuth token: calls live Wahoo API and records rate limits
"""
import json
import logging
from datetime import datetime, date, timezone, timedelta
from pathlib import Path
from typing import Optional

import httpx

from config import get_settings
from services import rate_limit_store

logger = logging.getLogger(__name__)

SAMPLE_FILE = Path(__file__).parent.parent / "data" / "sample_data.json"

_sample: Optional[dict] = None


def _get_sample() -> dict:
    global _sample
    if _sample is None:
        _sample = json.loads(SAMPLE_FILE.read_text())
    return _sample


def _record_rate_limit(response: httpx.Response, user_id: str, endpoint: str) -> None:
    remaining = int(response.headers.get("X-RateLimit-Remaining", "95").split(",")[0].strip())
    limit = int(response.headers.get("X-RateLimit-Limit", "100").split(",")[0].strip())
    reset_at = response.headers.get("X-RateLimit-Reset", "")
    rate_limit_store.record(endpoint, user_id, remaining, limit, reset_at)


async def _api_get(
    path: str,
    access_token: str,
    user_id: str,
    params: dict = None,
    *,
    session_id: str = "",
    refresh_token: str = "",
) -> dict:
    settings = get_settings()
    url = f"{settings.wahoo_api_base}{path}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await client.get(url, headers=headers, params=params or {})

        # Expired token — refresh once and retry
        if response.status_code == 401 and session_id and refresh_token:
            try:
                new_tokens = await refresh_access_token(refresh_token)
                access_token = new_tokens["access_token"]
                new_refresh = new_tokens.get("refresh_token", refresh_token)
                expires_in = new_tokens.get("expires_in", 3600)
                expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()
                session_store.update_tokens(session_id, access_token, new_refresh, expires_at)
                logger.info("Access token refreshed for user %s", user_id)
                headers = {"Authorization": f"Bearer {access_token}"}
                response = await client.get(url, headers=headers, params=params or {})
            except Exception as exc:
                logger.warning("Token refresh failed for %s: %s", path, exc)

        if response.is_error:
            logger.error("Wahoo API GET %s → %s: %s", path, response.status_code, response.text[:500])
        response.raise_for_status()
        _record_rate_limit(response, user_id, path)
        return response.json()


# ── OAuth helpers ──────────────────────────────────────────────────────────────

def build_auth_url(state: str) -> str:
    from urllib.parse import urlencode
    settings = get_settings()
    params = {
        "client_id": settings.wahoo_client_id,
        "redirect_uri": settings.wahoo_redirect_uri,
        "response_type": "code",
        "scope": "user_read workouts_read power_zones_read routes_read plans_read offline_data",
        "state": state,
    }
    return f"{settings.wahoo_auth_url}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            settings.wahoo_token_url,
            data={
                "client_id": settings.wahoo_client_id,
                "client_secret": settings.wahoo_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.wahoo_redirect_uri,
            },
        )
        if response.is_error:
            logger.error(
                "Wahoo token exchange failed %s: %s | redirect_uri=%s",
                response.status_code,
                response.text[:500],
                settings.wahoo_redirect_uri,
            )
        response.raise_for_status()
        return response.json()


async def revoke_token(access_token: str) -> None:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.delete(
            "https://api.wahooligan.com/v1/permissions",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        logger.info("Token revoke → %s", resp.status_code)


async def refresh_access_token(refresh_token: str) -> dict:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            settings.wahoo_token_url,
            data={
                "client_id": settings.wahoo_client_id,
                "client_secret": settings.wahoo_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )
        response.raise_for_status()
        return response.json()


# ── User profile ──────────────────────────────────────────────────────────────

async def get_user_profile(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> dict:
    if get_settings().is_demo:
        sample = _get_sample()
        return sample["user"]
    result = await _api_get("/v1/user", access_token, user_id, session_id=session_id, refresh_token=refresh_token)
    logger.info("User profile raw response: %s", str(result)[:500])
    if "user" in result and isinstance(result["user"], dict):
        return result["user"]
    return result


# ── Metrics fetchers ──────────────────────────────────────────────────────────

def _filter_by_days(items: list, days: int, date_key: str = "date") -> list:
    cutoff = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
    return [i for i in items if i.get(date_key, "") >= cutoff]


async def get_today_heart_rate(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> Optional[dict]:
    sample = _get_sample()
    if get_settings().is_demo:
        summaries = sample.get("heart_rate_daily_summary", [])
        return summaries[-1] if summaries else None

    today = date.today().isoformat()
    data = await _api_get(
        "/v1/user/me/metrics/heart_rate",
        access_token,
        user_id,
        {"start_date": f"{today}T00:00:00Z", "end_date": f"{today}T23:59:59Z", "granularity": "daily"},
        session_id=session_id,
        refresh_token=refresh_token,
    )
    summaries = data.get("heart_rate_daily_summaries", [])
    return summaries[0] if summaries else None


async def get_heart_rate_history(
    access_token: str, user_id: str, days: int = 30, *, session_id: str = "", refresh_token: str = ""
) -> list:
    sample = _get_sample()
    if get_settings().is_demo:
        return sample.get("heart_rate_daily_summary", [])[-days:]

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    data = await _api_get(
        "/v1/user/me/metrics/heart_rate",
        access_token,
        user_id,
        {
            "start_date": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_date": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "granularity": "daily",
        },
        session_id=session_id,
        refresh_token=refresh_token,
    )
    return data.get("heart_rate_daily_summaries", [])


async def get_today_recovery(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> Optional[dict]:
    sample = _get_sample()
    if get_settings().is_demo:
        items = sample.get("recovery_data", [])
        return items[-1] if items else None

    today = date.today().isoformat()
    data = await _api_get(
        "/v1/user/me/metrics/recovery",
        access_token,
        user_id,
        {"start_date": today, "end_date": today},
        session_id=session_id,
        refresh_token=refresh_token,
    )
    items = data.get("recovery_data", [])
    return items[0] if items else None


async def get_recovery_history(
    access_token: str, user_id: str, days: int = 30, *, session_id: str = "", refresh_token: str = ""
) -> list:
    sample = _get_sample()
    if get_settings().is_demo:
        return sample.get("recovery_data", [])[-days:]

    end = date.today().isoformat()
    start = (date.today() - timedelta(days=days)).isoformat()
    data = await _api_get(
        "/v1/user/me/metrics/recovery",
        access_token,
        user_id,
        {"start_date": start, "end_date": end},
        session_id=session_id,
        refresh_token=refresh_token,
    )
    return data.get("recovery_data", [])


async def get_today_strain(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> Optional[dict]:
    sample = _get_sample()
    if get_settings().is_demo:
        items = sample.get("strain_data", [])
        return items[-1] if items else None

    today = date.today().isoformat()
    data = await _api_get(
        "/v1/user/me/metrics/strain",
        access_token,
        user_id,
        {"start_date": today, "end_date": today},
        session_id=session_id,
        refresh_token=refresh_token,
    )
    items = data.get("strain_data", [])
    return items[0] if items else None


async def get_strain_history(
    access_token: str, user_id: str, days: int = 30, *, session_id: str = "", refresh_token: str = ""
) -> list:
    sample = _get_sample()
    if get_settings().is_demo:
        return sample.get("strain_data", [])[-days:]

    end = date.today().isoformat()
    start = (date.today() - timedelta(days=days)).isoformat()
    data = await _api_get(
        "/v1/user/me/metrics/strain",
        access_token,
        user_id,
        {"start_date": start, "end_date": end},
        session_id=session_id,
        refresh_token=refresh_token,
    )
    return data.get("strain_data", [])


def _normalize_activity(w: dict) -> dict:
    summary = w.get("workout_summary") or {}
    starts = w.get("starts", "")
    duration_sec = summary.get("duration_in_seconds") or 0
    distance_m = summary.get("distance_accum") or 0
    hr_avg = summary.get("heart_rate_avg")
    hr_max = summary.get("heart_rate_max")
    calories = summary.get("calories_consumed")
    ascent = summary.get("ascent_accum")
    np_ = summary.get("power_bike_np_last")
    tss = summary.get("power_bike_tss_last")
    cadence_avg = summary.get("cadence_avg")
    speed_avg = summary.get("speed_avg")
    work_accum = summary.get("work_accum")
    power_avg = summary.get("power_avg")
    duration_active = summary.get("duration_active_accum")
    duration_paused = summary.get("duration_paused_accum")
    return {
        "id": str(w.get("id", "")),
        "date": starts[:10] if starts else "",
        "type": w.get("name") or "Workout",
        "start_time": starts,
        "duration_minutes": int(duration_sec / 60),
        "avg_heart_rate": int(hr_avg) if hr_avg else None,
        "max_heart_rate": int(hr_max) if hr_max else None,
        "calories_burned": int(calories) if calories else None,
        "distance_km": round(distance_m / 1000, 2) if distance_m else None,
        "elevation_gain_m": int(ascent) if ascent else None,
        "normalized_power": int(np_) if np_ else None,
        "training_stress_score": round(float(tss), 1) if tss else None,
        "cadence_avg": int(cadence_avg) if cadence_avg else None,
        "speed_avg_kph": round(float(speed_avg) * 3.6, 2) if speed_avg else None,
        "work_kj": round(float(work_accum) / 1000, 1) if work_accum else None,
        "power_avg": int(power_avg) if power_avg else None,
        "duration_active_minutes": int(duration_active / 60) if duration_active else None,
        "duration_paused_minutes": int(duration_paused / 60) if duration_paused else None,
    }


_MAX_WORKOUT_PAGES = 10


async def get_activities(
    access_token: str, user_id: str, days: int = 30, *, session_id: str = "", refresh_token: str = ""
) -> list:
    sample = _get_sample()
    if get_settings().is_demo:
        return sample.get("activities", [])

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    base_params = {
        "start_date": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "end_date": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "per_page": 30,
    }

    workouts: list = []
    for page in range(1, _MAX_WORKOUT_PAGES + 1):
        data = await _api_get(
            "/v1/workouts",
            access_token,
            user_id,
            {**base_params, "page": page},
            session_id=session_id,
            refresh_token=refresh_token,
        )
        batch = data.get("workouts", [])
        workouts.extend(batch)
        total = data.get("total", len(workouts))
        if not batch or len(workouts) >= total:
            break

    return [_normalize_activity(w) for w in workouts]


# ── Phase 2: Power Zones ──────────────────────────────────────────────────────

async def get_power_zones(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> list:
    if get_settings().is_demo:
        return _get_sample().get("power_zones", [])
    data = await _api_get("/v1/power_zones", access_token, user_id, session_id=session_id, refresh_token=refresh_token)
    return data.get("power_zones", [])


# ── Phase 2: Routes ───────────────────────────────────────────────────────────

async def get_routes(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> list:
    if get_settings().is_demo:
        return _get_sample().get("routes", [])
    data = await _api_get("/v1/routes", access_token, user_id, session_id=session_id, refresh_token=refresh_token)
    return data.get("routes", [])


async def get_route(
    access_token: str, user_id: str, route_id: int, *, session_id: str = "", refresh_token: str = ""
) -> dict:
    if get_settings().is_demo:
        for r in _get_sample().get("routes", []):
            if r.get("id") == route_id:
                return r
        return {}
    return await _api_get(f"/v1/routes/{route_id}", access_token, user_id, session_id=session_id, refresh_token=refresh_token)


# ── Phase 2: Plans ────────────────────────────────────────────────────────────

async def get_plans(
    access_token: str, user_id: str, *, session_id: str = "", refresh_token: str = ""
) -> list:
    if get_settings().is_demo:
        return _get_sample().get("plans", [])
    data = await _api_get("/v1/plans", access_token, user_id, session_id=session_id, refresh_token=refresh_token)
    return data.get("plans", [])


async def get_plan(
    access_token: str, user_id: str, plan_id: int, *, session_id: str = "", refresh_token: str = ""
) -> dict:
    if get_settings().is_demo:
        for p in _get_sample().get("plans", []):
            if p.get("id") == plan_id:
                return p
        return {}
    return await _api_get(f"/v1/plans/{plan_id}", access_token, user_id, session_id=session_id, refresh_token=refresh_token)


# ── Phase 2: Workout detail ───────────────────────────────────────────────────

async def get_workout_detail(
    access_token: str, user_id: str, workout_id: str, *, session_id: str = "", refresh_token: str = ""
) -> dict:
    if get_settings().is_demo:
        for a in _get_sample().get("activities", []):
            if str(a.get("id")) == str(workout_id):
                return a
        return {}
    data = await _api_get(f"/v1/workouts/{workout_id}", access_token, user_id, session_id=session_id, refresh_token=refresh_token)
    workout = data.get("workout", data)
    return _normalize_activity(workout) if "workout_summary" in workout else workout
