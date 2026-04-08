# BUG reports — documentation & naming

Parent repo paths are relative to the autoBottle monorepo root (parent of `volcano/cursor-dev/`).

---

## BUG-01 — Superpowers plans use deprecated router names/paths

**Several planning docs still instruct edits under `executors/llm_router/`, `config/llm_router_*.yaml`, and provider id `executor-router`, while the live stack uses `executors/executor_gateway/` and `executor-gateway`.**  
**Operators following those plans literally will edit wrong paths or expect APIs that do not exist.**

**Primary evidence (examples, not exhaustive):**  
`agent-system/docs/superpowers/plans/2026-04-07-sandbox-model-routing-and-projects.md` — lines **7**, **17**, **32**, **36**, **66**, **76**, **87**, **99**, **127–149**, **196–201** (references to `llm_router`, `executor-router`, `sync_executor_router_provider`).  
`agent-system/docs/superpowers/plans/2026-04-07-openclaw-sandbox-github-claude-codex.md` — lines **19**, **68** (`executor-router` vs `executor-gateway`).  
Canonical live entry (contrast): `agent-system/autobottle` lines **120–161**, **887–888** (`executor_gateway` module and config filenames).

**Severity:** High (documentation leads to wrong operations).

---

## BUG-02 — Consistency audit Tier A vs current `autobottle` script

**The 2026-04-07 consistency audit states Tier A issues A1–A3: `autobottle` still starts `executors.llm_router` and uses `llm_router` pid/log/config paths.**  
**Current `agent-system/autobottle` already uses `executors.executor_gateway.app`, `executor_gateway.pid`, and `executor_gateway_providers.yaml` — so those Tier-A rows are outdated and mislead triage.**

**Locations:**  
`agent-system/docs/superpowers/plans/2026-04-07-codebase-consistency-audit.md` — lines **19–24** (table A1–A3).  
`agent-system/autobottle` — lines **120–161**, **887–888** (actual gateway naming).

**Severity:** Medium (meta-doc false positives waste fix effort).

---

## BUG-09 — Duplicate documentation surfaces

**Superpowers and onboarding content exist in multiple trees (repo root vs `agent-system/`, plus `.claude/worktrees/*`), increasing risk of editing or trusting stale copies.**  
**The 2026-04-07 audit already calls this out; drift continues until a single canonical pointer is enforced.**

**Key references:**  
`agent-system/docs/superpowers/plans/2026-04-07-codebase-consistency-audit.md` — lines **52–60** (Tier D: D1–D4).  
Examples of duplicate CLI copies: `agent-system/autobottle` vs `agent-system/.claude/worktrees/*/autobottle` (same repo; worktree snapshots).

**Severity:** Medium (process / maintainability).

---

## BUG-11 — Product/repo naming inconsistency

**Strings and comments mix `autoBottle`, `autobottle`, `AutoBottle`, and `autoBottle GitHub`, which complicates search, branding, and user-facing messages.**  
**Not a runtime bug, but hurts discoverability and professional polish.**

**Representative locations:**  
`agent-system/autonomous_os/orchestration/os_claude_runner.py` — line **36** (`autoBottle` in system prompt text).  
`agent-system/docker-compose.openclaw.yml` — line **48** (`AutoBottle-Tech`).  
`agent-system/agents/git_agent.py` — lines **5**, **44** (`autoBottle` / repository wording).  
`agent-system/autonomous_os/observability/health.py` — lines **271–272** (hint text `autobottle start`).

**Severity:** Low (consistency / UX copy).
