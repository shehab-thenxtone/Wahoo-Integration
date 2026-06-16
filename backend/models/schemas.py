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
    duration_minutes: int
    avg_heart_rate: int
    max_heart_rate: int
    calories_burned: int
    distance_km: Optional[float] = None
    elevation_gain_m: Optional[int] = None
    notes: Optional[str] = None


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
