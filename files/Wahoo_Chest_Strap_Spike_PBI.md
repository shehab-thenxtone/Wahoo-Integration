# Spike: Wahoo Chest Strap Integration Research & Documentation

**Project:** thenxt-doo  
**Area Path:** thenxt-doo\Cortex-Scrum  
**Work Item Type:** Spike  
**Sprint:** Cortex Scrum / Sprint 2

---

## Summary

As a QA engineer responsible for wearable device testing, I want to document Wahoo Chest Strap integration capabilities, limitations, and competitive positioning, so that I can design robust test cases and assess feasibility for healthcare app wearable support.

---

## Description

This Spike explores Wahoo Chest Strap as a potential wearable integration target for our healthcare platform. Deliverables include:
1. Comprehensive integration documentation with OAuth flow, API patterns, and step-by-step implementation guidance
2. Competitive analysis comparing Wahoo against 3+ alternatives
3. Sample web application visualizing Wahoo metrics with mock data

---

## Acceptance Criteria

### 1. Integration Documentation (HTML File)

**1.1 Device Overview Section**
- [ ] Technical specifications (dimensions, weight, compatibility, firmware version range)
- [ ] Supported metrics with data types and ranges:
  - Heart Rate (BPM): Range, accuracy, update frequency (real-time vs. 1Hz)
  - HRV (Heart Rate Variability): RMSSD or time-domain metric, unit (ms)
  - Daily Strain Score: Aggregation method, scale (0–100), calculation window
  - Recovery Score: Definition, factors influencing
  - ECG capability (if available): Resolution, sampling rate
- [ ] Data synchronization: Real-time vs. synced, battery impact, offline behavior
- [ ] Supported platforms (iOS, Android, web) and OS version minimums
- [ ] Diagrams: Device photo/illustration, positioning guide on body, LED indicators

**1.2 Integration Know-How Section (Step-by-Step)**

**Step 1: Authentication & OAuth 2.0 Flow**
- [ ] OAuth 2.0 authorization code flow (not PKCE for server-to-server; PKCE for native apps)
- [ ] Client ID & Client Secret acquisition:
  - Wahoo Developer Portal URL
  - Registration process (org verification if required)
  - Scope requirements (read:user, read:heart_rate, read:workouts, read:athlete)
- [ ] Authorization endpoint: `https://api.wahooligan.com/oauth/authorize`
- [ ] Token endpoint: `https://api.wahooligan.com/oauth/token`
- [ ] Token format (Bearer token), TTL (e.g., 3600s), refresh token availability
- [ ] Example cURL request & response (with sanitized credentials):
  ```bash
  curl -X POST https://api.wahooligan.com/oauth/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&redirect_uri=YOUR_REDIRECT_URI"
  ```
- [ ] Token storage best practices (secure credential store, no plaintext)

**Step 2: API Authentication & Headers**
- [ ] Bearer token inclusion in request headers:
  ```
  Authorization: Bearer <access_token>
  ```
- [ ] Required headers (User-Agent, Content-Type, Accept)
- [ ] Rate limiting headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- [ ] Error responses: 401 (Unauthorized), 403 (Forbidden), 429 (Rate Limited), 500 (Server Error)

**Step 3: User Profile & Initial Data Fetch**
- [ ] Endpoint: `GET /v1/user/me`
- [ ] Response schema:
  ```json
  {
    "id": "<user_uuid>",
    "first_name": "John",
    "last_name": "Doe",
    "email": "<user_email>",
    "created_at": "ISO8601 timestamp",
    "device_ids": ["<device_uuid>"]
  }
  ```
- [ ] Device UUID extraction for subsequent queries
- [ ] Pagination handling (if multiple devices)

**Step 4: Fetch Heart Rate & Activity Data**
- [ ] Endpoint for heart rate: `GET /v1/user/me/metrics/heart_rate`
- [ ] Query parameters:
  - `start_date`: ISO 8601 format (e.g., `2024-06-01T00:00:00Z`)
  - `end_date`: ISO 8601 format
  - `granularity`: Options—`raw` (1Hz), `minute` (1-minute aggregates), `day` (daily summaries)
  - `limit`: Pagination size (recommended: 100–1000)
  - `offset` or `cursor`: For result pagination
- [ ] Response schema for raw data:
  ```json
  {
    "data": [
      {
        "timestamp": "ISO8601",
        "heart_rate": <BPM>,
        "confidence": <0.0–1.0>
      }
    ],
    "pagination": {
      "next_cursor": "<cursor_for_next_page>",
      "has_more": true/false
    }
  }
  ```
- [ ] Data aggregation for minute/day granularities (min, max, avg, stddev)
- [ ] Handling sparse data (gaps, missing readings during sleep)

**Step 5: Fetch HRV & Recovery Metrics**
- [ ] Endpoint: `GET /v1/user/me/metrics/hrv`
- [ ] HRV aggregation method (RMSSD, LF/HF ratio)
- [ ] Recovery Score endpoint: `GET /v1/user/me/metrics/recovery`
- [ ] Recovery calculation inputs (sleep quality, HRV trend, HR trend)
- [ ] Response timestamps: Aggregated at start-of-day or mid-night UTC?

**Step 6: Webhook Configuration (Optional)**
- [ ] Real-time data push via webhooks:
  - Webhook registration endpoint: `POST /v1/webhooks`
  - Supported events: `heart_rate.updated`, `activity.completed`, `recovery.updated`
  - Payload signature verification (HMAC-SHA256 with secret)
- [ ] Retry policy (exponential backoff, max retries)
- [ ] Health check endpoint to verify webhook connectivity

**Step 7: Rate Limiting & Quota Management**
- [ ] Rate limits per tier:
  - Free: 100 requests/hour, 1000 requests/day
  - Paid: 1000 requests/hour, 100k requests/day
- [ ] Best practices: Batch queries, cache results for 5+ minutes, use ETag for conditional requests
- [ ] Handling 429 responses (backoff, exponential retry)
- [ ] Quota reset timestamps (usually UTC midnight)

**Step 8: Error Handling & Recovery**
- [ ] Common error scenarios:
  - 401 Unauthorized: Token expired or invalid → refresh token or re-authenticate
  - 403 Forbidden: Scope insufficient → request new consent
  - 429 Too Many Requests: Backoff and retry with jitter
  - 500 Server Error: Retry with exponential backoff (max 3 attempts, 1s–5s delay)
- [ ] Graceful degradation: Cache last-known metrics if API unavailable
- [ ] Logging strategy: Log request/response summary (not full tokens), error codes, retry counts

**Step 9: Data Persistence & Sync Strategy**
- [ ] Local storage schema (database schema for HR/HRV/recovery metrics)
- [ ] Sync frequency recommendations:
  - Real-time (via webhooks): For active monitoring
  - Polling: Every 5–15 minutes for recent data, daily for historical
  - Batch: Every night for previous day's summary
- [ ] Conflict resolution: If local vs. Wahoo data diverges (trust Wahoo as source of truth)
- [ ] Historical backfill: Fetch up to 1 year of historical data on first sync

**Step 10: Testing & Validation**
- [ ] Unit tests: Token refresh, error parsing, data transformation
- [ ] Integration tests: OAuth flow (sandbox environment), API endpoints with mock responses
- [ ] E2E test: Full auth → data fetch → storage → UI render cycle
- [ ] Test data: Sample API responses in fixtures, mock Wahoo device data for 30-day window

**1.3 Limitations Section**
- [ ] Data latency: Real-time HR available <1s; aggregated metrics delayed by 1–5 minutes
- [ ] Sampling precision: HR resolution = 1 BPM; HRV ± 5% accuracy in lab conditions
- [ ] Offline behavior: Data stored on device, synced within 30 minutes of connectivity
- [ ] Rate limits: 100 requests/hour on free tier; no burst allowance
- [ ] Device compatibility: Wahoo Gen 2 only; Gen 1 has limited ECG support
- [ ] Regional restrictions: API available in North America, EU; Asia-Pacific limited rollout
- [ ] Data retention: Wahoo retains raw data for 90 days; older data aggregated to daily summary
- [ ] Privacy: Requires explicit user consent; cannot share data without user action
- [ ] Cost: API free tier; premium tier $99/month after 1000 requests/day
- [ ] Webhook latency: 2–10 seconds from device event to webhook delivery

**1.4 Competitor Comparison Matrix**

| Feature | **Wahoo** | **Apple Watch** | **Garmin Epix Gen 2** | **Polar Verity Sense** | **Fitbit Sense 2** |
|---------|-----------|---|---|---|---|
| **HR Accuracy** | ±2 BPM (lab), ±5 BPM (field) | ±1 BPM | ±2 BPM | ±1 BPM | ±3 BPM |
| **HRV Support** | Yes (RMSSD) | Yes (HRV, RR Interval) | Yes (HRV, Stress) | Yes (HRV Trend) | Yes (HRV Trend) |
| **Form Factor** | Chest Strap (ANT+, BLE) | Wearable (watch) | Watch + Strap optional | Armband (ANT+, BLE) | Watch + Strap |
| **Battery Life** | 250+ hours | 18 hours | 14 days (watch) | 5 days | 6+ days |
| **Integration API** | Wahoo OAuth 2.0 REST | HealthKit, WorkoutKit | Garmin Connect IQ | Polar Flow OAuth | Google Fit, Fitbit Cloud |
| **Authentication Method** | OAuth 2.0 code flow | Native iOS framework | OAuth 2.0 + API key | OAuth 2.0 | OAuth 2.0 |
| **API Rate Limits** | 100 req/hr (free) | N/A (local) | 30 req/min | 60 req/min | 150 req/hr |
| **Cost** | Free tier available | $0 (requires Apple device) | Free tier available | Free tier available | Free tier available |
| **Webhook Support** | Yes | No (polling only) | Via Connect IQ | Yes | Yes |
| **Historical Data Depth** | 90 days raw | Configurable (HealthKit) | Full lifetime | 60 days | 180 days |
| **GDPR Compliance** | Yes (EU servers) | Yes | Yes | Yes (Nordic HQ) | Yes |
| **Real-time Streaming** | Via webhooks | HealthKit background delivery | Limited (widgets only) | Via webhooks | Via cloud API |
| **Integration Complexity** | Medium (OAuth, 10-step flow) | Low (native framework) | Medium (OAuth + SDK) | Medium (OAuth, webhooks) | Low (REST API) |
| **Documentation Quality** | Good (developer portal) | Excellent (Apple docs) | Moderate (Connect IQ) | Good | Excellent |
| **Community/Support** | Active (fitness community) | Large (iOS dev) | Active (Garmin Connect) | Strong (Nordic region) | Moderate |

**Key Takeaways:**
- **Wahoo:** Best chest strap option; strong HRV support; medium integration complexity; webhook real-time capability
- **Apple Watch:** Lowest integration effort (native HealthKit); limited to iOS; no API calls needed
- **Garmin Epix:** Best multi-sport tracking; excellent battery; higher integration complexity; closed Connect IQ ecosystem
- **Polar Verity Sense:** Nordic choice; strong HRV; best real-time webhook experience
- **Fitbit Sense 2:** Simplest REST API; widest device compatibility; but lower professional-grade HRV accuracy

---

### 2. Sample Web Application (React/HTML)

**2.1 Metrics Display Dashboard**

**Data Visualization Components:**
- [ ] **Heart Rate Widget:**
  - Real-time HR reading display (large, prominent number: 72 BPM)
  - Sparkline chart (7-day HR trend, min/max/avg lines overlaid)
  - Color-coded zones (resting <60 Green, aerobic 60–100 Yellow, threshold 100–140 Orange, max >140 Red)
  - Last updated timestamp + data freshness indicator

- [ ] **HRV (Heart Rate Variability) Widget:**
  - Daily HRV value (RMSSD in ms, e.g., "42ms")
  - 30-day HRV trend chart (line chart with rolling 7-day average)
  - HRV interpretation badge: "Balanced" / "Low" / "High" based on baseline
  - Status: "Normal" / "Elevated Stress" / "Ready to Train" based on trend

- [ ] **Daily Strain Score Widget:**
  - Strain gauge (0–100 scale, needle pointer)
  - Color zones: Green (0–30 Low), Yellow (30–70 Moderate), Red (70–100 High)
  - Comparison to 30-day average (e.g., "Today: 65 vs. Avg: 58")
  - Trend indicator (↑↓ = increasing/decreasing strain over past 7 days)

- [ ] **Recovery Score Widget:**
  - Recovery percentage (0–100%)
  - Recovery status badge: "Well Recovered" / "Partially Recovered" / "Needs Rest"
  - Recovery drivers breakdown (pie chart or stacked bar):
    - Sleep Quality contribution %
    - HRV Trend contribution %
    - Resting HR Trend contribution %
  - Recommendations: "Go hard today" / "Moderate intensity recommended" / "Recovery priority"

- [ ] **Activity/Workout History Table:**
  - Sortable columns: Date, Duration, Avg HR, Max HR, Calories, Type (Running/Cycling/Recovery)
  - Filterable by type (dropdown)
  - Paginated (10 rows per page)
  - Exportable to CSV (Download button)

**2.2 Sample Data Schema (30-Day Window)**

```json
{
  "user": {
    "id": "user_wahoo_123",
    "name": "Sample Athlete",
    "device_id": "wahoo_strap_456",
    "sync_timestamp": "2024-06-13T10:30:00Z"
  },
  "heart_rate_data": [
    {
      "date": "2024-06-13",
      "readings": [
        { "timestamp": "2024-06-13T06:00:00Z", "bpm": 58, "confidence": 0.95 },
        { "timestamp": "2024-06-13T06:01:00Z", "bpm": 59, "confidence": 0.95 }
      ],
      "daily_stats": {
        "resting_hr": 56,
        "avg_hr": 72,
        "max_hr": 165,
        "min_hr": 54,
        "heart_rate_variability_rmssd": 42
      }
    }
  ],
  "recovery_data": [
    {
      "date": "2024-06-13",
      "recovery_score": 65,
      "status": "Partially Recovered",
      "drivers": {
        "sleep_quality_contribution": 0.35,
        "hrv_trend_contribution": 0.30,
        "resting_hr_trend_contribution": 0.35
      },
      "recommendation": "Moderate intensity recommended"
    }
  ],
  "strain_data": [
    {
      "date": "2024-06-13",
      "daily_strain": 68,
      "zone": "Moderate",
      "contributing_activities": [
        { "type": "Running", "duration_minutes": 45, "strain_contribution": 45 },
        { "type": "Recovery", "duration_minutes": 20, "strain_contribution": 8 }
      ]
    }
  ],
  "activity_history": [
    {
      "id": "activity_001",
      "date": "2024-06-13",
      "type": "Running",
      "start_time": "2024-06-13T06:30:00Z",
      "duration_minutes": 45,
      "avg_heart_rate": 155,
      "max_heart_rate": 165,
      "calories_burned": 580,
      "distance_km": 7.2,
      "notes": "Morning run - felt strong"
    },
    {
      "id": "activity_002",
      "date": "2024-06-12",
      "type": "Cycling",
      "start_time": "2024-06-12T18:00:00Z",
      "duration_minutes": 60,
      "avg_heart_rate": 140,
      "max_heart_rate": 158,
      "calories_burned": 720,
      "distance_km": 22.5,
      "notes": "Evening ride - steady pace"
    }
  ]
}
```

**2.3 Technical Stack & Features**

**Frontend Stack:**
- [ ] Framework: React 18+
- [ ] Styling: Tailwind CSS + custom CSS for charts
- [ ] Charting: Recharts (lightweight, responsive, no heavy dependencies)
- [ ] State Management: React hooks (useState, useEffect)
- [ ] Data Source: Mock JSON in `sampleData.json` (no API calls)

**UI/UX Specifications:**
- [ ] **Layout:** Mobile-first responsive (breakpoints: 320px, 640px, 1024px)
- [ ] **Color Scheme:** 
  - Primary: Wahoo brand color (e.g., #1E40AF Blue)
  - HR Zones: Green (#10B981), Yellow (#F59E0B), Orange (#F97316), Red (#DC2626)
  - Background: Light (#F9FAFB) / Dark mode toggle optional
- [ ] **Typography:** 
  - Headings: Bold, 24px–32px
  - Body text: Regular, 14px–16px
  - Monospace for data values (HRV: 42ms, HR: 72 BPM)
- [ ] **Spacing:** 16px base unit (padding, margins, gaps)
- [ ] **Accessibility:**
  - Semantic HTML (main, section, article)
  - ARIA labels on widgets
  - Keyboard navigation (Tab through widgets, Enter to expand)
  - Color contrast WCAG AA (4.5:1 for text)

**Interactions:**
- [ ] **Date Range Picker:** Select custom date range (dropdown calendar); default last 30 days
- [ ] **Widget Expansion:** Click widget title to expand to full-screen detail view
- [ ] **Chart Hover:** Tooltip on hover showing exact value + date
- [ ] **Activity Row Click:** Expand row to show activity details (distance, elevation, splits if available)
- [ ] **Export Button:** Download all visible metrics as CSV or PDF
- [ ] **Refresh:** Manual refresh button; auto-refresh every 5 minutes (background)
- [ ] **Dark Mode Toggle:** Top-right button to switch light/dark theme

**2.4 Sample Data Characteristics (Realistic 30-Day Snapshot)**

- [ ] **HR Patterns:**
  - Resting HR: 55–62 BPM (baseline athlete)
  - Active sessions: 120–160 BPM
  - Peak HR: 165–172 BPM (max effort workouts)
  - Overnight sleeping HR: 50–58 BPM

- [ ] **HRV Trends:**
  - Daily RMSSD: 35–55 ms (moderate fitness level)
  - Elevated stress days: RMSSD drops to 25–30 ms
  - Recovery days: RMSSD rises to 55–70 ms
  - 7-day rolling average trend: Slight upward (improving fitness)

- [ ] **Recovery Scores:**
  - Range: 45–85%
  - Correlation with previous day's strain
  - Post-hard-workout: 45–55% (recovery priority)
  - Post-easy/rest day: 70–85% (ready to train)

- [ ] **Activity Variety:**
  - 20 activities over 30 days (mix of Running, Cycling, Recovery, Strength)
  - 3–4 activities per week
  - Varied durations: 20–90 minutes
  - Realistic calorie burns based on HR and duration

- [ ] **Seasonal Pattern:**
  - Include one "stress event" (e.g., 5 consecutive high-strain days)
  - Include one "recovery week" (3–4 low-strain days with improved recovery)

---

### 3. Deliverables & Artifacts

- [ ] **Wahoo_Integration_Documentation.html**
  - Self-contained HTML file (embeds CSS, all sections)
  - Table of contents with anchor links
  - Device overview, 10-step integration guide, limitations, competitor matrix
  - Printable version (media query for print optimization)

- [ ] **Wahoo_Metrics_Dashboard.jsx** (React Component)
  - Standalone React app
  - Imports mock data from `sampleData.json`
  - Responsive dashboard with all 5 widgets (HR, HRV, Strain, Recovery, Activity History)
  - Can be rendered in browser directly or embedded in a website

- [ ] **sampleData.json**
  - 30-day sample dataset with realistic metrics
  - Documented schema comments
  - Can be used for testing, demos, or as API response template

- [ ] **README.md**
  - Quick start guide
  - How to run the React app locally (npm install, npm start)
  - Data schema documentation
  - Testing assumptions & caveats (mock data, not production-ready)

---

## Definition of Done

- [ ] Documentation HTML is self-contained, printable, and loads without errors
- [ ] All 10 integration steps include code examples (cURL, pseudocode, or both)
- [ ] Competitor comparison includes ≥5 features per device
- [ ] React dashboard is responsive (tested at 320px, 640px, 1024px widths)
- [ ] Sample data is realistic and covers 30-day period
- [ ] All acceptance criteria checked off
- [ ] Artifacts reviewed by team lead for accuracy
- [ ] Links to Wahoo API docs and competitor guides included
- [ ] No hardcoded credentials or API keys in any artifact

---

## Related Links

- [Wahoo Developer Portal](https://developers.wahooligan.com)
- [Wahoo Cloud API Docs](https://cloud-api.wahooligan.com)
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Garmin Connect IQ SDK](https://developer.garmin.com/connect-iq)
- [Polar Flow OAuth](https://www.polar.com/en/developers)
- [Fitbit Web API](https://dev.fitbit.com/build/reference)

---

## Estimation & Effort

**Spike Time Box:** 5–8 business days (depending on Wahoo API sandbox access)

**Breakdown:**
- Integration documentation + 10-step guide: 2–3 days
- Competitor research & matrix: 1–2 days
- Sample React dashboard: 1–2 days
- Testing & refinement: 1 day

---

## Notes for PBI Creator

1. **Prerequisites:** Ensure you have access to Wahoo Developer Portal or sandbox environment
2. **Documentation Format:** Deliverables should be committed to project repository (docs/ folder)
3. **Review Gate:** All acceptance criteria to be reviewed by QA lead and Product Owner before closure
4. **Success Metric:** Team can use these docs to build production Wahoo integration with minimal back-and-forth questions
5. **Next Steps:** If approved, create follow-up PBI for Production Wahoo Integration (separate story)

---

## Tags

`wearable-research` `wahoo` `integration` `healthcare` `spike` `documentation`
