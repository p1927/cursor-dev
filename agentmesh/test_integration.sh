#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PY="python3"
[[ -f .venv/bin/python ]] && PY=".venv/bin/python"
$PY -c "import fastapi" 2>/dev/null || {
  echo "Install deps: python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt"
  exit 1
}

export AGENTMESH_DB="${TMPDIR:-/tmp}/agentmesh-test-$$.db"
export AGENTMESH_PORT="${AGENTMESH_PORT:-18766}"
export AGENTMESH_URL="http://127.0.0.1:${AGENTMESH_PORT}"
rm -f "$AGENTMESH_DB"

$PY server.py &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; rm -f "$AGENTMESH_DB"; }
trap cleanup EXIT

for _ in $(seq 1 50); do
  curl -sf "http://127.0.0.1:${AGENTMESH_PORT}/health" >/dev/null && break
  sleep 0.1
done

$PY cli.py register --name a1
$PY cli.py send --from a1 --text "coordination ping"
$PY cli.py task-create --title "integration task" --desc "test" --from a1
$PY cli.py claim --id 1 --agent a2
$PY cli.py done --id 1 --agent a2 --result "completed in test"
$PY cli.py inbox --since 0 | grep -q coordination

echo "integration OK"
echo "All tests passed."
