# Wahoo Dashboard

A full-stack personal fitness dashboard integrating with the [Wahoo API](https://developers.wahooligan.com/).
Built with React + Vite (frontend) and FastAPI (backend). Runs entirely on localhost — no cloud services required.

---

## Quick Start

```bash
# 1. Install backend deps (Python 3.11+)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env — add WAHOO_CLIENT_ID / WAHOO_CLIENT_SECRET (or leave blank for demo mode)

# 3. Install frontend deps (Node 18+)
cd ../frontend
npm install

# 4. Start both services
cd ..
chmod +x start.sh stop.sh
./start.sh
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Routes

| Path | Description |
|---|---|
| `/` | Connect page — link your Wahoo account |
| `/dashboard` | Main metrics dashboard |
| `/admin` | Admin panel — API rate limit graphs (no login required) |
| `/privacy` | Privacy policy |
| `/error/400` | 400 Bad Request |
| `/error/401` | 401 Unauthorized |
| `/error/403` | 403 Forbidden |
| `/error/404` | 404 Not Found |
| `/error/429` | 429 Too Many Requests |
| `/error/500` | 500 Server Error |
| `/error/503` | 503 Service Unavailable |
| `*` | Any unknown path → 404 |

---

## Demo Mode

Demo mode activates automatically when `WAHOO_CLIENT_ID` is empty or `DEMO_MODE=true` in `.env`.

- All API calls return a realistic 30-day sample dataset from `backend/data/sample_data.json`
- No outbound requests are made to Wahoo
- A **Demo Mode** badge appears in the dashboard header
- The rate-limit history in `/admin` will be empty (no real API calls logged)

---

## Real OAuth Setup

1. Register an app at [developers.wahooligan.com](https://developers.wahooligan.com/)
2. Set the redirect URI to `http://localhost:8000/api/auth/callback`
3. Copy your Client ID and Client Secret into `backend/.env`
4. Set `DEMO_MODE=false`
5. Restart with `./start.sh`

Click **Connect Wahoo Account** on the home screen to begin OAuth.

---

## Admin Panel

Visit [http://localhost:5173/admin](http://localhost:5173/admin) directly — there is no navigation link from the main app.

Shows:
- Current rate limit remaining (100 req/hr on the free tier)
- Historical usage graph (requests vs. limit over time)
- Per-endpoint request breakdown
- Recent API call log

The panel auto-refreshes every 30 seconds.

---

## Error Pages

All HTTP error states have dedicated pages accessible at `/error/<code>`:

| Code | Title | Trigger |
|---|---|---|
| 400 | Bad Request | Malformed parameters |
| 401 | Unauthorized | Session missing / expired |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Page or resource missing |
| 429 | Too Many Requests | Wahoo rate limit hit |
| 500 | Server Error | Backend unavailable |
| 503 | Service Unavailable | Wahoo API down |

A global **React Error Boundary** catches unhandled render errors and shows a 500-style page instead of a blank screen.

The backend redirects to `/error/<code>` when appropriate (e.g., session expired → `/error/401`).

---

## Privacy Policy

A full privacy policy is available at [/privacy](/privacy). Key points:

- Health data is **never written to disk** — only fetched live and rendered in the browser
- Two local files are stored: `sessions.json` (OAuth tokens) and `rate_limits.json` (API call metadata, no health data)
- Both files are excluded from version control via `.gitignore`
- Disconnect removes your OAuth tokens immediately
- No analytics, telemetry, or third-party trackers

---

## Webhooks

The backend exposes a webhook endpoint for Wahoo push events:

```
POST /api/webhooks/wahoo
```

### Setup

1. Generate a webhook secret:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
2. Add it to `backend/.env`:
   ```
   WAHOO_WEBHOOK_SECRET=your_generated_secret
   ```
3. Register your endpoint in the [Wahoo developer portal](https://developers.wahooligan.com/):
   - URL: `https://your-public-host/api/webhooks/wahoo`
   - Wahoo will sign each request with `X-Wahoo-Signature: sha256=<hex>`

### Webhook API

| Endpoint | Method | Description |
|---|---|---|
| `/api/webhooks/wahoo` | `POST` | Receive Wahoo push events |
| `/api/webhooks/status` | `GET` | Configuration status + recent events |
| `/api/webhooks/events` | `DELETE` | Clear the event log |

Webhook events are stored in `backend/data/webhook_events.json` (capped at 500 entries, excluded from git).

### Security

Every incoming webhook is verified with HMAC-SHA256 before processing.
Requests older than 5 minutes are rejected to prevent replay attacks.
If `WAHOO_WEBHOOK_SECRET` is unset (dev mode), requests are accepted but flagged as unverified.

---

## Stopping the App

```bash
./stop.sh
```

Or kill by port:

```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

## Project Structure

```
Wahoo_Chest_Strap/
├── backend/
│   ├── config.py               # Pydantic settings (reads .env)
│   ├── main.py                 # FastAPI app + CORS + router registration
│   ├── requirements.txt
│   ├── .env.example
│   ├── data/
│   │   └── sample_data.json    # 30-day demo dataset
│   ├── models/
│   │   └── schemas.py          # Pydantic v2 response models
│   ├── routers/
│   │   ├── auth.py             # OAuth flow + session cookie
│   │   ├── metrics.py          # Heart rate / HRV / Recovery / Strain / Activities
│   │   ├── admin.py            # Rate limit stats
│   │   └── webhooks.py         # Wahoo push events (HMAC verified)
│   └── services/
│       ├── wahoo_client.py     # Wahoo API client + demo data shim
│       ├── session_store.py    # File-backed OAuth token store
│       └── rate_limit_store.py # File-backed API call log
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # BrowserRouter + all routes
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── dashboard/      # HR / HRV / Recovery / Strain / Activity widgets
│   │   │   ├── admin/          # Rate limit gauge + history charts
│   │   │   └── ui/             # Card, Badge, Loader
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useWahooData.ts
│   │   ├── lib/
│   │   │   ├── api.ts          # Typed fetch wrappers
│   │   │   └── utils.ts        # Formatters, color helpers
│   │   ├── pages/
│   │   │   ├── ConnectPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   ├── PrivacyPage.tsx
│   │   │   └── ErrorPage.tsx   # 400 / 401 / 403 / 404 / 429 / 500 / 503
│   │   └── styles/
│   │       └── global.css
│   ├── public/
│   │   └── favicon.svg
│   └── index.html
├── start.sh                    # Start backend + frontend
├── stop.sh                     # Stop both services
└── README.md
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS 3, Recharts |
| Backend | FastAPI, Pydantic v2, uvicorn, httpx |
| Auth | Wahoo OAuth 2.0, httpOnly cookie session |
| Storage | `sessions.json` (tokens), `rate_limits.json` (API log), `webhook_events.json` (events) |
| Charts | Recharts (Area, Line, Bar, Pie) |
| Icons | SVG inline |
