#!/usr/bin/env bash
# VOLCANO Worker loop — one headless Cursor agent claiming tasks from queue/pending/
set -euo pipefail

WORKER_ID="${1:?usage: start-worker.sh <1|2>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VOLCANO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$VOLCANO_ROOT/.." && pwd)"
PENDING="$VOLCANO_ROOT/queue/pending"
CLAIMED="$VOLCANO_ROOT/queue/claimed"
DONE="$VOLCANO_ROOT/archive/done"
RESULTS="$VOLCANO_ROOT/results"
PROMPT_BASE="$VOLCANO_ROOT/prompts/worker-system.md"
LOG="${VOLCANO_ROOT}/runtime/worker-${WORKER_ID}.log"

mkdir -p "$CLAIMED" "$DONE" "$RESULTS" "$(dirname "$LOG")"

if ! command -v agent >/dev/null 2>&1; then
  echo "agent (Cursor CLI) not found on PATH" >&2
  exit 1
fi

WORKER_BODY="$(sed "s/{{WORKER_ID}}/${WORKER_ID}/g" "$PROMPT_BASE")"

echo "[volcano] Worker ${WORKER_ID} starting — repo=${REPO_ROOT}" | tee -a "$LOG"

while true; do
  shopt -s nullglob
  mapfile -t files < <(find "$PENDING" -maxdepth 1 -name '*.json' -type f 2>/dev/null | sort)
  shopt -u nullglob

  if [ "${#files[@]}" -eq 0 ]; then
    sleep 8
    continue
  fi

  claimed=""
  for f in "${files[@]}"; do
    base="$(basename "$f")"
    target="$CLAIMED/w${WORKER_ID}_${base}"
    if mv "$f" "$target" 2>/dev/null; then
      claimed="$target"
      break
    fi
  done

  if [ -z "$claimed" ]; then
    sleep 2
    continue
  fi

  TASK_ID="$(VOLCANO_TASK_FILE="$claimed" python3 -c "import json, os; print(json.load(open(os.environ['VOLCANO_TASK_FILE'], encoding='utf-8'))['id'])")"
  echo "[volcano] Worker ${WORKER_ID} claimed $(basename "$claimed") task_id=${TASK_ID}" | tee -a "$LOG"

  MESH_HINT=""
  if [[ -f "$VOLCANO_ROOT/runtime/agentmesh.env" ]]; then
    MESH_HINT="
- **AgentMesh (optional):** \`source ${VOLCANO_ROOT}/runtime/agentmesh.env\` then \`python3 \"\$VOLCANO_AGENTMESH_CLI\" register --name volcano-w${WORKER_ID}\` (once per session) and use \`send\` / \`inbox\` to coordinate with the other worker or the Manager.
"
  fi

  USER_MSG="${WORKER_BODY}

## Current assignment (read the JSON path below)

- Task file (read fully): \`${claimed}\`
- Write result to: \`${RESULTS}/${TASK_ID}.md\` (see volcano/prompts/protocol.md).
- Repository root (workspace): \`${REPO_ROOT}\`
${MESH_HINT}
"

  set +e
  agent --print --approve-mcps --force --workspace "$REPO_ROOT" "$USER_MSG" >>"$LOG" 2>&1
  agent_rc=$?
  set -e

  mkdir -p "$DONE"
  mv "$claimed" "$DONE/$(basename "$claimed")"
  echo "[volcano] Worker ${WORKER_ID} archived task rc=${agent_rc} $(basename "$claimed")" | tee -a "$LOG"
done
