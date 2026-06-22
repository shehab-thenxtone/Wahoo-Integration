"""
Per-user workout cache populated by incoming webhook events.
Normalized workouts stored here are merged into get_activities() results
so new workouts appear on the dashboard without waiting for the next full sync.
"""
import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

_CACHE_FILE = Path(__file__).parent.parent / "data" / "webhook_workouts.json"
_MAX_PER_USER = 50


def _load() -> dict:
    if not _CACHE_FILE.exists():
        return {}
    try:
        return json.loads(_CACHE_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def _save(data: dict) -> None:
    _CACHE_FILE.parent.mkdir(exist_ok=True)
    _CACHE_FILE.write_text(json.dumps(data))


def store_workout(user_id: str, workout: dict) -> None:
    """Insert or update a normalized workout for a user. Deduplicates by id."""
    workout_id = str(workout.get("id", ""))
    if not workout_id:
        return
    data = _load()
    workouts: list = data.get(user_id, [])
    # Replace existing entry with same id, or prepend as new
    workouts = [w for w in workouts if str(w.get("id")) != workout_id]
    workouts.insert(0, workout)
    data[user_id] = workouts[:_MAX_PER_USER]
    _save(data)
    logger.info("Webhook cache: stored workout %s for user %s", workout_id, user_id)


def get_cached_workouts(user_id: str) -> list:
    """Return cached workouts for a user (newest first)."""
    return _load().get(user_id, [])


def normalize_webhook_event(payload: dict) -> Optional[dict]:
    """
    Map a Wahoo 'workout_summary' webhook event payload into the same
    normalized shape that _normalize_activity() produces.
    Wahoo sends the workout nested under payload['workout_summary']['workout'].
    """
    ws_envelope = payload.get("workout_summary") or {}
    workout = ws_envelope.get("workout") or {}
    summary = workout.get("workout_summary") or ws_envelope

    starts = workout.get("starts") or ws_envelope.get("created_at", "")
    wid = str(workout.get("id") or ws_envelope.get("id") or "")
    if not wid or not starts:
        return None

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
        "id": wid,
        "date": starts[:10],
        "type": workout.get("name") or "Workout",
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
