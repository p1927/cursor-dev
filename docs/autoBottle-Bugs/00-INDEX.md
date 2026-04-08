# autoBottle bug reports — index

Read-only audit of the **autoBottle** workspace (parent monorepo containing `agent-system/`, `volcano/`, `Developer-Tools/`, etc.). **No application code was modified** to produce these reports; findings come from static review and cross-references.

**Convention (each bug):** two-line summary, primary location(s) with line numbers, severity hint.

**Rules:** One row per **BUG-xx** here (no duplicate IDs). Detail lives in the themed files below.

| ID | Theme file | Title (short) |
|----|------------|----------------|
| BUG-01 | [01-documentation-and-naming.md](./01-documentation-and-naming.md) | Superpowers plans still describe `llm_router` / `executor-router` |
| BUG-02 | [01-documentation-and-naming.md](./01-documentation-and-naming.md) | Tier-A audit claims vs current `autobottle` (executor_gateway) disagree |
| BUG-03 | [02-agent-system-code.md](./02-agent-system-code.md) | Update layer `requires_restart` not wired after apply |
| BUG-04 | [02-agent-system-code.md](./02-agent-system-code.md) | Proactive scanner docstring path + TODO list vs `WARN` regex mismatch |
| BUG-05 | [03-tooling-volcano-cursor-dev.md](./03-tooling-volcano-cursor-dev.md) | `push-cursor-dev.sh` stages entire nested repo with `git add -A` |
| BUG-06 | [03-tooling-volcano-cursor-dev.md](./03-tooling-volcano-cursor-dev.md) | AgentMesh CLI default URL duplicated (`_base` vs argparse) |
| BUG-07 | [02-agent-system-code.md](./02-agent-system-code.md) | Health checks swallow subsystem errors with bare `except` + `pass` |
| BUG-08 | [03-tooling-volcano-cursor-dev.md](./03-tooling-volcano-cursor-dev.md) | VOLCANO workers use monorepo root while policy targets `cursor-dev/` only |
| BUG-09 | [01-documentation-and-naming.md](./01-documentation-and-naming.md) | Duplicate superpowers / worktree doc surfaces |
| BUG-10 | [02-agent-system-code.md](./02-agent-system-code.md) | `config_loader` skips all `.env` load if `python-dotenv` missing |
| BUG-11 | [01-documentation-and-naming.md](./01-documentation-and-naming.md) | Product naming drift: `autoBottle` / `autobottle` / `AutoBottle` |
| BUG-12 | [02-agent-system-code.md](./02-agent-system-code.md) | `openclaw-entrypoint.sh` relies on `/proc/net/route` (Linux-specific) |
| BUG-13 | [03-tooling-volcano-cursor-dev.md](./03-tooling-volcano-cursor-dev.md) | Nested `cursor-dev` repo ignored by parent `volcano/.gitignore` |

**Source tree roots referenced:** `agent-system/`, `volcano/` (relative to autoBottle monorepo root).

**Related existing audit (not re-listed as separate bugs):** `agent-system/docs/superpowers/plans/2026-04-07-codebase-consistency-audit.md` — many items overlap BUG-01/BUG-02/BUG-09; this folder tracks **actionable bug IDs** without duplicating that document’s tables line-for-line.
