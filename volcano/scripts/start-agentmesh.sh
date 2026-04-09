#!/usr/bin/env bash
# Start AgentMesh hub for VOLCANO (shared by Manager + workers). Idempotent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VOLCANO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUNTIME="$VOLCANO_ROOT/runtime"
MESH_ROOT="$(cd "$VOLCANO_ROOT/../agentmesh" && pwd)"
PIDFILE="$RUNTIME/agentmesh.pid"
ENVFILE="$RUNTIME/agentmesh.env"
# Avoid inheriting AGENTMESH_* from one-off test shells; set VOLCANO_MESH_PORT / VOLCANO_MESH_DB to override.
PORT="${VOLCANO_MESH_PORT:-8766}"
DB="${VOLCANO_MESH_DB:-$RUNTIME/agentmesh.db}"

mkdir -p "$RUNTIME"

health() {
  curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1
}

if health; then
  echo "AgentMesh already up on port ${PORT}"
else
  if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Stale agentmesh.pid; process dead but port not healthy — remove pid and retry" >&2
    rm -f "$PIDFILE"
  fi
  LOG="$RUNTIME/agentmesh.outer.log"
  (
    cd "$MESH_ROOT"
    if [[ -f .venv/bin/activate ]]; then
      # shellcheck source=/dev/null
      source .venv/bin/activate
    fi
    export AGENTMESH_DB="$DB"
    export AGENTMESH_PORT="$PORT"
    PY=python3
    [[ -f .venv/bin/python ]] && PY=.venv/bin/python
    exec "$PY" server.py
  ) >>"$LOG" 2>&1 &
  echo $! >"$PIDFILE"
  for _ in $(seq 1 60); do
    health && break
    sleep 0.15
  done
  if ! health; then
    echo "AgentMesh failed to become healthy (port ${PORT}). See $LOG" >&2
    exit 1
  fi
  echo "Started AgentMesh pid=$(cat "$PIDFILE") port=${PORT} db=${DB}"
fi

mkdir -p "$(dirname "$ENVFILE")"
{
  echo "export AGENTMESH_URL=http://127.0.0.1:${PORT}"
  echo "export AGENTMESH_DB=$DB"
  echo "export AGENTMESH_PORT=$PORT"
  echo "export VOLCANO_AGENTMESH_CLI=$MESH_ROOT/cli.py"
} >"$ENVFILE"
echo "Wrote $ENVFILE"
