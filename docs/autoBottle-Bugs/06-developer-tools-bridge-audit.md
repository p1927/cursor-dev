# BUG reports — `Developer-Tools/bridge`

Read-only audit of **`Developer-Tools/bridge/src/**/*.py`** (VOLCANO follow-up). Paths relative to autoBottle monorepo root.

---

## BUG-33 — Queue manager shutdown errors swallowed on exit

**`atexit` cleanup calls `_manager.shutdown()` inside `try` / bare `except: pass`.**  
**Shutdown failures (deadlock, broken pipe) leave no trace and may hide resource leaks.**

**Location:** `Developer-Tools/bridge/src/bridge_queue.py` — lines **110–114**.

**Severity:** Low (process exit path; observability).

---

## BUG-34 — `get_pending_count` masks all queue errors as zero

**Bare `except:` returns `0` if `_get_request_queue()` or `qsize()` fails.**  
**Callers see “no backlog” when the shared manager is down or corrupted.**

**Location:** `Developer-Tools/bridge/src/bridge_queue.py` — lines **332–336**.

**Severity:** Medium (misleading metrics / monitoring).

---

## BUG-35 — `get_responses_count` masks all errors as zero

**Same pattern as **BUG-34** for the response dict length.**  
**Stats APIs under-report pending work on any exception.**

**Location:** `Developer-Tools/bridge/src/bridge_queue.py` — lines **341–345**.

**Severity:** Medium (misleading metrics).

---

**Scan notes:** No `shell=True` or `TODO`/`FIXME` hits in `Developer-Tools/bridge/src/*.py` beyond the bare-except sites above. **Manager note:** Worker completed task **TASK-20260408-195846-58923a** without writing `volcano/results/<id>.md`; this file and index update complete the deliverable.
