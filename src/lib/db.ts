import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Item, Season, WeatherTag } from "./types";

const DB_PATH =
  process.env.DB_PATH ?? join(process.cwd(), "data", "bucket-list.db");

let _db: Database.Database | null = null;

export function db() {
  if (_db) return _db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const instance = new Database(DB_PATH);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  migrate(instance);
  _db = instance;
  return instance;
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS households (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT NOT NULL UNIQUE,
      home_lat REAL,
      home_lng REAL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_members_household ON members(household_id);

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
      added_by TEXT NOT NULL REFERENCES members(id),
      title TEXT NOT NULL,
      notes TEXT,
      lat REAL,
      lng REAL,
      address TEXT,
      seasons TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      weather TEXT NOT NULL DEFAULT '[]',
      indoor INTEGER NOT NULL DEFAULT 0,
      priority INTEGER NOT NULL DEFAULT 2,
      image_url TEXT,
      done INTEGER NOT NULL DEFAULT 0,
      done_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_items_household ON items(household_id);
    CREATE INDEX IF NOT EXISTS idx_items_done ON items(household_id, done);
  `);
}

export type ItemRow = {
  id: string;
  household_id: string;
  added_by: string;
  title: string;
  notes: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  seasons: string;
  tags: string;
  weather: string;
  indoor: number;
  priority: number;
  image_url: string | null;
  done: number;
  done_at: number | null;
  created_at: number;
  updated_at: number;
};

export type MemberRow = {
  id: string;
  household_id: string;
  name: string;
  color: string;
  created_at: number;
};

export type HouseholdRow = {
  id: string;
  name: string;
  invite_code: string;
  home_lat: number | null;
  home_lng: number | null;
  created_at: number;
};

export function rowToItem(row: ItemRow, member?: MemberRow): Item {
  return {
    id: row.id,
    household_id: row.household_id,
    added_by: row.added_by,
    title: row.title,
    notes: row.notes,
    lat: row.lat,
    lng: row.lng,
    address: row.address,
    seasons: safeJson<Season[]>(row.seasons, []),
    tags: safeJson<string[]>(row.tags, []),
    weather: safeJson<WeatherTag[]>(row.weather, []),
    indoor: !!row.indoor,
    priority: row.priority,
    image_url: row.image_url,
    done: !!row.done,
    done_at: row.done_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    addedByName: member?.name,
    addedByColor: member?.color,
  };
}

function safeJson<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
