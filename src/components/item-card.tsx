"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, MapPin, MoreVertical, Pencil, Trash2, Undo2 } from "lucide-react";
import type { Item } from "@/lib/types";
import { deleteItemAction, toggleItemDoneAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { AddItemDialog } from "./add-item-dialog";

const SEASON_LABEL: Record<string, string> = {
  spring: "in spring",
  summer: "in summer",
  fall: "in autumn",
  winter: "in winter",
};

export function ItemCard({ item, index }: { item: Item; index?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  function toggle() {
    start(async () => {
      await toggleItemDoneAction(item.id);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this idea?")) return;
    start(async () => {
      await deleteItemAction(item.id);
      router.refresh();
    });
  }

  const tilt = ((item.id.charCodeAt(0) % 5) - 2) * 0.15; // -0.3..+0.3 deg

  return (
    <article
      className={cn(
        "postcard group flex h-full flex-col p-5 pt-4",
        item.done && "opacity-80",
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* page head */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="num-mono text-[11px] text-[var(--muted-foreground)]">
            № {String((index ?? 0) + 1).padStart(3, "0")}
          </span>
          {item.priority >= 3 && (
            <span className="font-display italic text-[var(--rose)]">♥♥♥</span>
          )}
          {item.priority === 2 && (
            <span className="font-display italic text-[var(--muted-foreground)]">♥♥</span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          >
            <MoreVertical className="size-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                  aria-label="close"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-1 w-44 origin-top-right overflow-hidden rounded-[2px] border border-[var(--border)] bg-[var(--card)] shadow-lg"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm italic text-[var(--foreground)] hover:bg-[var(--paper-deep)]"
                  >
                    <Pencil className="size-4" />
                    edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      remove();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm italic text-[var(--rose)] hover:bg-[var(--paper-deep)]"
                  >
                    <Trash2 className="size-4" />
                    delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {item.image_url && (
        <div className="relative mt-3 aspect-[4/3] overflow-hidden border border-[var(--border)] bg-[var(--paper-deep)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
          {/* photo corners */}
          <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[var(--rule)]" />
          <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[var(--rule)]" />
          <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[var(--rule)]" />
          <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[var(--rule)]" />
        </div>
      )}

      {/* title */}
      <h3
        className={cn(
          "font-display mt-4 text-2xl leading-[1.05]",
          item.done && "line-through decoration-[var(--primary)] decoration-1",
        )}
      >
        {item.title}
      </h3>

      {/* notes */}
      {item.notes && (
        <p className="mt-2 line-clamp-3 italic text-[15px] leading-snug text-[var(--ink-soft)]">
          “{item.notes}”
        </p>
      )}

      {/* address */}
      {item.address && (
        <div className="mt-3 flex items-start gap-1.5 text-xs text-[var(--muted-foreground)]">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-[var(--primary)]" />
          <span className="line-clamp-1 italic">{item.address}</span>
        </div>
      )}

      {/* meta */}
      {(item.seasons.length > 0 || item.tags.length > 0 || item.indoor) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--muted-foreground)]">
          {item.seasons.map((s) => (
            <span key={s} className="smallcaps !text-[10px]">{SEASON_LABEL[s]}</span>
          ))}
          {item.indoor && <span className="smallcaps !text-[10px]">indoor option</span>}
          {item.tags.map((t) => (
            <span key={t} className="italic text-[var(--accent-deep)]">· {t}</span>
          ))}
        </div>
      )}

      {/* footer rule */}
      <div className="mt-auto pt-4">
        <hr className="rule" />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {item.addedByName && (
              <>
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: item.addedByColor ?? "#999" }}
                />
                <span className="font-display italic text-[var(--ink-soft)]">
                  pinned by {item.addedByName}
                </span>
              </>
            )}
          </div>

          <button
            onClick={toggle}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-1.5 font-display text-sm italic transition",
              item.done
                ? "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                : "text-[var(--primary)] hover:translate-x-0.5",
            )}
          >
            {item.done ? <Undo2 className="size-3.5" /> : <Check className="size-3.5" />}
            {item.done ? "put it back" : "we did it →"}
          </button>
        </div>
      </div>
      <AddItemDialog open={editOpen} onOpenChange={setEditOpen} item={item} />
    </article>
  );
}
