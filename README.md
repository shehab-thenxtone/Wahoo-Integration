# Wahoo Dashboard

Full-stack web application for Wahoo wearable metrics. Displays real-time and historical HR, HRV, Recovery, Strain, and Activities in an interactive dashboard. Includes a hidden admin panel at  for API rate-limit monitoring.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 6, Tailwind CSS 3, Recharts 2 |
| Backend | FastAPI, Python 3.14, httpx |
| Storage | JSON files (sessions.json, rate_limits.json) |
| Auth | Wahoo OAuth 2.0 (demo mode when no credentials) |

---

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv venv           # already created
source venv/bin/activate       # or: venv\Scripts\activate on Windows
pip install -r requirements.txt

# Copy env template and optionally add real Wahoo credentials
cp .env.example .env
# Edit .env — leave DEMO_MODE=true to run with sample data

uvicorn main:app --reload --port 8000
```

The API is available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install        # already installed
npm run dev
```

Open http://localhost:5173

---

## Routes

| URL | Description |
|-----|-------------|
|  | Connect Wahoo account (or auto-redirect in demo mode) |
|  | Main metrics dashboard |
|  | **Hidden** admin panel — rate limit monitoring (no link from app) |

---

## Demo Mode

When  (default) or when Wahoo credentials are absent, the app runs against the bundled 30-day sample dataset from . All charts and tables are fully functional with this data.

---

## Real Wahoo Integration

1. Register your app at https://developers.wahooligan.com
2. Copy  → 
3. Set , , 
4. Set 
5. Set  to a random hex string: 
6. Restart backend — the Connect page will redirect to Wahoo OAuth

---

## Admin Dashboard

Navigate directly to http://localhost:5173/admin — there is **no link** from the main dashboard.

Shows:
- Circular rate-limit gauge (remaining/hour)
- Requests-today count and connected-user sessions
- Rate-limit remaining over time (line chart)
- Per-endpoint request breakdown (horizontal bar chart)
- Recent API calls log table (last 15 calls)
- Auto-refreshes every 30 seconds

Rate limit data is stored in  (git-ignored, auto-created on first API call).

---

## Project Structure

```
wahoo-dashboard/
├── backend/
│   ├── main.py                     # FastAPI app
│   ├── config.py                   # Pydantic settings
│   ├── routers/
│   │   ├── auth.py                 # OAuth connect/callback/disconnect
│   │   ├── metrics.py              # today + history endpoints
│   │   └── admin.py                # rate-limit endpoints
│   ├── services/
│   │   ├── wahoo_client.py         # API client (demo fallback)
│   │   ├── session_store.py        # JSON token store
│   │   └── rate_limit_store.py     # JSON rate-limit tracker
│   ├── models/schemas.py           # Pydantic response models
│   ├── data/sample_data.json       # 30-day demo dataset
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── ConnectPage.tsx     # OAuth connect UI
        │   ├── DashboardPage.tsx   # Main metrics view
        │   └── AdminPage.tsx       # Admin rate-limit panel
        ├── components/
        │   ├── dashboard/          # HR, HRV, Recovery, Strain, Activities
        │   └── admin/              # Gauge, History charts
        ├── hooks/                  # useAuth, useWahooData
        └── lib/                    # api.ts (typed fetch), utils.ts
```

---

## Rate Limits (Wahoo Free Tier)

- 100 requests / hour
- 1 000 requests / day
- Caching built in: metrics are fetched once per page load (no polling)
