# BUG reports — VOLCANO, cursor-dev, AgentMesh tooling

Paths relative to autoBottle monorepo root unless noted as inside the **cursor-dev** nested repository.

---

## BUG-05 — `push-cursor-dev.sh` may commit unintended files

**The script runs `git add -A` inside `volcano/cursor-dev/` before commit, staging every change in that nested repo — including scratch, local experiments, or secrets if present.**  
**There is no path allowlist; a rushed push can publish unrelated artifacts.**

**Location (nested repo):** `volcano/cursor-dev` — script at `../scripts/push-cursor-dev.sh` from monorepo: `volcano/scripts/push-cursor-dev.sh` — lines **17–22**.

**Severity:** Medium (release hygiene).

---

## BUG-06 — AgentMesh CLI duplicates default base URL

**Default URL appears both in `_base()` and in argparse `--url` default; future edits can diverge.**  
**Minor maintainability issue; behavior is consistent today if both literals stay equal.**

**Location (nested repo):** `volcano/cursor-dev/agentmesh/cli.py` — lines **12–14** (`_base`) and **36–38** (`--url` default).

**Severity:** Low (DRY / drift risk).

---

## BUG-08 — VOLCANO worker workspace vs cursor-dev-only policy

**Headless workers use `--workspace` = monorepo root (parent of `volcano/`), while Manager guidance may scope implementation to `volcano/cursor-dev/` only.**  
**Without strict `paths_allow` in task JSON, workers can still modify `agent-system/` or other trees — policy is not enforced by the worker launcher.**

**Locations:** `volcano/scripts/start-worker.sh` — lines **9** (`REPO_ROOT` = monorepo root) and **74** (`agent --workspace "$REPO_ROOT"`); `volcano/prompts/manager-system.md` — section **“Codebase scope (default)”** (cursor-dev-only expectation for implementation).

**Severity:** Medium (governance gap between policy and tooling).

---

## BUG-13 — Parent gitignore hides nested `cursor-dev`

**`volcano/.gitignore` lists `cursor-dev/`, so the parent monorepo does not track the nested product repo; all version control for that subtree is in the nested git remote only.**  
**Contributors using only the parent repo may miss that `cursor-dev` is a separate git project.**

**Location:** `volcano/.gitignore` — line **2** (`cursor-dev/`).

**Severity:** Low (repo layout / onboarding clarity).
