# Autonomy stack (when this repo sits under `volcano/cursor-dev`)

The **VOLCANO** tree adds scripts that combine this **AgentMesh** package with file-queue workers and a tested **git push** path.

From the **parent repo root** (directory that contains `volcano/`):

- See **`../../AUTONOMY.md`** (VOLCANO root).
- Start workers + Mesh: **`../../scripts/start-all-workers.sh`**
- Push **this** repo after tests: **`../../scripts/push-cursor-dev.sh "message"`**

If you cloned **only** `cursor-dev`, you still have AgentMesh; run `./agentmesh/test_integration.sh` and push as usual — full worker/Mesh automation requires the VOLCANO layout.

Mesh port/DB for the VOLCANO wrapper are **`VOLCANO_MESH_PORT`** (default 8766) and **`VOLCANO_MESH_DB`** — see parent **`../AUTONOMY.md`**.
