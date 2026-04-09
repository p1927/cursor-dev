# VOLCANO protocol

## Roles

| Role | Who | Responsibility |
|------|-----|----------------|
| **Manager** | Primary Cursor chat agent (you) | Decompose user goals, enqueue tasks, read `results/`, report back |
| **Worker 1** | Headless `agent --print` loop | Claims tasks from `queue/pending/`, executes, writes `results/<id>.md` |
| **Worker 2** | Same as Worker 1 | Same; competes fairly for the next JSON file |

## Task file (JSON) — dropped in `queue/pending/`

Required fields:

- `id` — unique string, e.g. `TASK-20260408-abc123`
- `title` — short human label
- `instructions` — full markdown; what the worker must do
- `created_by` — usually `"manager"`
- `created_at` — ISO-8601 UTC string

Optional:

- `priority` — number (higher first); workers currently process in filename order unless scripts are extended to sort
- `constraints` — array of strings (paths not to touch, safety rules, etc.)
- `acceptance` — array of strings; checklist the worker must address in **Outcome** / **Notes** (tick or explain gaps)
- `verify_commands` — array of shell commands to run from repo root; worker pastes key output in **Commands / tools** or **Notes**
- `paths_allow` — array of path prefixes or globs; worker should stay within them unless instructions override
- `paths_deny` — array; worker must not modify matching paths
- `depends_on` — array of task `id` strings; worker confirms prior `volcano/results/<id>.md` exists (or flags **PARTIAL**)
- `lane` — short string hint (`frontend`, `backend`, `docs`, …) so parallel workers can pick coherent slices

**Enqueue with extras:** set `VOLCANO_EXTRA_JSON` to a JSON object containing only the optional keys above; `enqueue-task.sh` merges them into the task file. See `prompts/task-schema.md`.

### AgentMesh message prefixes (optional coordination)

Keep messages short; the **queue file remains authoritative**.

| Prefix | Example | Meaning |
|--------|---------|---------|
| `MANAGER:` | `MANAGER: enqueued TASK-… — lane backend` | New work or steering |
| `CLAIM:` | `CLAIM: volcano-w1 TASK-…` | Worker took a task |
| `DONE:` | `DONE: volcano-w2 TASK-… SUCCESS` | Task finished |
| `BLOCKED:` | `BLOCKED: volcano-w1 TASK-… need spec for X` | Needs Manager / user |

## Claiming (workers)

1. List `queue/pending/*.json`.
2. For each candidate, attempt **atomic** `mv` to `queue/claimed/w<N>_<basename>`.
3. If `mv` fails, another worker took it — try the next file.
4. Only one worker owns a claimed file at a time.

## Result file — `results/<task_id>.md`

Every worker **must** create this before moving the task to `archive/done/`.

Sections:

```markdown
## Outcome
SUCCESS | PARTIAL | FAILED — one line why

## Artifacts
- paths created/changed

## Commands / tools
- brief list of what was run

## Notes
- blockers, assumptions, follow-ups for Manager
```

## Manager behavior (summary)

- Prefer **2 parallel workers**: split independent work into **two tasks** when possible; use `lane` or distinct `paths_allow` to reduce overlap.
- Do **not** duplicate the same `id` in pending queue.
- After workers finish, read `results/*.md` and answer the user in one coherent voice.
- Prefer **verification**: set `verify_commands` and `acceptance` on non-trivial tasks so results are grounded in commands, not only prose.

## Verification tiers (suggested)

| Tier | When | Typical checks |
|------|------|----------------|
| **A** | Any code change | `node --check`, `bash -n`, linters if configured |
| **B** | `agentmesh/` or hub scripts | `./volcano/scripts/push-cursor-dev.sh` (integration test + push) |
| **C** | UX / games | Manual steps listed in `acceptance` (open URL, click flow) |
