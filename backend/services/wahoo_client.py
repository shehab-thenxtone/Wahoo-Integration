"""
Wahoo API client.
- When settings.is_demo is True: returns sample data from backend/data/sample_data.json
- When connected with real OAuth token: calls live Wahoo API and records rate limits
"""
import json
from datetime import datetime, date, timezone, timedelta
from pathlib import Path
from typing import Optional

import httpx

from config import get_settings
from services import rate_limit_store

SAMPLE_FILE = Path(__file__).parent.parent / "data" / "sample_data.json"

_sample: Optional[dict] = None


def _get_sample() -> dict:
    global _sample
    if _sample is None:
        _sample = json.loads(SAMPLE_FILE.read_text())
    return _sample


def _record_rate_limit(response: httpx.Response, user_id: str, endpoint: str) -> None:
    remaining = int(response.headers.get("X-RateLimit-Remaining", 95))
    limit = int(response.headers.get("X-RateLimit-Limit", 100))
    reset_at = response.headers.get("X-RateLimit-Reset", "")
    rate_limit_store.record(endpoint, user_id, remaining, limit, reset_at)


async def _api_get(path: str, access_token: str, user_id: str, params: dict = None) -> dict:
    settings = get_settings()
    url = f"{settings.wahoo_api_base}{path}"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers, params=params or {})
        response.raise_for_status()
        _record_rate_limit(response, user_id, path)
        return response.json()


# ── OAuth helpers ──────────────────────────────────────────────────────────────

def build_auth_url(state: str) -> str:
    settings = get_settings()
    scopes = "user_read workouts_read"
    return (
        f"{settings.wahoo_auth_url}"
        f"?client_id={settings.wahoo_client_id}"
        f"&redirect_uri={settings.wahoo_redirect_uri}"
        f"&response_type=code"
        f"&scope={scopes.replace(' ', '+')}"
        f"&state={state}"
    )


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
        response.raise_for_status()
        return response.json()


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

async def get_user_profile(access_token: str, user_id: str) -> dict:
    if get_settings().is_demo:
        sample = _get_sample()
        return sample["user"]
    return await _api_get("/v1/user/me", access_token, user_id)


# ── Metrics fetchers ──────────────────────────────────────────────────────────

def _filter_by_days(items: list, days: int, date_key: str = "date") -> list:
    cutoff = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
    return [i for i in items if i.get(date_key, "") >= cutoff]


async def get_today_heart_rate(access_token: str, user_id: str) -> Optional[dict]:
    sample = _get_sample()
    if get_settings().is_demo:
        today_str = date.today().isoformat()
        summaries = sample.get("heart_rate_daily_summary", [])
        # In demo mode, return the latest available entry
        return summaries[-1] if summaries else None

    today = date.today().isoformat()
    data = await _api_get(
        "/v1/user/me/metrics/heart_rate",
        access_token,
        user_id,
        {"start_date": f"{today}T00:00:00Z", "end_date": f"{today}T23:59:59Z", "granularity": "daily"},
    )
    summaries = data.get("heart_rate_daily_summaries", [])
    return summaries[0] if summaries else None


async def get_heart_rate_history(access_token: str, user_id: str, days: int = 30) -> list:
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
    )
    return data.get("heart_rate_daily_summaries", [])


async def get_today_recovery(access_token: str, user_id: str) -> Optional[dict]:
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
    )
    items = data.get("recovery_data", [])
    return items[0] if items else None


async def get_recovery_history(access_token: str, user_id: str, days: int = 30) -> list:
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
    )
    return data.get("recovery_data", [])


async def get_today_strain(access_token: str, user_id: str) -> Optional[dict]:
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
    )
    items = data.get("strain_data", [])
    return items[0] if items else None


async def get_strain_history(access_token: str, user_id: str, days: int = 30) -> list:
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
    )
    return data.get("strain_data", [])


async def get_activities(access_token: str, user_id: str, days: int = 30) -> list:
    sample = _get_sample()
    if get_settings().is_demo:
        return sample.get("activities", [])

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    data = await _api_get(
        "/v1/workouts",
        access_token,
        user_id,
        {
            "start_date": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_date": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
    )
    return data.get("workouts", [])
