# cursor-dev

Cursor-oriented utilities. This git repository is nested under the **VOLCANO** orchestration tree:

```
volcano/
  cursor-dev/          ← this repo (you are here)
    agentmesh/         ← HTTP + SQLite hub for multiple Cursor CLI agents
  queue/
  prompts/
  ...
```

## AgentMesh

Multi-agent coordination (messages + claim/done tasks). See [`agentmesh/README.md`](agentmesh/README.md).

```bash
cd agentmesh
python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
./test_integration.sh
./run.sh   # hub on port 8766 (localhost)
```

## Clone (standalone)

If you clone **only** this repo, you get `agentmesh/` at the repo root (paths in `agentmesh/README.md` stay valid).

## VOLCANO

Upstream docs for the manager/worker queue: parent directory [`../README.md`](../README.md).
