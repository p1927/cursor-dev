#!/usr/bin/env python3
"""
AgentMesh — tiny coordination hub for multiple Cursor CLI agents.
SQLite + FastAPI: messages (chat) + tasks (claim/complete). No auth; bind localhost only.
"""
from __future__ import annotations

import os
import sqlite3
import time
from contextlib import asynccontextmanager, contextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

DB_PATH = Path(os.environ.get("AGENTMESH_DB", Path(__file__).resolve().parent / "data" / "agentmesh.db"))
PORT = int(os.environ.get("AGENTMESH_PORT", "8766"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="AgentMesh", version="1.0.0", lifespan=lifespan)


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS agents (
                name TEXT PRIMARY KEY,
                last_seen REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel TEXT NOT NULL DEFAULT 'general',
                from_agent TEXT NOT NULL,
                body TEXT NOT NULL,
                created REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'open',
                claimed_by TEXT,
                result TEXT,
                created_by TEXT,
                created REAL NOT NULL,
                updated REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created);
            CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
            """
        )


# --- Models ---


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=64)


class HeartbeatIn(BaseModel):
    name: str


class MessageIn(BaseModel):
    from_agent: str = Field(alias="from")
    channel: str = "general"
    body: str = Field(min_length=1, max_length=16000)

    model_config = {"populate_by_name": True}


class TaskCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    from_agent: str = Field(alias="from", default="anonymous")

    model_config = {"populate_by_name": True}


class TaskClaimIn(BaseModel):
    agent: str


class TaskCompleteIn(BaseModel):
    agent: str
    result: str = Field(min_length=1, max_length=64000)


# --- Routes ---


@app.get("/health")
def health():
    return {"ok": True, "service": "agentmesh"}


@app.post("/agents/register")
def agents_register(body: RegisterIn):
    now = time.time()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO agents(name, last_seen) VALUES(?, ?) ON CONFLICT(name) DO UPDATE SET last_seen=excluded.last_seen",
            (body.name, now),
        )
    return {"name": body.name, "registered": True}


@app.post("/agents/heartbeat")
def agents_heartbeat(body: HeartbeatIn):
    now = time.time()
    with get_db() as conn:
        cur = conn.execute(
            "UPDATE agents SET last_seen=? WHERE name=?", (now, body.name)
        )
        if cur.rowcount == 0:
            conn.execute("INSERT INTO agents(name, last_seen) VALUES(?, ?)", (body.name, now))
    return {"name": body.name, "last_seen": now}


@app.get("/agents")
def agents_list():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT name, last_seen FROM agents ORDER BY last_seen DESC"
        ).fetchall()
    return {"agents": [dict(r) for r in rows]}


@app.post("/messages")
def messages_post(body: MessageIn):
    now = time.time()
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO messages(channel, from_agent, body, created) VALUES(?,?,?,?)",
            (body.channel, body.from_agent, body.body, now),
        )
        mid = cur.lastrowid
    return {"id": mid, "created": now}


@app.get("/messages")
def messages_list(since_id: int = 0, limit: int = 100):
    limit = min(max(limit, 1), 500)
    with get_db() as conn:
        rows = conn.execute(
            """SELECT id, channel, from_agent, body, created FROM messages
               WHERE id > ? ORDER BY id ASC LIMIT ?""",
            (since_id, limit),
        ).fetchall()
    return {"messages": [dict(r) for r in rows]}


@app.post("/tasks")
def tasks_create(body: TaskCreateIn):
    now = time.time()
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO tasks(title, description, status, created_by, created, updated)
               VALUES(?,?,?,?,?,?)""",
            (body.title, body.description, "open", body.from_agent, now, now),
        )
        tid = cur.lastrowid
    return {"id": tid, "status": "open"}


@app.get("/tasks")
def tasks_list(status: str | None = None):
    with get_db() as conn:
        if status:
            rows = conn.execute(
                "SELECT * FROM tasks WHERE status=? ORDER BY id ASC", (status,)
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM tasks ORDER BY id ASC").fetchall()
    return {"tasks": [dict(r) for r in rows]}


@app.post("/tasks/{task_id}/claim")
def tasks_claim(task_id: int, body: TaskClaimIn):
    now = time.time()
    with get_db() as conn:
        row = conn.execute("SELECT status FROM tasks WHERE id=?", (task_id,)).fetchone()
        if not row:
            raise HTTPException(404, "task not found")
        if row["status"] != "open":
            raise HTTPException(409, f"task not open (status={row['status']})")
        cur = conn.execute(
            """UPDATE tasks SET status='claimed', claimed_by=?, updated=? WHERE id=? AND status='open'""",
            (body.agent, now, task_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(409, "claim failed (race)")
    return {"id": task_id, "status": "claimed", "claimed_by": body.agent}


@app.post("/tasks/{task_id}/complete")
def tasks_complete(task_id: int, body: TaskCompleteIn):
    now = time.time()
    with get_db() as conn:
        row = conn.execute(
            "SELECT status, claimed_by FROM tasks WHERE id=?", (task_id,)
        ).fetchone()
        if not row:
            raise HTTPException(404, "task not found")
        if row["status"] != "claimed":
            raise HTTPException(409, "task must be claimed first")
        if row["claimed_by"] != body.agent:
            raise HTTPException(403, "only claiming agent can complete")
        conn.execute(
            """UPDATE tasks SET status='done', result=?, updated=? WHERE id=?""",
            (body.result, now, task_id),
        )
    return {"id": task_id, "status": "done"}


def main():
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="info")


if __name__ == "__main__":
    main()
