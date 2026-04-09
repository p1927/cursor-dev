# cursor-dev

**Remote:** https://github.com/p1927/cursor-dev  

Cursor-oriented utilities. This repository root holds **VOLCANO** orchestration and product trees side by side:

```
./
  volcano/           ← file queue, prompts, worker scripts
  agentmesh/         ← HTTP + SQLite hub for multiple Cursor CLI agents
  docs/
  pvz-garden/
  Developer-Tools/   ← nested clone (gitignored here; own remote)
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

Orchestration docs: [`volcano/README.md`](volcano/README.md).

**Autonomy stack** (Mesh + delegate + push): [`docs/AUTONOMY.md`](docs/AUTONOMY.md) and [`volcano/AUTONOMY.md`](volcano/AUTONOMY.md).
