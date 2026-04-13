# Bucket List — Agent Instructions

## What this is

A shared bucket list web app for couples ("The book of us"). Next.js 16 with SQLite via better-sqlite3. No external database, no accounts — household-based sessions with invite codes.

## Hosting

- **Live at:** https://bucketlist.dev-simon.com
- **Runs on:** Simon's homelab server (dom, ThinkCentre M710q at 192.168.1.99)
- **Container:** `bucket-list` on port 3100, proxied through Cloudflare Tunnel
- **Docker Compose:** lives in the homelab-infra repo at `hosts/dom/services/bucket-list/docker-compose.yml`
- **Image:** built from this repo's Dockerfile (multi-stage, standalone Next.js output)
- **Data:** SQLite DB in a Docker named volume `bucket-list-data` mounted at `/app/data`
- **DNS:** CNAME `bucketlist.dev-simon.com` → Cloudflare Tunnel (`cefbaa9f-...cfargotunnel.com`)

## Repo

- **GitHub:** https://github.com/Oldault/bucket-list (public)
- **Homelab infra:** https://github.com/Oldault/homelab-infra (private) — contains the compose file and tunnel config

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm seed       # populate demo data
```

The database is auto-created on first request. Path is controlled by `DB_PATH` env var (defaults to `./data/bucket-list.db`).

## Deploying changes

After pushing to GitHub:

```bash
ssh homelab-local "cd ~/homelab-infra/hosts/dom/services/bucket-list && docker compose up -d --build"
```

The compose file uses `build: https://github.com/Oldault/bucket-list.git#master` so it pulls and builds from the repo directly on the server.

## Stack

- Next.js 16 (App Router, server actions, standalone output)
- SQLite via better-sqlite3 (WAL mode)
- Leaflet + React Leaflet for maps
- Tailwind CSS v4
- No ORM, no external services, no API keys needed
