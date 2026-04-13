"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AddItemForm } from "./add-item-form";
import { Ornament } from "./ornament";

export function AddItemDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[#1f130a]/60 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-[0_40px_100px_-40px_rgba(60,30,10,0.6)]"
        style={{ borderRadius: 4 }}
      >
        <div className="flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper-warm)] px-8 py-5">
          <div>
            <div className="eyebrow">a new entry</div>
            <h2 className="font-display text-3xl leading-none">
              Pen an <span className="italic">idea</span>
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
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <AddItemForm onDone={() => onOpenChange(false)} />
        </div>
      </div>
    </div>
  );
}
