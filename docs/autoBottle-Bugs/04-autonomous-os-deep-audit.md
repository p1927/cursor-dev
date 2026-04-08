# autonomous_os deep audit (BUG-20+)

Read-only static review of `agent-system/autonomous_os/**/*.py` (no `.sh` files in this tree). Paths are relative to the autoBottle monorepo root. Issues **BUG-01–BUG-19** are indexed in [00-INDEX.md](./00-INDEX.md); this file adds **BUG-20** upward only.

---

## BUG-20 — Auto-fixer restart fallback uses overly broad `pkill`

**If `SystemController.restart()` fails, the code falls back to `pkill -f "python3 main.py"`, which matches any process whose command line contains that substring, not only this deployment’s `main.py`.**  
**Risk of killing unrelated Python workloads on the same host.**

**Location:** `agent-system/autonomous_os/healing/auto_fixer.py` — lines **244–245**.

**Severity:** High (availability / collateral damage on shared hosts).

---

## BUG-21 — Doctor update rollback executes persisted `rollback_cmd` via `shell=True`

**`_heal_updates` reads `rollback_cmd` from recent layer state and runs it with `subprocess.run(..., shell=True)`.**  
**A tampered or malformed persisted command string is executed by a shell — classic injection if the state store is writable or compromised.**

**Location:** `agent-system/autonomous_os/healing/doctor.py` — lines **418–424**.

**Severity:** High (defense-in-depth; trust boundary is the layer state file + registry).

---

## BUG-22 — Update applier runs all layer commands through `shell=True`

**`apply_layer`, `verify_layer`, `rollback_layer`, and snapshot `check_cmd` all use `subprocess.run(..., shell=True)` on strings from `UpdateLayer` / templates.**  
**Any metacharacters or substitutions in `snapshot` or layer definitions expand in a shell; harder to audit than argv-only execution.**

**Location:** `agent-system/autonomous_os/updates/applier.py` — lines **51–52**, **66–67**, **85–86**, **104–105**.

**Severity:** Medium (expected for some ops scripts, but broad shell surface).

---

## BUG-23 — Fix feedback loop marks success when pattern row is missing

**`close_loop` treats “no `patterns` row or `last_seen` not after fix time” as success (`else` branch).**  
**If the pattern was never recorded or was deleted, pending fix attempts are closed as successes, skewing effectiveness metrics.**

**Location:** `agent-system/autonomous_os/learning/feedback_loop.py` — lines **92–105**.

**Severity:** Medium (wrong analytics; hides broken tracking).

---

## BUG-24 — OpenRouter blocked-prefix “normalization” is a no-op

**Line `n = p if p.endswith("/") or "/" not in p else p` sets `n` to `p` in both branches; prefixes are never coerced to the documented trailing-slash form.**  
**Maintainers may believe ambiguous prefixes are normalized when they are stored verbatim.**

**Location:** `agent-system/autonomous_os/governance/openrouter_policy.py` — lines **27–31**.

**Severity:** Low (documentation / intent mismatch; blocking behavior may still be acceptable for common inputs).

---

## BUG-25 — Guarded HTTP client skips outbound secret scan for non-dict bodies

**`GuardedHTTPClient.post` sets `body = kwargs.get("json") or kwargs.get("data") or {}` and only runs API-key regexes when `isinstance(body, dict)`.**  
**Callers passing a raw string or bytes via `data=` bypass the outbound leak check.**

**Location:** `agent-system/autonomous_os/security/guard.py` — lines **532–541**.

**Severity:** Medium (security control gap for non-JSON posts).

---

## BUG-26 — `SystemController.start()` leaves the log file handle open after `Popen`

**The fallback path opens `logs/agent-system.log` for append and passes it to `subprocess.Popen` without `close_fds` handling or detaching the handle from the parent’s lifecycle beyond the child.**  
**The parent keeps an open writable FD to the log (resource leak / odd locking behavior on long-lived parents).**

**Location:** `agent-system/autonomous_os/boot/system_controller.py` — lines **143–150**.

**Severity:** Low (operational hygiene; may be acceptable in practice).

---

## BUG-27 — Two parallel “memory cleaner” implementations

**The tree contains both `memory/cleaner.py` (scheduler-oriented cleanup helpers) and `memory/memory_cleaner.py` (large board/healing-oriented cleaner).**  
**Overlapping names and responsibilities make it easy to patch or operate the wrong module when tuning retention or safety.**

**Location:** `agent-system/autonomous_os/memory/cleaner.py` (entire module) vs `agent-system/autonomous_os/memory/memory_cleaner.py` (entire module).

**Severity:** Low (maintainability / operational confusion).

---

## Coverage note

All **64** `*.py` files under `agent-system/autonomous_os/` were included in this pass (listing + targeted reads and `rg` for subprocess/shell/TODO/exception patterns). Findings above are **additional** to BUG-03, BUG-04, and BUG-07, which already reference `autonomous_os` paths in [02-agent-system-code.md](./02-agent-system-code.md).
