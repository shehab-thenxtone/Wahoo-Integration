const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// Auth
export const authApi = {
  status: () => request<AuthStatus>('/auth/status'),
  connect: () => request<{ auth_url: string; demo_mode: boolean }>('/auth/connect'),
  disconnect: () => request<{ ok: boolean }>('/auth/disconnect', { method: 'POST' }),
  me: () => request<WahooUser>('/auth/me'),
}

// Metrics
export const metricsApi = {
  today: () => request<TodayMetrics>('/metrics/today'),
  history: (days = 30) => request<HistoricalMetrics>(`/metrics/history?days=${days}`),
  heartRate: (days = 30) => request<HeartRateDailySummary[]>(`/metrics/heart-rate?days=${days}`),
  recovery: (days = 30) => request<RecoveryData[]>(`/metrics/recovery?days=${days}`),
  strain: (days = 30) => request<StrainData[]>(`/metrics/strain?days=${days}`),
  activities: (days = 30) => request<Activity[]>(`/metrics/activities?days=${days}`),
}

// Admin
export const adminApi = {
  stats: () => request<AdminStats>('/admin/stats'),
  rateLimits: () => request<RateLimitEntry[]>('/admin/rate-limits'),
  currentRateLimit: () => request<RateLimitStatus>('/admin/current-rate-limit'),
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthStatus {
  connected: boolean
  demo_mode: boolean
  user_id?: string
  user_name?: string
}

export interface WahooUser {
  id: string
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  device_model?: string
}

export interface HeartRateZones {
  resting_below_60: { minutes: number; percentage: number }
  aerobic_60_100: { minutes: number; percentage: number }
  threshold_100_140: { minutes: number; percentage: number }
  max_effort_above_140: { minutes: number; percentage: number }
}

export interface HeartRateDailySummary {
  date: string
  readings_count: number
  resting_hr: number
  avg_hr: number
  max_hr: number
  min_hr: number
  heart_rate_variability_rmssd: number
  heart_rate_zones: HeartRateZones
}

export interface RecoveryData {
  date: string
  recovery_score: number
  status: string
  sleep: number
  hrv: number
  rhr: number
}

export interface StrainData {
  date: string
  strain: number
  zone: string
}

export interface Activity {
  id: string
  date: string
  type: string
  start_time: string
  duration_minutes: number
  avg_heart_rate: number
  max_heart_rate: number
  calories_burned: number
  distance_km?: number
  elevation_gain_m?: number
  notes?: string
  // Performance fields — only present when a power meter was used
  normalized_power?: number
  training_stress_score?: number
  cadence_avg?: number
  speed_avg_kph?: number
  work_kj?: number
  power_avg?: number
  duration_active_minutes?: number
  duration_paused_minutes?: number
}

export interface TodayMetrics {
  heart_rate?: HeartRateDailySummary
  recovery?: RecoveryData
  strain?: StrainData
  activities: Activity[]
}

export interface HistoricalMetrics {
  heart_rate_history: HeartRateDailySummary[]
  recovery_history: RecoveryData[]
  strain_history: StrainData[]
  activities: Activity[]
  days: number
}

export interface RateLimitEntry {
  timestamp: string
  endpoint: string
  user_id: string
  remaining: number
  limit: number
  reset_at: string
}

export interface RateLimitStatus {
  remaining: number
  limit: number
  reset_at: string
  used: number
  percent_used: number
}

export interface AdminStats {
  current_rate_limit: RateLimitStatus
  total_requests_today: number
  connected_users: number
  rate_limit_history: RateLimitEntry[]
  demo_mode: boolean
}
