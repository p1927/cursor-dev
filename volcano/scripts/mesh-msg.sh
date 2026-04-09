#!/usr/bin/env bash
# Post a message to AgentMesh (default channel general). Uses runtime/agentmesh.env.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVFILE="$SCRIPT_DIR/../runtime/agentmesh.env"
FROM="${1:?usage: mesh-msg.sh <from_agent> <message text...>}"
shift
TEXT="${*:?message required}"

if [[ -f "$ENVFILE" ]]; then
  # shellcheck source=/dev/null
  source "$ENVFILE"
fi
AGENTMESH_URL="${AGENTMESH_URL:-http://127.0.0.1:8766}"
MESH_ROOT="$(cd "$SCRIPT_DIR/../../agentmesh" && pwd)"
PY="python3"
[[ -f "$MESH_ROOT/.venv/bin/python" ]] && PY="$MESH_ROOT/.venv/bin/python"
export AGENTMESH_URL
"$PY" "$MESH_ROOT/cli.py" send --from "$FROM" --text "$TEXT"
