"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Search, X } from "lucide-react";
import { createItemAction, updateItemAction } from "@/lib/actions";
import { SEASONS, WEATHER_TAGS, type Season, type WeatherTag, type Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const LocationPicker = dynamic(
  () => import("./location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-56 border border-dashed border-[var(--rule)] bg-[var(--paper-deep)]" /> },
);

type GeocodeHit = { displayName: string; lat: number; lng: number };

const SEASON_LABELS: Record<Season, string> = {
  spring: "spring",
  summer: "summer",
  fall: "autumn",
  winter: "winter",
};

const WEATHER_LABELS: Record<WeatherTag, string> = {
  sunny: "sunny",
  cloudy: "overcast",
  rainy: "rainy",
  snow: "snowy",
  hot: "warm",
  cold: "cold",
  any: "any weather",
};

export function AddItemForm({ onDone, item }: { onDone: () => void; item?: Item }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const isEdit = !!item;

  const [title, setTitle] = useState(item?.title ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [seasons, setSeasons] = useState<Season[]>(item?.seasons ?? []);
  const [weather, setWeather] = useState<WeatherTag[]>(item?.weather ?? []);
  const [indoor, setIndoor] = useState(item?.indoor ?? false);
  const [priority, setPriority] = useState(item?.priority ?? 2);
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");

  const [address, setAddress] = useState<string | null>(item?.address ?? null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    item?.lat != null && item?.lng != null ? { lat: item.lat, lng: item.lng } : null,
  );

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setHits(json.hits ?? []);
    } finally {
      setSearching(false);
    }
  }

  function addTag() {
    const v = tagInput.trim().replace(/,/g, "");
    if (!v) return;
    if (!tags.includes(v)) setTags([...tags, v]);
    setTagInput("");
  }

  function submit() {
    setError(null);
    if (!title.trim()) {
      setError("every idea needs a title");
      return;
    }
    start(async () => {
      const payload = {
        title: title.trim(),
        notes: notes.trim() || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        address,
        seasons,
        tags,
        weather,
        indoor,
        priority,
        imageUrl: imageUrl.trim() || null,
      };
      const res = isEdit
        ? await updateItemAction(item.id, payload)
        : await createItemAction(payload);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="space-y-9">
      <Section roman="i" title="the idea">
        <Field label="what is it">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="watch a meteor shower from a blanket"
            className="input-ink !text-xl"
          />
        </Field>

        <Field label="notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="bring a thermos, the darkest skies are outside the city…"
            className="input-ink !border-b"
          />
        </Field>
      </Section>

      <Section roman="ii" title="the place">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-1 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
              placeholder="a town, a trail, a coordinate…"
              className="input-ink !pl-7"
            />
          </div>
          <button
            type="button"
            onClick={search}
            disabled={searching}
            className="btn-ghost !py-2.5"
          >
            {searching ? "…" : "find"}
          </button>
        </div>

        {hits.length > 0 && (
          <ul className="mt-3 divide-y divide-[var(--rule)] border border-[var(--rule)] bg-[var(--paper-warm)]">
            {hits.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setCoords({ lat: h.lat, lng: h.lng });
                    setAddress(h.displayName);
                    setHits([]);
                    setQuery("");
                  }}
                  className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-[15px] italic hover:bg-[var(--paper-deep)]"
                >
                  <MapPin className="mt-1 size-4 shrink-0 text-[var(--primary)]" />
                  <span className="line-clamp-2">{h.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <LocationPicker
            coords={coords}
            onChange={(c) => {
              setCoords(c);
              setAddress(null);
            }}
          />
        </div>

        {coords && (
          <div className="mt-3 flex items-start gap-2 text-sm italic text-[var(--ink-soft)]">
            <MapPin className="mt-0.5 size-4 text-[var(--primary)]" />
            <span className="line-clamp-2 flex-1">
              {address ?? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`}
            </span>
            <button
              type="button"
              onClick={() => {
                setCoords(null);
                setAddress(null);
              }}
              className="text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </Section>

      <Section roman="iii" title="the season">
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => (
            <Chip
              key={s}
              active={seasons.includes(s)}
              onClick={() =>
                setSeasons((cur) =>
                  cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
                )
              }
            >
              {SEASON_LABELS[s]}
            </Chip>
          ))}
        </div>
      </Section>

      <Section roman="iv" title="the weather">
        <div className="flex flex-wrap gap-2">
          {WEATHER_TAGS.map((w) => (
            <Chip
              key={w}
              active={weather.includes(w)}
              onClick={() =>
                setWeather((cur) =>
                  cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w],
                )
              }
            >
              {WEATHER_LABELS[w]}
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => setIndoor((v) => !v)}
            className={cn("chip", indoor && "is-active")}
          >
            indoor option
          </button>
        </div>
      </Section>

      <Section roman="v" title="tags & excitement">
        <div>
          <div className="smallcaps mb-2">tags</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 border border-[var(--rule)] bg-[var(--paper-warm)] px-3 py-1 text-sm italic"
              >
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="text-[var(--muted-foreground)]"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="romantic, hike, foodie…"
              className="input-ink min-w-[160px] flex-1 !py-1 !text-sm"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="smallcaps">excitement</div>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 border px-2 py-3 font-display text-xl italic transition",
                    priority === p
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--rule)] text-[var(--muted-foreground)] hover:text-[var(--primary)]",
                  )}
                  aria-label={`${p} of 3 hearts`}
                  style={{ borderRadius: 2 }}
                >
                  {"♥".repeat(p)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="smallcaps">a photograph</div>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="input-ink mt-2"
            />
          </div>
        </div>
      </Section>

      {error && <p className="font-display text-base italic text-[var(--rose)]">{error}</p>}

      <div className="flex items-center justify-end gap-4 border-t border-[var(--rule)] pt-5">
        <button type="button" onClick={onDone} className="btn-ghost !py-2">
          close the page
        </button>
        <button type="button" onClick={submit} disabled={pending} className="btn-wax">
          {pending ? "pressing ink…" : isEdit ? "save changes" : "add to the book"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function Section({
  roman,
  title,
  children,
}: {
  roman: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="num-mono text-xs text-[var(--muted-foreground)]">{roman}.</span>
        <h3 className="font-display text-2xl italic leading-none">{title}</h3>
        <div className="h-px flex-1 bg-[var(--rule)]" />
      </div>
      <div className="pl-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="smallcaps">{label}</span>
      {children}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("chip", active && "is-active")}
    >
      {children}
    </button>
  );
}
