#!/bin/bash
# Wahoo Dashboard — restart frontend & backend

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"

echo "[wahoo] Stopping existing processes on ports 8000 and 5173..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "  ✓ killed backend (port 8000)" || echo "  · backend not running"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "  ✓ killed frontend (port 5173)" || echo "  · frontend not running"

sleep 1

echo "[wahoo] Starting backend..."
(
  cd "$BACKEND_DIR"
  source venv/bin/activate
  uvicorn main:app --reload --port 8000 >> "$LOG_DIR/backend.log" 2>&1
) &
BACKEND_PID=$!

# Wait briefly and confirm it started
sleep 2
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
  echo "  ✓ backend up  → http://localhost:8000  (pid $BACKEND_PID)"
else
  echo "  ! backend may still be starting — check logs/backend.log"
fi

echo "[wahoo] Starting frontend..."
(
  cd "$FRONTEND_DIR"
  npm run dev >> "$LOG_DIR/frontend.log" 2>&1
) &
FRONTEND_PID=$!

sleep 3
echo "  ✓ frontend up → http://localhost:5173  (pid $FRONTEND_PID)"
echo "  ✓ admin panel → http://localhost:5173/admin"
echo ""
echo "[wahoo] Logs:"
echo "  backend:  logs/backend.log"
echo "  frontend: logs/frontend.log"
echo ""
echo "[wahoo] To stop: kill $BACKEND_PID $FRONTEND_PID"
echo "        or run:  lsof -ti:8000,5173 | xargs kill"

# Save PIDs for the stop script
echo "$BACKEND_PID $FRONTEND_PID" > "$ROOT/.pids"
