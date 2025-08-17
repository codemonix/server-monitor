# Server Monitor Agent

A tiny agent that runs on each server and pushes metrics to your backend.

## Configure

1. Copy `.env.example` to `.env` and set:
   - `BACKEND_BASE_URL`
   - `AGENT_ENROLLMENT_KEY` (must match backend)
   - Optional: `AGENT_NAME`, `TAGS`, polling/batch settings

## Run (bare metal)

```bash
npm install
npm run start
```

## Run as systemd service

- Copy repo to `/opt/server-monitor-agent`
- Copy `systemd/server-monitor-agent.service` to `/etc/systemd/system/`
- `sudo systemctl daemon-reload && sudo systemctl enable --now server-monitor-agent`

## Run in Docker

```bash
docker build -t sm-agent .
docker run --env-file .env --name sm-agent --restart unless-stopped sm-agent
```