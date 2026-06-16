#!/bin/bash
# Wahoo Dashboard — stop frontend & backend

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "[wahoo] Stopping services..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "  ✓ backend stopped" || echo "  · backend not running"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "  ✓ frontend stopped" || echo "  · frontend not running"

rm -f "$ROOT/.pids"
echo "[wahoo] Done."
