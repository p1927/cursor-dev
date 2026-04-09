#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="$SCRIPT_DIR/../runtime/agentmesh.pid"
if [[ -f "$PIDFILE" ]]; then
  pid="$(cat "$PIDFILE")"
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" && echo "Stopped AgentMesh (pid $pid)"
  fi
  rm -f "$PIDFILE"
else
  echo "No agentmesh.pid"
fi
