# VOLCANO autonomy — Manager, workers, AgentMesh, ship

Goal: the **Manager** (Cursor chat agent) can delegate, let **two workers** execute in parallel, optionally coordinate over **AgentMesh**, and **push** `cursor-dev` after tests pass.

## Components

| Piece | Role |
|-------|------|
| File queue `volcano/queue/pending/*.json` | Source of truth for VOLCANO tasks |
| `start-worker.sh` ×2 | Headless `agent --print` loops |
| `agentmesh/` (repo root, sibling to `volcano/`) | Localhost HTTP + SQLite: `/messages`, `/tasks` (claim/done) |
| `runtime/agentmesh.env` | `AGENTMESH_URL`, `VOLCANO_AGENTMESH_CLI` for scripts and workers |

## Scripts (from repo root)

```bash
# Hub + workers (Mesh first, then worker loops)
./volcano/scripts/start-all-workers.sh

# Mesh only (writes runtime/agentmesh.env)
./volcano/scripts/start-agentmesh.sh
./volcano/scripts/stop-agentmesh.sh

# Enqueue + Mesh broadcast
./volcano/scripts/delegate-volcano.sh "Implement feature X" <<'EOF'
…instructions…
EOF

# Manager status ping
./volcano/scripts/mesh-msg.sh manager "Unblocked: ready for review"

# After changing agentmesh/ — tests then git push
./volcano/scripts/push-cursor-dev.sh "feat: describe change"
```

**Prerequisite:** `agentmesh/.venv` with `pip install -r requirements.txt` (once).

**Ports / DB:** `start-agentmesh.sh` uses **`VOLCANO_MESH_PORT`** (default **8766**) and **`VOLCANO_MESH_DB`** (default `volcano/runtime/agentmesh.db`). It does **not** read stray `AGENTMESH_PORT` from your shell, so one-off tests cannot hijack the hub.

## Structured task fields

Optional keys (`acceptance`, `verify_commands`, `paths_allow`, `paths_deny`, `depends_on`, `lane`, …) merge into JSON when **`VOLCANO_EXTRA_JSON`** is set to a JSON object before calling `enqueue-task.sh`. See **`volcano/prompts/task-schema.md`**.

## Flow

1. Manager runs `delegate-volcano.sh` or `enqueue-task.sh` + `mesh-msg.sh`.
2. Workers claim JSON, execute, write `volcano/results/<id>.md`; optionally use Mesh to avoid duplicate work.
3. Manager reads results, replies to user.
4. When AgentMesh code is good, Manager runs `push-cursor-dev.sh` to test and push GitHub `cursor-dev`.

## Safety

- AgentMesh binds **127.0.0.1** only; no auth — dev use.
- `push-cursor-dev.sh` refuses to push if **integration tests** fail.
