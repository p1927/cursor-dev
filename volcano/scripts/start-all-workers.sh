#!/usr/bin/env bash
# Start VOLCANO workers 1 and 2 in background (nohup).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME="$SCRIPT_DIR/../runtime"
mkdir -p "$RUNTIME"
RUNTIME="$(cd "$RUNTIME" && pwd)"

# Shared AgentMesh hub for cross-agent messages + hub tasks (optional but recommended)
"$SCRIPT_DIR/start-agentmesh.sh" || echo "Warning: AgentMesh not started (workers still run)" >&2

for id in 1 2; do
  pidfile="$RUNTIME/worker-${id}.pid"
  log="$RUNTIME/worker-${id}.outer.log"
  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    echo "Worker ${id} already running (pid $(cat "$pidfile"))"
    continue
  fi
  nohup "$SCRIPT_DIR/start-worker.sh" "$id" >>"$log" 2>&1 &
  echo $! >"$pidfile"
  echo "Started VOLCANO worker ${id} pid=$(cat "$pidfile") log=$log"
done
