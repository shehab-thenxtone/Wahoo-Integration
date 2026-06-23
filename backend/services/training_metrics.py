"""
Compute CTL (Chronic Training Load / Fitness), ATL (Acute Training Load),
TSB (Training Stress Balance / Form), and a weekly activity summary.

EWA formula (same for both loads, different decay windows):
    load_t = load_(t-1) + (TSS_t - load_(t-1)) / window
"""
from __future__ import annotations

import random
from datetime import date, timedelta
from typing import Optional

_CTL_WINDOW = 42
_ATL_WINDOW = 7
_LOOKBACK_DAYS = 90
_CALIBRATION_THRESHOLD = 14  # days with TSS before CTL is considered calibrated
_DEMO_REFERENCE_DATE = date(2024, 6, 13)


def _daily_tss_map(activities: list[dict]) -> dict[str, float]:
    """Aggregate per-date TSS from the normalised activity list."""
    result: dict[str, float] = {}
    for act in activities:
        tss = act.get("training_stress_score")
        if tss is None:
            continue
        d = str(act.get("date", ""))[:10]
        if d:
            result[d] = result.get(d, 0.0) + float(tss)
    return result


def _generate_demo_tss_history(reference_date: date = _DEMO_REFERENCE_DATE) -> dict[str, float]:
    """Produce deterministic 60-day TSS history for demo mode (seed=42)."""
    rng = random.Random(42)
    result: dict[str, float] = {}
    for offset in range(60, -1, -1):
        d = reference_date - timedelta(days=offset)
        if rng.random() < 0.70:
            result[d.isoformat()] = round(rng.uniform(40.0, 90.0), 1)
    return result


def compute_load_metrics(
    activities: list[dict],
    is_demo: bool = False,
    reference_date: Optional[date] = None,
) -> dict:
    """
    Returns a dict with fitness (CTL), fatigue (ATL), form (TSB), and deltas.
    """
    ref = reference_date if reference_date else (
        _DEMO_REFERENCE_DATE if is_demo else date.today()
    )

    tss_map = _daily_tss_map(activities)
    if is_demo:
        demo_history = _generate_demo_tss_history(_DEMO_REFERENCE_DATE)
        # Real activity TSS takes precedence on any date overlap
        tss_map = {**demo_history, **tss_map}

    ctl = 0.0
    atl = 0.0
    ctl_yesterday: float = 0.0
    atl_yesterday: float = 0.0
    ctl_week_ago: float = 0.0
    atl_week_ago: float = 0.0
    days_with_tss = 0

    current = ref - timedelta(days=_LOOKBACK_DAYS)
    while current <= ref:
        date_str = current.isoformat()
        tss = tss_map.get(date_str, 0.0)
        if tss > 0:
            days_with_tss += 1

        ctl = ctl + (tss - ctl) / _CTL_WINDOW
        atl = atl + (tss - atl) / _ATL_WINDOW

        days_from_ref = (ref - current).days
        if days_from_ref == 1:
            ctl_yesterday = ctl
            atl_yesterday = atl
        elif days_from_ref == 7:
            ctl_week_ago = ctl
            atl_week_ago = atl

        current += timedelta(days=1)

    tsb = ctl - atl
    tsb_yesterday = ctl_yesterday - atl_yesterday
    tsb_week_ago = ctl_week_ago - atl_week_ago

    return {
        "ctl": round(ctl, 1),
        "atl": round(atl, 1),
        "tsb": round(tsb, 1),
        "day_change_ctl": round(ctl - ctl_yesterday, 1),
        "week_change_ctl": round(ctl - ctl_week_ago, 1),
        "day_change_tsb": round(tsb - tsb_yesterday, 1),
        "week_change_tsb": round(tsb - tsb_week_ago, 1),
        "calibrating": days_with_tss < _CALIBRATION_THRESHOLD,
    }


def compute_weekly_summary(
    activities: list[dict],
    reference_date: Optional[date] = None,
) -> dict:
    """
    Aggregate activities in the ISO week containing reference_date (Mon–Sun).
    """
    ref = reference_date or date.today()
    week_start = ref - timedelta(days=ref.weekday())  # Monday
    week_end = week_start + timedelta(days=6)

    count = 0
    total_minutes = 0
    total_distance_km = 0.0

    for act in activities:
        d_str = str(act.get("date", ""))[:10]
        if not d_str:
            continue
        try:
            d = date.fromisoformat(d_str)
        except ValueError:
            continue
        if week_start <= d <= week_end:
            count += 1
            total_minutes += int(act.get("duration_minutes") or 0)
            dist = act.get("distance_km")
            if dist:
                total_distance_km += float(dist)

    return {
        "activities_count": count,
        "duration_minutes": total_minutes,
        "distance_km": round(total_distance_km, 2),
    }
