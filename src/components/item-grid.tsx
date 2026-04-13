"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-10 py-20 text-center"
      >
        <p className="font-display text-2xl italic text-[var(--muted-foreground)]">
          {emptyLabel}
        </p>
      </motion.div>
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

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-8 py-10 text-center font-display text-xl italic text-[var(--muted-foreground)]"
          >
            nothing here — yet.
          </motion.p>
        ) : (
          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((i, idx) => (
                <motion.li
                  key={i.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.04,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                >
                  <ItemCard item={i} index={idx} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </AnimatePresence>
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
