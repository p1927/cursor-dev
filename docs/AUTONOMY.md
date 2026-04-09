# Autonomy stack (cursor-dev repository)

The **VOLCANO** subdirectory combines **AgentMesh** (`agentmesh/` at this repo root) with file-queue workers and a tested **git push** path.

From **this repository root** (directory that contains `volcano/` and `agentmesh/`):

- VOLCANO details: **`volcano/AUTONOMY.md`**
- Start workers + Mesh: **`./volcano/scripts/start-all-workers.sh`**
- Push **this** repo after tests: **`./volcano/scripts/push-cursor-dev.sh "message"`**

If you cloned **only** pieces of this repo, you still have AgentMesh under `agentmesh/`; run `./agentmesh/test_integration.sh` and push as usual — full worker/Mesh automation uses the `volcano/scripts/` wrappers.

Mesh port/DB for the VOLCANO wrapper are **`VOLCANO_MESH_PORT`** (default 8766) and **`VOLCANO_MESH_DB`** — see **`volcano/AUTONOMY.md`**.
