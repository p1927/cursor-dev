# VOLCANO — Manager + 2× Cursor Agent Workers

**VOLCANO** is a reproducible pattern: one **Manager** (the agent in your main Cursor chat, following the manager prompt) delegates work to **two Worker** processes (headless `agent --print` loops) via a file-based queue.

## Quick start

```bash
# From cursor-dev repository root (parent of `volcano/`, sibling to `agentmesh/`)

# 1) Start both workers (runs until you stop them)
./volcano/scripts/start-all-workers.sh

# 2) Enqueue a task (stdin = full instructions for workers)
./volcano/scripts/enqueue-task.sh "Summarize volcano/README" <<'EOF'
Read volcano/README.md and write a one-paragraph summary into volcano/scratch/summary.txt
EOF

# 3) In Cursor chat: act as Manager (see prompts/manager-system.md or @volcano rule)
#    You create tasks, read volcano/results/, synthesize answers for the user.

# Stop workers
./volcano/scripts/stop-workers.sh
```

## Layout

| Path | Purpose |
|------|---------|
| `prompts/manager-system.md` | How the **Manager** agent should think and delegate |
| `prompts/worker-system.md` | How each **Worker** agent should execute tasks |
| `prompts/protocol.md` | Task JSON schema, claim rules, result format, Mesh prefixes |
| `prompts/task-schema.md` | Copy-paste reference for optional fields + `VOLCANO_EXTRA_JSON` |
| `queue/pending/` | New tasks (`*.json`) |
| `queue/claimed/` | Tasks a worker has taken (do not edit) |
| `archive/done/` | Completed task JSON (audit trail) |
| `results/` | Worker output (`<task_id>.md`) |
| `scratch/` | Optional shared workspace for task artifacts |
| `scripts/` | `start-worker.sh`, `start-all-workers.sh`, `stop-workers.sh`, `enqueue-task.sh` |

## Requirements

- Cursor **Agent CLI** (`agent`) on `PATH`, logged in (`agent login`).
- Workers use: `agent --print --approve-mcps --force --workspace <repo root>` (repo root = parent of `volcano/`).

## Recreating this system elsewhere

1. Copy the entire `volcano/` directory into the target repo root (sibling to `.cursor` if you use rules).
2. Copy `.cursor/rules/volcano.mdc` and `.cursor/skills/volcano/SKILL.md` (or merge their text into your global rules/skills).  
   *In this repo, `.cursor/` may be gitignored — back up those two files if you rely on git alone.*
3. Run `start-all-workers.sh` from the copied `volcano/scripts/` (paths are auto-derived from script location).
4. Tell the chat agent: **“Use VOLCANO”** or attach the manager prompt from `prompts/manager-system.md`.

## Manager copy-paste (optional)

Paste the contents of `prompts/manager-system.md` into a Composer/Cursor system or pinned note when you want the chat agent to stay in Manager character for a long session.

## Name

**VOLCANO** = *vectorized operations, layered agents, coordinated outcomes*. Use this name when referring to this setup so future sessions can grep for it.

## Related: AgentMesh

**AgentMesh** lives in **`agentmesh/`** at the **cursor-dev** repository root (sibling to `volcano/`). It is the small HTTP+SQLite hub for multiple Cursor CLI agents to chat and share tasks. New features or hardening should be filed as **VOLCANO tasks** (enqueue under `volcano/queue/pending/`) unless you are editing it directly in chat.

## Autonomy (Manager + workers + Mesh + push)

See **[AUTONOMY.md](AUTONOMY.md)** for `start-agentmesh.sh`, `delegate-volcano.sh`, `mesh-msg.sh`, and **`push-cursor-dev.sh`** (runs `agentmesh/test_integration.sh` then pushes `cursor-dev`). **`start-all-workers.sh`** now starts AgentMesh before worker loops when possible.
