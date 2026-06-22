from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class AuthStatus(BaseModel):
    connected: bool
    demo_mode: bool
    user_id: Optional[str] = None
    user_name: Optional[str] = None


class OAuthConnectResponse(BaseModel):
    auth_url: str
    demo_mode: bool


# ── Heart Rate ────────────────────────────────────────────────────────────────

class HeartRateZones(BaseModel):
    resting_below_60: dict
    aerobic_60_100: dict
    threshold_100_140: dict
    max_effort_above_140: dict


class HeartRateDailySummary(BaseModel):
    date: str
    readings_count: int
    resting_hr: int
    avg_hr: int
    max_hr: int
    min_hr: int
    heart_rate_variability_rmssd: int
    heart_rate_zones: HeartRateZones


# ── Recovery ──────────────────────────────────────────────────────────────────

class RecoveryData(BaseModel):
    date: str
    recovery_score: int
    status: str
    sleep: float
    hrv: float
    rhr: float


# ── Strain ────────────────────────────────────────────────────────────────────

class StrainData(BaseModel):
    date: str
    strain: int
    zone: str


# ── Activities ────────────────────────────────────────────────────────────────

class Activity(BaseModel):
    id: str
    date: str
    type: str
    start_time: str
    duration_minutes: int = 0
    avg_heart_rate: Optional[int] = None
    max_heart_rate: Optional[int] = None
    calories_burned: Optional[int] = None
    distance_km: Optional[float] = None
    elevation_gain_m: Optional[int] = None
    notes: Optional[str] = None
    # Performance fields — only present when a power meter was used
    normalized_power: Optional[int] = None
    training_stress_score: Optional[float] = None
    cadence_avg: Optional[int] = None
    speed_avg_kph: Optional[float] = None
    work_kj: Optional[float] = None
    power_avg: Optional[int] = None
    duration_active_minutes: Optional[int] = None
    duration_paused_minutes: Optional[int] = None


# ── Dashboard aggregates ──────────────────────────────────────────────────────

class TodayMetrics(BaseModel):
    heart_rate: Optional[HeartRateDailySummary] = None
    recovery: Optional[RecoveryData] = None
    strain: Optional[StrainData] = None
    activities: list[Activity] = []


class HistoricalMetrics(BaseModel):
    heart_rate_history: list[HeartRateDailySummary] = []
    recovery_history: list[RecoveryData] = []
    strain_history: list[StrainData] = []
    activities: list[Activity] = []
    days: int = 30


# ── Rate Limits ───────────────────────────────────────────────────────────────

class RateLimitEntry(BaseModel):
    timestamp: str
    endpoint: str
    user_id: str
    remaining: int
    limit: int
    reset_at: str


class RateLimitStatus(BaseModel):
    remaining: int
    limit: int
    reset_at: str
    used: int
    percent_used: float


class AdminStats(BaseModel):
    current_rate_limit: RateLimitStatus
    total_requests_today: int
    connected_users: int
    rate_limit_history: list[RateLimitEntry] = []
    demo_mode: bool


# ── Phase 2: Power Zones ──────────────────────────────────────────────────────

class PowerZone(BaseModel):
    id: Optional[int] = None
    user_id: Optional[str] = None
    ftp: Optional[int] = None
    critical_power: Optional[int] = None
    zone_count: Optional[int] = None
    zone_1: Optional[int] = None
    zone_2: Optional[int] = None
    zone_3: Optional[int] = None
    zone_4: Optional[int] = None
    zone_5: Optional[int] = None
    zone_6: Optional[int] = None
    zone_7: Optional[int] = None
    workout_type_id: Optional[int] = None
    workout_type_family_id: Optional[int] = None
    originator_type: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ── Phase 2: Routes ───────────────────────────────────────────────────────────

class Route(BaseModel):
    id: Optional[int] = None
    user_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    distance: Optional[float] = None
    ascent: Optional[float] = None
    descent: Optional[float] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    workout_type_family_id: Optional[int] = None
    deleted: Optional[bool] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ── Phase 2: Plans ────────────────────────────────────────────────────────────

class Plan(BaseModel):
    id: Optional[int] = None
    user_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    workout_type_family_id: Optional[int] = None
    deleted: Optional[bool] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
