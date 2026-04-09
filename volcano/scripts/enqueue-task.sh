#!/usr/bin/env bash
# Usage: enqueue-task.sh "Short title" <<'EOF' ...instructions... EOF
set -euo pipefail

TITLE="${1:?usage: enqueue-task.sh \"title\" <<EOF ... EOF}"
shift || true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VOLCANO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PENDING="$VOLCANO_ROOT/queue/pending"
mkdir -p "$PENDING"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
cat >"$TMP"

RAND="$(python3 -c "import secrets; print(secrets.token_hex(3))")"
TASK_ID="TASK-$(date -u +%Y%m%d-%H%M%S)-${RAND}"
OUT="$PENDING/${TASK_ID}.json"

python3 - "$TASK_ID" "$TITLE" "$OUT" "$TMP" <<'PY'
import json, os, sys, time, pathlib

EXTRA_KEYS = frozenset(
    {
        "acceptance",
        "verify_commands",
        "paths_allow",
        "paths_deny",
        "depends_on",
        "constraints",
        "priority",
        "lane",
    }
)

task_id, title, out_path, instr_path = sys.argv[1:5]
instructions = pathlib.Path(instr_path).read_text(encoding="utf-8")
doc = {
    "id": task_id,
    "title": title,
    "instructions": instructions,
    "created_by": "manager",
    "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
}
raw = os.environ.get("VOLCANO_EXTRA_JSON", "").strip()
if raw:
    try:
        blob = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"VOLCANO_EXTRA_JSON: invalid JSON ({e})", file=sys.stderr)
        sys.exit(1)
    if not isinstance(blob, dict):
        print("VOLCANO_EXTRA_JSON: must be a JSON object", file=sys.stderr)
        sys.exit(1)
    for key, val in blob.items():
        if key in EXTRA_KEYS:
            doc[key] = val
pathlib.Path(out_path).write_text(json.dumps(doc, indent=2), encoding="utf-8")
print(out_path)
PY

echo "Enqueued: $OUT" >&2
