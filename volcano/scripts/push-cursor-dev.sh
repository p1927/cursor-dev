#!/usr/bin/env bash
# Run AgentMesh integration tests; commit and push cursor-dev if clean.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
MSG="${1:-chore: update cursor-dev after tests}"

AGENTMESH_DIR="$REPO/agentmesh"
cd "$AGENTMESH_DIR"
if [[ -f .venv/bin/activate ]]; then
  # shellcheck source=/dev/null
  source .venv/bin/activate
fi
./test_integration.sh

cd "$REPO"
git add -A
if git diff --staged --quiet; then
  echo "Nothing to commit in cursor-dev."
else
  git commit -m "$MSG"
fi

gh auth setup-git 2>/dev/null || true
git push
echo "push-cursor-dev: done"
