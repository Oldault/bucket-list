"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import type { Forecast, DayPart } from "@/lib/weather";
import { scoreItems, type Scored } from "@/lib/recommend";
import { currentSeason } from "@/lib/utils";
import { weatherEmoji, weatherLabel } from "@/lib/weather";
import { setHomeLocationAction } from "@/lib/actions";
import { ItemCard } from "./item-card";
import { Ornament } from "./ornament";
import type { HouseholdSummary } from "./app-shell";

export function Recommendations({
  items,
  household,
}: {
  items: Item[];
  household: HouseholdSummary;
}) {
  const router = useRouter();
  const [forecast, setForecast] = useState<Forecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [dayIndex, setDayIndex] = useState(0);

  const fetchFor = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forecast?lat=${lat}&lng=${lng}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "forecast failed");
      }
      const json = (await res.json()) as { forecast: Forecast[] };
      setForecast(json.forecast);
    } catch (e) {
      setError(e instanceof Error ? e.message : "forecast failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (household.homeLat != null && household.homeLng != null) {
      fetchFor(household.homeLat, household.homeLng);
    }
  }, [household.homeLat, household.homeLng, fetchFor]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not available");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        startSaving(async () => {
          await setHomeLocationAction(latitude, longitude);
          router.refresh();
          fetchFor(latitude, longitude);
        });
      },
      (err) => {
        setLoading(false);
        setError(err.message);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  const today = forecast?.[dayIndex];

  const scored: Scored[] = useMemo(
    () =>
      scoreItems(items, {
        forecast: today,
        season: currentSeason(),
      }),
    [items, today],
  );

  const top = scored.slice(0, 6);
  const date = new Date();
  date.setDate(date.getDate() + dayIndex);
  const longDate = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-12">
      {/* the weather almanac — newspaper style */}
      <div className="relative border border-[var(--rule)] bg-[var(--paper-warm)]">
        <div className="border-b border-[var(--rule)] px-6 py-3 text-center">
          <div className="eyebrow">the weather almanac</div>
        </div>

        <div className="grid gap-0 px-6 py-10 sm:grid-cols-[1fr_auto_1fr] sm:px-10">
          {/* left: date + prose */}
          <div className="sm:pr-8">
            <div className="smallcaps">this day</div>
            <div className="num-mono mt-1 text-lg">{longDate}</div>
            <div className="eyebrow mt-4">forecast for</div>
            <div className="font-display text-2xl italic">
              {household.homeLat != null ? "your area" : "somewhere…"}
            </div>
          </div>

          {/* center: big weather */}
          <div className="flex flex-col items-center justify-center border-y border-[var(--rule)] py-8 sm:border-x sm:border-y-0 sm:px-12 sm:py-0">
            {today ? (
              <>
                <div className="text-7xl">{weatherEmoji(today.weatherCode)}</div>
                <div className="font-display mt-3 text-3xl italic leading-none">
                  {weatherLabel(today.weatherCode).toLowerCase()}
                </div>
                <div className="num-mono mt-3 text-lg text-[var(--ink-soft)]">
                  {Math.round(today.tempMin)}° — {Math.round(today.tempMax)}°
                </div>
                {(today.morning || today.afternoon) && (
                  <div className="mt-4 flex gap-5">
                    {today.morning && (
                      <div className="flex flex-col items-center">
                        <span className="smallcaps !text-[10px]">morning</span>
                        <span className="mt-1 text-2xl">{weatherEmoji(today.morning.weatherCode)}</span>
                        <span className="num-mono text-xs text-[var(--ink-soft)]">{today.morning.temp}°</span>
                      </div>
                    )}
                    {today.afternoon && (
                      <div className="flex flex-col items-center">
                        <span className="smallcaps !text-[10px]">afternoon</span>
                        <span className="mt-1 text-2xl">{weatherEmoji(today.afternoon.weatherCode)}</span>
                        <span className="num-mono text-xs text-[var(--ink-soft)]">{today.afternoon.temp}°</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : loading ? (
              <div className="font-display text-3xl italic text-[var(--muted-foreground)]">
                loading forecast…
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="font-display text-2xl italic text-[var(--muted-foreground)]">
                  where shall we look?
                </div>
                <button
                  onClick={useMyLocation}
                  disabled={saving}
                  className="btn-ghost !py-2"
                >
                  <MapPin className="size-4" />
                  here
                </button>
                {error && <div className="text-sm italic text-[var(--rose)]">{error}</div>}
              </div>
            )}
          </div>

          {/* right: what it means */}
          <div className="pt-6 sm:pl-8 sm:pt-0">
            <div className="smallcaps">what it suggests</div>
            <p className="mt-2 font-display text-xl leading-snug italic">
              {today
                ? whisper(today)
                : "set your location to get suggestions."}
            </p>
          </div>
        </div>

        {forecast && forecast.length > 1 && (
          <div className="border-t border-[var(--rule)] px-4 py-3">
            <div className="flex gap-1 overflow-x-auto">
              {forecast.slice(0, 7).map((f, i) => {
                const active = i === dayIndex;
                return (
                  <button
                    key={f.date}
                    onClick={() => setDayIndex(i)}
                    className={
                      "flex min-w-[96px] flex-col items-center border px-3 py-2 transition " +
                      (active
                        ? "border-[var(--primary)] bg-[var(--paper-deep)]"
                        : "border-transparent hover:border-[var(--rule)]")
                    }
                    style={{ borderRadius: 2 }}
                  >
                    <span className={
                      "smallcaps !text-[10px] " +
                      (active ? "!text-[var(--primary)]" : "")
                    }>{dayLabel(i)}</span>
                    <div className="mt-1 flex items-center gap-1">
                      <DayPartIcon part={f.morning} fallbackCode={f.weatherCode} size="text-base" />
                      <span className="text-[10px] text-[var(--muted-foreground)]">/</span>
                      <DayPartIcon part={f.afternoon} fallbackCode={f.weatherCode} size="text-base" />
                    </div>
                    <div className="num-mono mt-0.5 flex gap-1 text-[11px]">
                      <span>{Math.round(f.tempMin)}°</span>
                      <span className="text-[var(--muted-foreground)]">/</span>
                      <span>{Math.round(f.tempMax)}°</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* suggestions */}
      {top.length === 0 ? (
        <div className="border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-10 py-16 text-center">
          <p className="font-display text-2xl italic text-[var(--muted-foreground)]">
            Add some ideas first and we'll suggest what fits the day.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="font-display text-3xl italic">chosen for this day</h3>
            <Ornament className="h-3 w-32 text-[var(--rule)]" />
          </div>

          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {top.map(({ item, reasons }, i) => (
              <li key={item.id} className="rise-in space-y-2">
                <ItemCard item={item} index={i} />
                {reasons.length > 0 && (
                  <p className="px-2 font-display text-sm italic text-[var(--accent-deep)]">
                    ✧ {reasons.join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function whisper(f: Forecast): string {
  const tags = new Set(f.tags);
  if (tags.has("snow")) return "snow day. stay in or bundle up.";
  if (tags.has("rainy")) return "rain expected. good day for something indoors.";
  if (tags.has("hot")) return "it's going to be hot. find shade or water.";
  if (tags.has("cold")) return "cold out there. dress warm.";
  if (tags.has("sunny")) return "clear skies — great day to be outside.";
  if (tags.has("cloudy")) return "overcast but mild. nice for a walk.";
  return "nothing special weather-wise. pick anything.";
}

function DayPartIcon({
  part,
  fallbackCode,
  size = "text-xl",
}: {
  part: DayPart | null;
  fallbackCode: number;
  size?: string;
}) {
  const code = part?.weatherCode ?? fallbackCode;
  return <span className={size}>{weatherEmoji(code)}</span>;
}

function dayLabel(i: number) {
  if (i === 0) return "today";
  if (i === 1) return "tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString(undefined, { weekday: "short" }).toLowerCase();
}
