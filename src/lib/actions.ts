"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  db,
  rowToItem,
  type HouseholdRow,
  type ItemRow,
  type MemberRow,
} from "./db";
import {
  SEASONS,
  WEATHER_TAGS,
  type Item,
  type Season,
  type WeatherTag,
} from "./types";
import { clearSession, getSessionContext, setSession } from "./session";
import { inviteCode, randomColor } from "./utils";

const HouseholdSchema = z.object({
  householdName: z.string().trim().min(1).max(60),
  yourName: z.string().trim().min(1).max(40),
});

const JoinSchema = z.object({
  code: z.string().trim().min(4).max(10),
  yourName: z.string().trim().min(1).max(40),
});

export async function createHouseholdAction(formData: FormData) {
  const parsed = HouseholdSchema.safeParse({
    householdName: formData.get("householdName"),
    yourName: formData.get("yourName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const now = Date.now();
  const householdId = nanoid();
  const memberId = nanoid();
  let code = inviteCode();

  const existing = db().prepare("SELECT id FROM households WHERE invite_code = ?");
  while (existing.get(code)) code = inviteCode();

  db()
    .prepare(
      "INSERT INTO households (id, name, invite_code, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(householdId, parsed.data.householdName, code, now);

  db()
    .prepare(
      "INSERT INTO members (id, household_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(memberId, householdId, parsed.data.yourName, randomColor(), now);

  await setSession({ householdId, memberId });
  redirect("/app");
}

export async function joinHouseholdAction(formData: FormData) {
  const parsed = JoinSchema.safeParse({
    code: (formData.get("code") as string | null)?.toUpperCase(),
    yourName: formData.get("yourName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const household = db()
    .prepare("SELECT * FROM households WHERE invite_code = ?")
    .get(parsed.data.code) as HouseholdRow | undefined;
  if (!household) return { error: "That invite code doesn't exist" };

  const now = Date.now();
  const memberId = nanoid();
  db()
    .prepare(
      "INSERT INTO members (id, household_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(memberId, household.id, parsed.data.yourName, randomColor(), now);

  await setSession({ householdId: household.id, memberId });
  redirect("/app");
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}

const ItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  address: z.string().trim().max(200).optional().nullable(),
  seasons: z.array(z.enum(SEASONS as [Season, ...Season[]])).default([]),
  tags: z.array(z.string().trim().min(1).max(30)).default([]),
  weather: z.array(z.enum(WEATHER_TAGS as [WeatherTag, ...WeatherTag[]])).default([]),
  indoor: z.boolean().default(false),
  priority: z.number().int().min(1).max(3).default(2),
  imageUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
});

export type ItemInput = z.infer<typeof ItemSchema>;

export async function createItemAction(input: ItemInput) {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Not signed in" };

  const parsed = ItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const now = Date.now();
  const id = nanoid();

  db()
    .prepare(
      `INSERT INTO items (
        id, household_id, added_by, title, notes, lat, lng, address,
        seasons, tags, weather, indoor, priority, image_url, done, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .run(
      id,
      ctx.household.id,
      ctx.member.id,
      data.title,
      data.notes ?? null,
      data.lat ?? null,
      data.lng ?? null,
      data.address ?? null,
      JSON.stringify(data.seasons),
      JSON.stringify(data.tags),
      JSON.stringify(data.weather),
      data.indoor ? 1 : 0,
      data.priority,
      data.imageUrl && data.imageUrl.length > 0 ? data.imageUrl : null,
      now,
      now,
    );

  revalidatePath("/app");
  return { ok: true, id };
}

export async function toggleItemDoneAction(id: string) {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Not signed in" };
  const row = db()
    .prepare("SELECT * FROM items WHERE id = ? AND household_id = ?")
    .get(id, ctx.household.id) as ItemRow | undefined;
  if (!row) return { error: "Not found" };
  const next = row.done ? 0 : 1;
  db()
    .prepare("UPDATE items SET done = ?, done_at = ?, updated_at = ? WHERE id = ?")
    .run(next, next ? Date.now() : null, Date.now(), id);
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteItemAction(id: string) {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Not signed in" };
  db().prepare("DELETE FROM items WHERE id = ? AND household_id = ?").run(id, ctx.household.id);
  revalidatePath("/app");
  return { ok: true };
}

export async function setHomeLocationAction(lat: number, lng: number) {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Not signed in" };
  db()
    .prepare("UPDATE households SET home_lat = ?, home_lng = ? WHERE id = ?")
    .run(lat, lng, ctx.household.id);
  revalidatePath("/app");
  return { ok: true };
}

export async function listItems(): Promise<{
  items: Item[];
  members: MemberRow[];
} | null> {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const rows = db()
    .prepare(
      "SELECT * FROM items WHERE household_id = ? ORDER BY done ASC, priority DESC, created_at DESC",
    )
    .all(ctx.household.id) as ItemRow[];
  const members = db()
    .prepare("SELECT * FROM members WHERE household_id = ?")
    .all(ctx.household.id) as MemberRow[];
  const memberById = new Map(members.map((m) => [m.id, m]));
  return {
    items: rows.map((r) => rowToItem(r, memberById.get(r.added_by))),
    members,
  };
}
