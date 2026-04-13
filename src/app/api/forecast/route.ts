import { NextResponse } from "next/server";
import { fetchForecast } from "@/lib/weather";
import { getSessionContext } from "@/lib/session";

export async function GET(req: Request) {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const useLat = Number.isFinite(lat) ? lat : ctx.household.home_lat;
  const useLng = Number.isFinite(lng) ? lng : ctx.household.home_lng;
  if (useLat == null || useLng == null) {
    return NextResponse.json({ error: "no_location" }, { status: 400 });
  }
  try {
    const forecast = await fetchForecast(useLat, useLng);
    return NextResponse.json({ forecast });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "forecast_failed" },
      { status: 502 },
    );
  }
}
