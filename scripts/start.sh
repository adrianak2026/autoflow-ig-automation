#!/bin/bash
set -euo pipefail

echo "==> Starting Next.js dashboard"
npm run start >/tmp/koshverse-next.log 2>&1 &
NEXT_PID=$!

cleanup() {
  echo "==> Shutting down Next.js (pid $NEXT_PID)"
  kill "$NEXT_PID" >/dev/null 2>&1 || true
  wait "$NEXT_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 6

echo "==> Health check"
curl -s -o /dev/null -w "dashboard health = %{http_code}\n" http://127.0.0.1:3000/api/health
curl -s -o /dev/null -w "dashboard root  = %{http_code}\n" http://127.0.0.1:3000/

echo ""
echo "Dashboard is running at http://127.0.0.1:3000"
echo "Press Ctrl+C to stop the dashboard."

wait "$NEXT_PID"
