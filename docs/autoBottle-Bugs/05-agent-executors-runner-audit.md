# BUG reports — agents, executors, runner, orchestrator

Read-only audit of **`agent-system/agents/`**, **`agent-system/executors/`**, **`agent-system/runner/`**, **`agent-system/orchestrator/`** (excludes `autonomous_os/`, covered elsewhere). Paths relative to autoBottle monorepo root.

---

## BUG-14 — Executor-gateway startup swallows vault failures

**`Vault.load()` is wrapped in a broad `except Exception` that only logs a warning; the FastAPI app continues to bind and serve.**  
**Misconfigured vault or decrypt errors can leave the process “healthy” while upstream calls fail with 503 or confusing auth errors, masking the root cause.**

**Location:** `agent-system/executors/executor_gateway/app.py` — lines **26–31**.

**Severity:** Medium (operability / security posture clarity).

---

## BUG-15 — OpenClaw session lock cleanup deletes files on any exception

**`_cleanup_stale_session_locks` treats any `Exception` (not only JSON errors) as “corrupt” and unlinks the lock file.**  
**Permission errors, transient read failures, or schema drift could remove a lock for a live session and allow concurrent OpenClaw use.**

**Location:** `agent-system/agents/openclaw_bridge.py` — lines **811–813**.

**Severity:** Medium (concurrency / data loss of lock semantics).

---

## BUG-16 — Supervisor JSON extraction uses greedy `.\*` brace match

**Multiple code paths use `re.search(r'\{.*\}', text, re.DOTALL)` to recover JSON from LLM prose; the match is greedy across the whole response.**  
**It can capture the wrong `{}` span (multiple objects, code fences, or huge blobs), causing misleading parse fallbacks or unnecessary work on pathological output.**

**Location:** `agent-system/agents/supervisor.py` — e.g. lines **466**, **537**, **566**, **603** (same pattern repeated in `decompose_task` / routing helpers).

**Severity:** Medium (correctness of supervisor plans; potential performance on huge strings).

---

## BUG-17 — Corrupt `step_states` JSON resets entire step map silently

**`update_step_state` loads `step_states` with `json.loads`; on any exception it sets `states = {}` and then writes the new single step, wiping prior step keys.**  
**A partial DB corruption or invalid JSON loses all resumability metadata for that queue row without an explicit error to the caller.**

**Location:** `agent-system/orchestrator/task_queue.py` — lines **156–164**.

**Severity:** Medium (durable queue / resume reliability).

---

## BUG-18 — Executor-gateway child process is never reaped by the spawner

**`executor_gateway_service.start_if_needed` uses `subprocess.Popen` with `start_new_session=True` and records the PID, but the parent never `wait()`s on that handle.**  
**If the parent Python process exits abruptly, zombie/reaping behavior depends on init; the pattern is easy to misread as “fully detached” without documenting PID 1 reaping expectations.**

**Location:** `agent-system/agents/executor_gateway_service.py` — lines **74–84**.

**Severity:** Low (operational / process hygiene; long-running `main.py` mitigates in the common case).

---

## BUG-19 — Service launcher doc promises “shell command” but does not invoke a shell

**The launcher docstring describes `command` as a “shell command”, but `_subprocess_start` uses `shlex.split(command)` and `asyncio.create_subprocess_exec(*args, ...)`.**  
**Shell operators (`|`, `&&`, redirects) in `runner/config.yaml` will not work as operators might expect, causing silent misconfiguration.**

**Location:** `agent-system/runner/launchers/service_launcher.py` — lines **17–18**, **36–45**.

**Severity:** Low (documentation / operator confusion).

---

**Scan notes (no separate BUG id):** No `shell=True` usages found under the four roots; `subprocess` call sites reviewed favor `run`/`Popen` with argv lists or `create_subprocess_exec`. No literal hardcoded API keys/passwords matched by simple assignment patterns. `04-autonomous-os-deep-audit.md` was not present in this workspace snapshot; numbering starts at **BUG-14** after index **BUG-13**.
