#!/usr/bin/env python3
"""Thin HTTP client for AgentMesh — use from shell scripts or Cursor CLI agents."""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

def _base() -> str:
    return os.environ.get("AGENTMESH_URL", "http://127.0.0.1:8766").rstrip("/")


def req(method: str, path: str, data: dict | None = None) -> dict:
    url = f"{_base()}{path}"
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(url, data=body, method=method)
    if body is not None:
        r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode() or str(e)
        print(f"HTTP {e.code}: {err}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Connection failed: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    p = argparse.ArgumentParser(description="AgentMesh CLI")
    p.add_argument(
        "--url",
        default=os.environ.get("AGENTMESH_URL", "http://127.0.0.1:8766"),
        help="AgentMesh base URL",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("register", help="Register agent name")
    s.add_argument("--name", required=True)

    s = sub.add_parser("heartbeat", help="Update last_seen")
    s.add_argument("--name", required=True)

    s = sub.add_parser("agents", help="List agents")

    s = sub.add_parser("send", help="Post a message")
    s.add_argument("--from", dest="from_agent", required=True)
    s.add_argument("--text", required=True)
    s.add_argument("--channel", default="general")

    s = sub.add_parser("inbox", help="Messages after id")
    s.add_argument("--since", type=int, default=0)

    s = sub.add_parser("task-create", help="Create task")
    s.add_argument("--title", required=True)
    s.add_argument("--desc", default="")
    s.add_argument("--from", dest="from_agent", default="anonymous")

    s = sub.add_parser("tasks", help="List tasks")

    s = sub.add_parser("claim", help="Claim open task")
    s.add_argument("--id", type=int, required=True)
    s.add_argument("--agent", required=True)

    s = sub.add_parser("done", help="Complete claimed task")
    s.add_argument("--id", type=int, required=True)
    s.add_argument("--agent", required=True)
    s.add_argument("--result", required=True)

    args = p.parse_args()
    os.environ["AGENTMESH_URL"] = args.url.rstrip("/")

    if args.cmd == "register":
        out = req("POST", "/agents/register", {"name": args.name})
    elif args.cmd == "heartbeat":
        out = req("POST", "/agents/heartbeat", {"name": args.name})
    elif args.cmd == "agents":
        out = _get("/agents")
    elif args.cmd == "send":
        out = req(
            "POST",
            "/messages",
            {
                "from": args.from_agent,
                "channel": args.channel,
                "body": args.text,
            },
        )
    elif args.cmd == "inbox":
        out = _get(f"/messages?since_id={args.since}")
    elif args.cmd == "task-create":
        out = req(
            "POST",
            "/tasks",
            {
                "title": args.title,
                "description": args.desc,
                "from": args.from_agent,
            },
        )
    elif args.cmd == "tasks":
        out = _get("/tasks")
    elif args.cmd == "claim":
        out = req("POST", f"/tasks/{args.id}/claim", {"agent": args.agent})
    elif args.cmd == "done":
        out = req(
            "POST",
            f"/tasks/{args.id}/complete",
            {"agent": args.agent, "result": args.result},
        )
    else:
        p.error("unknown command")

    print(json.dumps(out, indent=2))


def _get(path: str) -> dict:
    url = f"{_base()}{path}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Connection failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
