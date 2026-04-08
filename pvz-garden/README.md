# PVZ Garden (frontend-only)

Plants vs. Zombies–style lane defense: **5 rows**, **9 columns**, **sun economy**, **Sunflower / Peashooter / Wall-nut**, **zombies**, **peas**, **lawn mowers**, **waves**.

## Run

Open `index.html` in a modern browser (double-click or static server):

```bash
cd pvz-garden
python3 -m http.server 8080
# visit http://127.0.0.1:8080/
```

`file://` also works for this project (no ES modules).

### Public URL (Cloudflare quick tunnel)

Requires [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) on your PATH:

```bash
chmod +x run-with-cloudflare-tunnel.sh
./run-with-cloudflare-tunnel.sh
```

A **`*.trycloudflare.com`** URL is printed in the terminal. Open it in your browser to test from anywhere. **Ctrl+C** stops the tunnel and local server.

**Note:** Quick tunnels are ephemeral and not for production. For a stable hostname, configure a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) in the Cloudflare dashboard.

## Controls

1. Click a **seed packet** (top bar) if you have enough sun.
2. Click a **grass cell** to plant.
3. Click **falling / sunflower suns** to collect (+25).

## VOLCANO

Built under the VOLCANO tree; Manager should **delegate** follow-up work via `volcano/scripts/delegate-volcano.sh` and use **AgentMesh** for worker coordination — see `../../MANAGER-MEMORY.md`.

## Stack

Vanilla **Canvas** + DOM HUD. No build step.
