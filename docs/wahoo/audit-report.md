# Wahoo Integration Audit Report

**Date:** 2026-06-22  
**Auditor:** Claude Code  
**API Reference:** https://cloud-api.wahooligan.com/

---

## Executive Summary

The existing integration covers the core health-metrics dashboard (HR, HRV, Recovery, Strain, Activities) and has a solid OAuth + webhook foundation. However, five major API resource groups are completely absent: **Workout Summaries**, **Power Zones**, **Routes**, **Plans**, and **FIT File Uploads**. The OAuth scope declaration is too narrow to access these resources. Several technical debt items around token refresh, pagination, and data normalization should be addressed before expanding the feature set.

---

## Implemented Endpoints

### Authentication & Token Management

| Endpoint | Method | Location | Notes |
|---|---|---|---|
| `/oauth/authorize` | GET | `services/wahoo_client.py:build_auth_url()` | State param + CSRF file-backed store |
| `/oauth/token` | POST | `services/wahoo_client.py:exchange_code()` | Authorization code grant |
| `/oauth/token` | POST | `services/wahoo_client.py:refresh_access_token()` | Refresh grant — defined but **never called automatically** |
| `/v1/permissions` | DELETE | `services/wahoo_client.py:revoke_token()` | Called on profile-fetch failure |

### User Profile

| Endpoint | Method | Scope | Location |
|---|---|---|---|
| `/v1/user` | GET | `user_read` | `services/wahoo_client.py:get_user_profile()` |

Handles both wrapped (`{"user": {...}}`) and flat response shapes.

### Health Metrics

> These endpoints are proprietary Wahoo health platform endpoints (not in the standard cloud API docs). They power the WHOOP-style metrics.

| Endpoint | Method | Location |
|---|---|---|
| `/v1/user/me/metrics/heart_rate` | GET | `wahoo_client.get_today_heart_rate()` + `get_heart_rate_history()` |
| `/v1/user/me/metrics/recovery` | GET | `wahoo_client.get_today_recovery()` + `get_recovery_history()` |
| `/v1/user/me/metrics/strain` | GET | `wahoo_client.get_today_strain()` + `get_strain_history()` |

All three support `start_date` / `end_date` params. Heart rate also accepts `granularity=daily`.

### Workouts

| Endpoint | Method | Scope | Location | Coverage |
|---|---|---|---|---|
| `/v1/workouts` | GET | `workouts_read` | `wahoo_client.get_activities()` | Partial — see TD-3 |

`_normalize_activity()` extracts: `id`, `starts`, `name`, `duration_in_seconds`, `distance_accum`, `heart_rate_avg`, `heart_rate_max`, `calories_consumed`, `ascent_accum`. Missing fields: `power_avg`, `power_bike_np_last`, `power_bike_tss_last`, `cadence_avg`, `speed_avg`, `work_accum`.

### Webhooks (Internal)

| Endpoint | Method | Location |
|---|---|---|
| `POST /api/webhooks/wahoo` | POST | `routers/webhooks.py` |
| `GET /api/webhooks/status` | GET | `routers/webhooks.py` |
| `DELETE /api/webhooks/events` | DELETE | `routers/webhooks.py` |

HMAC-SHA256 verification, replay-attack guard (5-min window), event log (max 500), idempotency via event ID. Received events are **logged only** — no data refresh or real-time push triggered.

---

## Missing Endpoints

### Workout Detail & Summaries

| Endpoint | Method | Scope | Status |
|---|---|---|---|
| `GET /v1/workouts/:id` | GET | `workouts_read` | ❌ Not implemented |
| `GET /v1/workouts/:id/workout_summary` | GET | `workouts_read` | ❌ Not implemented |

WorkoutSummary fields available but not used: `power_bike_np_last` (Normalized Power), `power_bike_tss_last` (TSS), `cadence_avg`, `speed_avg`, `work_accum`, `power_avg`, `duration_active_accum`, `duration_paused_accum`.

### Power Zones

| Endpoint | Method | Scope | Status |
|---|---|---|---|
| `GET /v1/power_zones` | GET | `power_zones_read` | ❌ Not implemented |
| `GET /v1/power_zones/:id` | GET | `power_zones_read` | ❌ Not implemented |

Fields available: `ftp`, `critical_power`, `zone_1`–`zone_7`, `zone_count`, `workout_type_id`.

### Routes

| Endpoint | Method | Scope | Status |
|---|---|---|---|
| `GET /v1/routes` | GET | `routes_read` | ❌ Not implemented |
| `GET /v1/routes/:id` | GET | `routes_read` | ❌ Not implemented |

Fields available: `name`, `description`, `distance`, `ascent`, `descent`, `start_lat`, `start_lng`, file URL.

### Plans

| Endpoint | Method | Scope | Status |
|---|---|---|---|
| `GET /v1/plans` | GET | `plans_read` | ❌ Not implemented |
| `GET /v1/plans/:id` | GET | `plans_read` | ❌ Not implemented |
| `GET /v1/workouts/:workout_id/plans` | GET | `plans_read` | ❌ Not implemented |

### FIT File Upload

| Endpoint | Method | Scope | Status |
|---|---|---|---|
| `POST /v1/workout_file_uploads` | POST | `workouts_write` | ❌ Not implemented |
| `GET /v1/workout_file_uploads/:token` | GET | `workouts_write` | ❌ Not implemented |

### User Write

| Endpoint | Method | Scope | Status |
|---|---|---|---|
| `PUT /v1/user` | PUT | `user_write` | ❌ Not implemented (low priority — read-only dashboard) |

---

## Technical Debt

### TD-1: Narrow OAuth Scopes

**Severity:** HIGH — Blocks all Phase 2 enhancements.

Current scope declaration in `wahoo_client.py:build_auth_url()`:
```python
"scope": "user_read workouts_read"
```

Missing scopes required for enhancement roadmap:
- `power_zones_read` — power zone dashboard
- `routes_read` — route library
- `plans_read` — plan browser
- `offline_data` — webhook delivery (Wahoo requires this for push events)

**Fix:** Update scope string; existing sessions will need re-auth.

---

### TD-2: Token Refresh Never Fires

**Severity:** HIGH — Live users get 401 errors after ~1 hour without re-login.

`refresh_access_token()` is defined but there is no code that calls it when an access token expires. `_api_get()` raises `httpx.HTTPStatusError` on 401 and the router returns a 500. The session store saves `expires_at` but nothing checks it.

**Fix:** Add a token-refresh wrapper in `_api_get()` that detects 401, refreshes the token, updates the session, and retries once.

---

### TD-3: Missing Workout Summary Fields in Normalization

**Severity:** MEDIUM — Analytics features can't be built without these fields.

`_normalize_activity()` drops performance fields already present in `workout_summary`:
- `power_bike_np_last` — Normalized Power
- `power_bike_tss_last` — Training Stress Score
- `cadence_avg` — average cadence
- `speed_avg` — average speed
- `work_accum` — total work in joules
- `power_avg` — average power
- `duration_active_accum` / `duration_paused_accum`

**Fix:** Extend `_normalize_activity()` and the `Activity` Pydantic schema to include these fields.

---

### TD-4: No Pagination on Workout Fetch

**Severity:** MEDIUM — Active users with >30 workouts in a date window see incomplete results.

`get_activities()` fetches with `start_date`/`end_date` but ignores `total`, `page`, and `per_page` fields. The Wahoo API defaults to 30 workouts per page.

**Fix:** Loop through pages until `len(accumulated) >= total` or an empty page is returned.

---

### TD-5: Webhooks Log-Only, No Data Refresh

**Severity:** MEDIUM — Webhook infrastructure exists but provides no user-facing value.

`POST /api/webhooks/wahoo` stores events in `webhook_events.json` but does not trigger any cache invalidation or data re-fetch. A `workout_summary` webhook event should update the activity list for that user.

**Fix:** On receiving a `workout_summary` event, store the workout summary keyed by `user_id` so the next dashboard load picks it up without a full re-fetch.

---

### TD-6: `get_settings()` Not Cached

**Severity:** LOW — Minor inefficiency; re-reads `.env` on every request.

**Fix:** Decorate `get_settings` with `@lru_cache(maxsize=1)`.

---

### TD-7: No Structured API Error Response to Frontend

**Severity:** LOW — Debugging is harder than it needs to be.

When `_api_get()` fails, the raw `httpx.HTTPStatusError` propagates to FastAPI which returns a generic 500. The frontend shows a generic error with no actionable detail.

**Fix:** Catch `httpx.HTTPStatusError` in the router layer and return a structured JSON error with the status code and a safe message.

---

## Recommended Roadmap

### Phase 1 — Foundation Fixes (Pre-requisites for all new features)

| # | Task | Debt Ref | Severity |
|---|---|---|---|
| F-1 | Expand OAuth scopes (`power_zones_read routes_read plans_read offline_data`) | TD-1 | HIGH |
| F-2 | Auto-refresh expired access tokens | TD-2 | HIGH |
| F-3 | Extend workout normalization with performance fields | TD-3 | MEDIUM |
| F-4 | Add pagination to workout list fetch | TD-4 | MEDIUM |

### Phase 2 — High Value Features

| Priority | Feature | API Endpoints | New Scopes |
|---|---|---|---|
| 1 | **Workout Analytics** — weekly/monthly volume, distance, calorie, duration trends, PRs | `GET /v1/workouts`, `GET /v1/workouts/:id/workout_summary` | none (already have `workouts_read`) |
| 2 | **Power Zones** — FTP dashboard, zone visualization, training load insights | `GET /v1/power_zones` | `power_zones_read` |
| 3 | **Workout Summary Detail** — NP, TSS, cadence, HR, speed per workout | `GET /v1/workouts/:id/workout_summary` | none |
| 4 | **Routes Library** — route list, stats, start coordinates | `GET /v1/routes`, `GET /v1/routes/:id` | `routes_read` |
| 5 | **Plans Browser** — plan list, details, workout-to-plan linkage | `GET /v1/plans`, `GET /v1/workouts/:id/plans` | `plans_read` |

### Phase 3 — Advanced Enhancements

| Feature | Notes |
|---|---|
| FIT File Processing | Upload `.fit` file, poll status token, parse metrics server-side |
| Webhook-driven refresh | Push new workout_summary data into the session cache on receipt |
| Calendar view | Workouts on a monthly grid with daily strain/recovery overlay |
| Athlete performance insights | Fitness score trend, VO2max proxy, CTL/ATL/TSB load model |

---

## OAuth Scope Summary

| Scope | Current | Required For |
|---|---|---|
| `user_read` | ✅ | Profile, user ID |
| `workouts_read` | ✅ | Activities, workout summaries |
| `power_zones_read` | ❌ | Power zone dashboard |
| `routes_read` | ❌ | Route library |
| `plans_read` | ❌ | Plan browser |
| `offline_data` | ❌ | Webhook delivery |
| `email` | ❌ | Not needed |
| `user_write` | ❌ | Not needed |
| `workouts_write` | ❌ | Not needed for read-only dashboard |

---

## Rate Limit Context

| Environment | Per 5 min | Per hour | Per day |
|---|---|---|---|
| Sandbox | 25 | 100 | 250 |
| Production | 200 | 1,000 | 5,000 |

Current dashboard issues **4 concurrent API calls** per `/api/metrics/history` request (HR, recovery, strain, activities). New Phase 2 features add 1–3 calls per load. Pagination adds 1 call per 30 workouts in the date window.

The existing `rate_limit_store` records all `X-RateLimit-*` headers and the admin dashboard surfaces them — this infrastructure is sufficient for Phase 2.
