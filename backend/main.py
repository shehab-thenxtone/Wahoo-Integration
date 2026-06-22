from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from config import get_settings
from routers import auth, metrics, admin, webhooks, workouts, power_zones, routes, plans

settings = get_settings()

app = FastAPI(
    title="Wahoo Dashboard API",
    description="REST API for Wahoo wearable metrics dashboard",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers — all under /api prefix
app.include_router(auth.router)
app.include_router(metrics.router)
app.include_router(admin.router)
app.include_router(webhooks.router)
app.include_router(workouts.router)
app.include_router(power_zones.router)
app.include_router(routes.router)
app.include_router(plans.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "demo_mode": settings.is_demo,
        "webhooks_configured": bool(settings.wahoo_webhook_secret),
    }


# ── Static frontend (production / devtunnel mode) ─────────────────────────────

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

# Mount /assets only if the dir exists at startup (StaticFiles requires it).
# Remount is not possible after startup, so the build must exist before starting.
_assets_dir = FRONTEND_DIST / "assets"
if _assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="static-assets")


@app.get("/favicon.svg", include_in_schema=False)
async def _favicon_svg():
    f = FRONTEND_DIST / "favicon.svg"
    if not f.exists():
        raise HTTPException(status_code=404)
    return FileResponse(f)


@app.get("/favicon-512.png", include_in_schema=False)
async def _favicon_png():
    f = FRONTEND_DIST / "favicon-512.png"
    if not f.exists():
        raise HTTPException(status_code=404)
    return FileResponse(f)


# SPA catch-all: always registered so OAuth callbacks always land on index.html
@app.get("/{full_path:path}", include_in_schema=False)
async def _spa(full_path: str):
    index = FRONTEND_DIST / "index.html"
    if not index.exists():
        raise HTTPException(
            status_code=503,
            detail="Frontend not built — run: cd frontend && npm run build",
        )
    return FileResponse(str(index))
