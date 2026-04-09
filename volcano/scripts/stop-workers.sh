#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME="$SCRIPT_DIR/../runtime"
[ -d "$RUNTIME" ] || exit 0
RUNTIME="$(cd "$RUNTIME" && pwd)"

for id in 1 2; do
  pidfile="$RUNTIME/worker-${id}.pid"
  if [ -f "$pidfile" ]; then
    pid="$(cat "$pidfile")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" && echo "Stopped worker ${id} (pid $pid)" || true
    fi
    rm -f "$pidfile"
  fi
done
