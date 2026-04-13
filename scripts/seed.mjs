import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { nanoid } from "nanoid";

const DB_PATH = join(process.cwd(), "data", "bucket-list.db");
mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS households (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, invite_code TEXT NOT NULL UNIQUE,
    home_lat REAL, home_lng REAL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY, household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name TEXT NOT NULL, color TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    added_by TEXT NOT NULL REFERENCES members(id), title TEXT NOT NULL, notes TEXT,
    lat REAL, lng REAL, address TEXT,
    seasons TEXT NOT NULL DEFAULT '[]', tags TEXT NOT NULL DEFAULT '[]', weather TEXT NOT NULL DEFAULT '[]',
    indoor INTEGER NOT NULL DEFAULT 0, priority INTEGER NOT NULL DEFAULT 2,
    image_url TEXT, done INTEGER NOT NULL DEFAULT 0, done_at INTEGER,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  );
`);

const hId = nanoid();
const mId = nanoid();
const now = Date.now();

db.prepare("INSERT INTO households VALUES (?, ?, ?, ?, ?, ?)")
  .run(hId, "Our adventures", "DEMO01", 48.8566, 2.3522, now);
db.prepare("INSERT INTO members VALUES (?, ?, ?, ?, ?)")
  .run(mId, hId, "Emma", "#ec4899", now);

const ins = db.prepare(`
  INSERT INTO items (id, household_id, added_by, title, notes, lat, lng, address,
    seasons, tags, weather, indoor, priority, image_url, done, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
`);
ins.run(nanoid(), hId, mId, "Watch a meteor shower", "Find a dark-sky spot", null, null, null,
  '["summer","fall"]', '["romantic"]', '["sunny","cloudy"]', 0, 3, null, now, now);
ins.run(nanoid(), hId, mId, "Visit the Louvre", null, 48.8606, 2.3376, "Louvre, Paris",
  '[]', '["museum"]', '["any"]', 1, 2, null, now, now);

console.log(JSON.stringify({ householdId: hId, memberId: mId }));
