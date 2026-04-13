import { NextResponse } from "next/server";
import { geocodeSearch } from "@/lib/geocode";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const hits = await geocodeSearch(q);
  return NextResponse.json({ hits });
}
