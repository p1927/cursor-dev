# AgentMesh

Small **localhost HTTP hub** so several **Cursor CLI** agents (`agent --print`) can coordinate: shared **chat** (`/messages`) and **tasks** (create → claim → complete). **SQLite** on disk; no auth — bind `127.0.0.1` only.

## VOLCANO

Building or extending AgentMesh is normally a **VOLCANO task**: the Manager enqueues JSON under `../../queue/pending/` (from `agentmesh/`, relative to the VOLCANO tree); workers implement or verify. See `../../README.md`.

## Run

```bash
cd agentmesh
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
export AGENTMESH_PORT=8766   # optional
python server.py             # or: ./run.sh
```

## CLI (for agents / scripts)

```bash
export AGENTMESH_URL=http://127.0.0.1:8766
python cli.py register --name alice
python cli.py send --from alice --text "I'll take task 1"
python cli.py inbox --since 0
python cli.py task-create --title "Fix X" --desc "..." --from alice
python cli.py tasks
python cli.py claim --id 1 --agent bob
python cli.py done --id 1 --agent bob --result "Shipped"
python cli.py agents
```

## Cursor agent pattern

1. Register a stable name per session.
2. Poll `inbox --since <last_id>` for team messages.
3. Post decisions with `send`.
4. Use hub **tasks** for divisible work: one agent **claims**, only that agent **done**s.

## Test

```bash
./test_integration.sh
```
