# VOLCANO task JSON — quick reference

Tasks are files under `volcano/queue/pending/*.json`. Create them with `enqueue-task.sh` or by hand.

## Required fields

| Field | Type | Meaning |
|-------|------|---------|
| `id` | string | Unique id, e.g. `TASK-20260408-a1b2c3` |
| `title` | string | Short label |
| `instructions` | string | Markdown: what to do, context, Definition of Done |
| `created_by` | string | Usually `"manager"` |
| `created_at` | string | ISO-8601 UTC |

## Optional fields (structured delegation)

Set via environment when using `enqueue-task.sh`:

```bash
export VOLCANO_EXTRA_JSON='{
  "acceptance": ["Tests pass", "README updated"],
  "verify_commands": ["node --check pvz-garden/js/main.js"],
  "paths_allow": ["volcano/", "pvz-garden/"],
  "paths_deny": ["*.pem", ".env"],
  "depends_on": ["TASK-20260408-earlier"],
  "lane": "frontend",
  "priority": 10,
  "constraints": ["Do not commit secrets"]
}'
./volcano/scripts/enqueue-task.sh "Title" <<'EOF'
…instructions…
EOF
unset VOLCANO_EXTRA_JSON
```

| Field | Type | Meaning |
|-------|------|---------|
| `acceptance` | string[] | Checklist; worker echoes status in **Outcome** / **Notes** |
| `verify_commands` | string[] | Shell commands worker should run and quote output |
| `paths_allow` | string[] | Prefer edits only under these prefixes/globs (advisory) |
| `paths_deny` | string[] | Must not modify matching paths |
| `depends_on` | string[] | Prior task ids; worker should confirm prior `results/*.md` exists or note risk |
| `lane` | string | Hint: `frontend`, `backend`, `docs`, `infra`, … for self-routing |
| `priority` | number | Higher = more urgent (future: sort pending by this) |
| `constraints` | string[] | Same as before; rules and “do not” lines |

See **`protocol.md`** for claiming, results format, and Mesh prefixes.
