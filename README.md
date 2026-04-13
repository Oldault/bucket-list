# The Book of Us

A shared bucket list for couples — pinned to a map, sorted by season, checked against the forecast.

I built this for my girlfriend and me. We kept saying "we should do that someday" and then forgetting about it, so I made a little web app where we can collect all those ideas in one place. It's designed around a newspaper/almanac aesthetic that felt right for a list of adventures.

You're welcome to self-host it for yourself.

## What it does

- **Households** — Create a private space and invite your partner with a short code. No accounts, no email, no passwords.
- **Bucket list items** — Add things you want to do with a title, notes, location, tags, season preferences, weather conditions, and a priority (hearts).
- **Map view** — Everything is pinned on a Leaflet map so you can see what's nearby.
- **Recommendations** — Suggests items based on current season, weather, and proximity.
- **Zero external dependencies** — Data lives in a local SQLite file. No cloud services, no analytics, no tracking.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, server actions)
- [SQLite](https://www.sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org) for maps
- [Tailwind CSS](https://tailwindcss.com) v4

## Running locally

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The database is created automatically on first request.

To seed some demo data:

```bash
pnpm seed
```

## Self-hosting with Docker

```bash
docker build -t bucket-list .
docker run -p 3000:3000 -v bucket-list-data:/app/data bucket-list
```

The SQLite database is stored in `/app/data/`. Mount a volume there so it persists across restarts.

You can also set `DB_PATH` to a custom location:

```bash
docker run -e DB_PATH=/data/my.db -v my-vol:/data -p 3000:3000 bucket-list
```

## Docker Compose

```yaml
services:
  bucket-list:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_PATH=/app/data/bucket-list.db
    volumes:
      - bucket-list-data:/app/data
    restart: unless-stopped

volumes:
  bucket-list-data:
```

## License

Do whatever you want with it. No warranty, no support obligations.
