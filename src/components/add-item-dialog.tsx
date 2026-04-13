"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { AddItemForm } from "./add-item-form";
import { Ornament } from "./ornament";
import type { Item } from "@/lib/types";

export function AddItemDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item?: Item;
}) {
  const isEdit = !!item;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-[#1f130a]/60 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-[0_40px_100px_-40px_rgba(60,30,10,0.6)]"
            style={{ borderRadius: 4 }}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper-warm)] px-5 py-4 sm:px-8 sm:py-5">
              <div>
                <div className="eyebrow">{isEdit ? "revising" : "a new entry"}</div>
                <h2 className="font-display text-3xl leading-none">
                  {isEdit ? <>Edit this <span className="italic">idea</span></> : <>Pen an <span className="italic">idea</span></>}
                  <span className="text-[var(--primary)]">.</span>
                </h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-[var(--rule)] py-2">
              <Ornament className="mx-auto h-3 w-32 text-[var(--rule)]" />
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">
              <AddItemForm key={item?.id ?? "new"} onDone={() => onOpenChange(false)} item={item} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
