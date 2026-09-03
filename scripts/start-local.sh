#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export STORE="${STORE:-file}"
export OPERATOR_PIN="${OPERATOR_PIN:-0909}"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3000}"

echo "==> Stopping stale Next.js / tunnel processes on port ${PORT}..."
pkill -f 'next dev' 2>/dev/null || true
pkill -f 'next start' 2>/dev/null || true
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
fi
sleep 1

if [[ ! -d .next ]] || [[ ! -f .next/BUILD_ID ]]; then
  echo "==> Building production bundle..."
  npm run build
else
  echo "==> Using existing .next build ($(cat .next/BUILD_ID))"
fi

echo "==> Starting production server on http://${HOST}:${PORT}"
echo "    STORE=${STORE} OPERATOR_PIN=${OPERATOR_PIN}"
exec npm start -- -H "$HOST" -p "$PORT"
