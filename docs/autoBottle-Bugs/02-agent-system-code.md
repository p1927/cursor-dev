# BUG reports — agent-system code

Paths relative to autoBottle monorepo root.

---

## BUG-03 — `requires_restart` not applied after successful update layer

**After a successful layer apply, code records state but does not invoke `SystemController.restart()` when `layer.requires_restart` is true — restarts are left unimplemented.**  
**Hosts may run with stale services until an operator restarts manually, contradicting the layer contract.**

**Location:** `agent-system/autonomous_os/updates/coordinator.py` — lines **117–118** (comment `TODO`).

**Severity:** Medium (operational correctness).

---

## BUG-04 — Proactive scanner docs vs implementation

**The module docstring claims path `agents/proactive_scanner.py`, but the file lives under `autonomous_os/observability/`.**  
**The header lists scanned markers as TODO/FIXME/HACK/XXX, but the regex also matches `WARN`, which is undocumented.**

**Location:** `agent-system/autonomous_os/observability/proactive_scanner.py` — lines **2**, **5–6**, **33–34**.

**Severity:** Low (maintainer confusion; scanner behavior may be intended).

---

## BUG-07 — Health aggregation swallows errors

**`check_llm_sidecars` (or related aggregation) uses bare `except Exception: pass` for governor and provider-registry probes, so a broken subsystem can disappear from health output.**  
**Operators see “green” absence of warnings instead of an explicit failure signal.**

**Location:** `agent-system/autonomous_os/observability/health.py` — lines **230–231**, **255–256** (`# noscan` suppressed exceptions).

**Severity:** Medium (observability blind spot).

---

## BUG-10 — Missing `python-dotenv` disables all `.env` loading

**If `dotenv` import fails, `ensure_loaded()` returns early after stripping Anthropic vars, without loading `config/.env` or `~/.env`.**  
**Deployments that forget to install `python-dotenv` silently run on empty env.**

**Location:** `agent-system/config_loader.py` — lines **54–59**.

**Severity:** Medium (config foot-gun).

---

## BUG-12 — OpenClaw entrypoint assumes Linux route table layout

**Gateway host detection reads `/proc/net/route`; if missing, it falls back to `host.docker.internal`, which is known to be wrong on some Linux bridge setups (compose comments acknowledge this).**  
**Non-Linux or restricted `/proc` environments get weaker or incorrect gateway selection.**

**Location:** `agent-system/openclaw-entrypoint.sh` — lines **29–45** (Python one-liner reading `/proc/net/route`).

**Severity:** Medium (environment portability; mitigated by `EXECUTOR_GATEWAY_DOCKER_HOST` override documented in compose).
