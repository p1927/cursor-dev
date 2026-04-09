# Manager memory (VOLCANO + AgentMesh)

Persistent note for any agent acting as **VOLCANO Manager**:

1. **You are an organizer**, not the whole engineering team. **Workers** (`start-worker.sh` ×2) execute queued JSON tasks. For **large read-only audits** (e.g. scanning all of `agent-system/autonomous_os/`), **do not** solo-scan the whole tree in chat — **split into parallel tasks**, enqueue with clear scope and file outputs, then **merge** worker `results/*.md` and doc commits.
2. **AgentMesh** is part of the stack: start with `start-agentmesh.sh` or `start-all-workers.sh`; use **`mesh-msg.sh`** to broadcast; workers can **`source runtime/agentmesh.env`** and use **`VOLCANO_AGENTMESH_CLI`** (`cli.py`) for peer coordination.
3. On **VOLCANO**-labeled work, **do not** single-handedly build large apps/features in chat. Use **`delegate-volcano.sh`** / **`enqueue-task.sh`**, then read **`volcano/results/<task_id>.md`**, then summarize for the user. For substantive tasks, set **`VOLCANO_EXTRA_JSON`** (`acceptance`, `verify_commands`, …) per **`prompts/task-schema.md`**.
4. After verified changes in this **cursor-dev** repo, **`push-cursor-dev.sh`** runs tests and pushes git.
5. **Quality bar:** Ship **working software** that delivers **business value**, with **strong UX** for the **customer (the user)**. **Verify by exercising real scenarios** end-to-end (flows, edge cases, “does it actually work?”). Unit tests are optional; **thorough scenario testing is not** — you still own proving it works before calling something done.
6. **Scope — cursor-dev only:** Product work stays in **`agentmesh/`**, **`docs/`**, **`pvz-garden/`**, repo **`README.md`**, and VOLCANO meta under **`volcano/`**. **`Developer-Tools/`** is a nested clone (gitignored here). **Do not** change other host trees (e.g. **`agent-system/`**) unless the user **explicitly** expands scope. Use **`paths_allow`: `["volcano/", "agentmesh/", "docs/", "pvz-garden/", "README.md"]`** when enqueuing implementation tasks. **Ship** with **`push-cursor-dev.sh`**.

See **`prompts/manager-system.md`** for the full contract.
