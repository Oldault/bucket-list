"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Item } from "@/lib/types";
import { ItemCard } from "./item-card";
import { cn } from "@/lib/utils";

export function ItemGrid({
  items,
  emptyLabel,
}: {
  items: Item[];
  emptyLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (tagFilter && !i.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        (i.notes?.toLowerCase().includes(q) ?? false) ||
        (i.address?.toLowerCase().includes(q) ?? false) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, tagFilter]);

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-10 py-20 text-center">
        <p className="font-display text-2xl italic text-[var(--muted-foreground)]">
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-[var(--rule)] pb-5 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <span className="smallcaps">search the book</span>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-1 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search by name, place, tag…"
              className="input-ink !pl-7 !text-base"
            />
          </div>
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <TagBtn active={!tagFilter} onClick={() => setTagFilter(null)}>
              all
            </TagBtn>
            {allTags.map((t) => (
              <TagBtn
                key={t}
                active={tagFilter === t}
                onClick={() => setTagFilter(tagFilter === t ? null : t)}
              >
                {t}
              </TagBtn>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-8 py-10 text-center font-display text-xl italic text-[var(--muted-foreground)]">
          nothing here — yet.
        </p>
      ) : (
        <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i, idx) => (
            <li key={i.id} className="rise-in">
              <ItemCard item={i} index={idx} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TagBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={cn("chip", active && "is-active")}>
      {children}
    </button>
  );
}
