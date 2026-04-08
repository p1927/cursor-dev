# cursor-dev

**Remote:** https://github.com/p1927/cursor-dev  

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

```bash
git clone https://github.com/p1927/cursor-dev.git
cd cursor-dev/agentmesh
```

Paths in `agentmesh/README.md` assume your cwd is `agentmesh/` inside this repo.

## VOLCANO

Upstream docs for the manager/worker queue: parent directory [`../README.md`](../README.md).
