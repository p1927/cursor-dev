#!/usr/bin/env bash
# Serve this folder over HTTP and expose it with a Cloudflare quick tunnel (trycloudflare.com).
# Requires: cloudflared on PATH, python3.
# Usage: ./run-with-cloudflare-tunnel.sh
# Env: PORT (default 9876)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-9876}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" >&2
  exit 1
fi

cd "$ROOT"
python3 -m http.server "$PORT" --bind 127.0.0.1 &
HTTP_PID=$!

cleanup() {
  kill "$HTTP_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "Local: http://127.0.0.1:${PORT}/" >&2
echo "Starting Cloudflare quick tunnel (public URL appears below)…" >&2
exec cloudflared tunnel --url "http://127.0.0.1:${PORT}"
