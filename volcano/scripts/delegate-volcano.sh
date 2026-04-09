#!/usr/bin/env bash
# Enqueue a VOLCANO task (stdin = instructions) and broadcast to AgentMesh.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TITLE="${1:?usage: delegate-volcano.sh \"Task title\" <<'EOF' ... EOF}"
shift

TMPF="$(mktemp)"
trap 'rm -f "$TMPF"' EXIT
cat >"$TMPF"

PATH_JSON="$("$SCRIPT_DIR/enqueue-task.sh" "$TITLE" <"$TMPF")"
TASK_ID="$(basename "$PATH_JSON" .json)"

"$SCRIPT_DIR/start-agentmesh.sh" || true
"$SCRIPT_DIR/mesh-msg.sh" manager "[VOLCANO] New task ${TASK_ID}: ${TITLE}"

echo "Enqueued: $PATH_JSON"
echo "Broadcast sent for ${TASK_ID}"
