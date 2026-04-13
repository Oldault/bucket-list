"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { ClipboardCopy, LogOut, Plus } from "lucide-react";
import type { Item } from "@/lib/types";
import { signOutAction } from "@/lib/actions";
import { ItemGrid } from "./item-grid";
import { AddItemDialog } from "./add-item-dialog";
import { Recommendations } from "./recommendations";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--paper-deep)] font-display text-xl italic text-[var(--muted-foreground)]">
      loading the map…
    </div>
  ),
});

export type Member = { id: string; name: string; color: string };
export type HouseholdSummary = {
  id: string;
  name: string;
  inviteCode: string;
  homeLat: number | null;
  homeLng: number | null;
};

type Tab = "ideas" | "map" | "forus" | "done";

const TABS: { id: Tab; label: string; roman: string }[] = [
  { id: "ideas", label: "Ideas", roman: "I" },
  { id: "map", label: "The map", roman: "II" },
  { id: "forus", label: "For us", roman: "III" },
  { id: "done", label: "Lived", roman: "IV" },
];

export function AppShell({
  household,
  me,
  initialItems,
  members,
}: {
  household: HouseholdSummary;
  me: Member;
  initialItems: Item[];
  members: Member[];
}) {
  const [tab, setTab] = useState<Tab>("ideas");
  const [addOpen, setAddOpen] = useState(false);
  const items = initialItems;

  const notDone = useMemo(() => items.filter((i) => !i.done), [items]);
  const done = useMemo(() => items.filter((i) => i.done), [items]);

  const heading = {
    ideas: { label: "Things we want to", italic: "do" },
    map: { label: "Where we're", italic: "going" },
    forus: { label: "Picked for", italic: "today" },
    done: { label: "Things we", italic: "did" },
  }[tab];

  return (
    <div className="paper flex flex-1 flex-col">
      <Header household={household} me={me} members={members} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        {/* section masthead */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">the journal · {tab === "ideas" ? "open pages" : tab === "map" ? "the chart" : tab === "forus" ? "today's almanac" : "the archive"}</div>
            <h1 className="font-display mt-2 text-5xl leading-[0.9] sm:text-6xl">
              {heading.label}{" "}
              <span className="italic">{heading.italic}</span>
              <span className="text-[var(--primary)]">.</span>
            </h1>
          </div>
          <div className="hidden items-center gap-5 sm:flex">
            <div className="text-right">
              <div className="smallcaps">in the book</div>
              <div className="num-mono text-3xl text-[var(--primary)]">
                {String(notDone.length).padStart(2, "0")}
              </div>
            </div>
            <div className="h-10 w-px bg-[var(--rule)]" />
            <div className="text-right">
              <div className="smallcaps">lived</div>
              <div className="num-mono text-3xl text-[var(--accent-deep)]">
                {String(done.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>

        <Tabs current={tab} onChange={setTab} />

        <div className="mt-10">
          {tab === "ideas" && (
            <ItemGrid
              items={notDone}
              emptyLabel="Nothing here yet. Add your first idea."
            />
          )}
          {tab === "done" && (
            <ItemGrid
              items={done}
              emptyLabel="Nothing completed yet. Go do something."
            />
          )}
          {tab === "map" && (
            <MapView
              items={items.filter((i) => i.lat != null && i.lng != null)}
              homeLat={household.homeLat}
              homeLng={household.homeLng}
            />
          )}
          {tab === "forus" && <Recommendations items={notDone} household={household} />}
        </div>
      </main>

      <AddButton onClick={() => setAddOpen(true)} />
      <AddItemDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function Header({
  household,
  me,
  members,
}: {
  household: HouseholdSummary;
  me: Member;
  members: Member[];
}) {
  const [copied, setCopied] = useState(false);
  const [, startSignOut] = useTransition();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--rule)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-block size-[6px] rotate-45 bg-[var(--primary)]" />
          <div className="min-w-0">
            <div className="eyebrow leading-none">the book of</div>
            <div className="truncate font-display text-2xl leading-tight">
              {household.name}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center -space-x-2 sm:flex">
            {members.slice(0, 4).map((m) => (
              <span
                key={m.id}
                title={m.name + (m.id === me.id ? " (you)" : "")}
                className="inline-flex size-9 items-center justify-center rounded-full font-display text-base italic text-[var(--primary-foreground)] ring-2 ring-[var(--background)]"
                style={{ background: m.color }}
              >
                {m.name.slice(0, 1).toUpperCase()}
              </span>
            ))}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(household.inviteCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="group inline-flex items-center gap-2 rounded-[2px] border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-3 py-2 text-[var(--ink-soft)] hover:border-[var(--primary)]"
            title="Copy invitation code"
          >
            <ClipboardCopy className="size-3.5 opacity-60 group-hover:opacity-100" />
            <span className="num-mono text-sm tracking-[0.28em]">{household.inviteCode}</span>
            {copied && <span className="eyebrow">copied ✓</span>}
          </button>

          <form action={() => startSignOut(() => signOutAction())}>
            <button
              type="submit"
              className="inline-flex items-center rounded-full p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              title="Close the book"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function Tabs({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="mt-10 border-y border-[var(--rule)]">
      <ul className="flex flex-wrap items-stretch gap-x-8">
        {TABS.map((t) => {
          const active = current === t.id;
          return (
            <li key={t.id} className="relative">
              <button
                onClick={() => onChange(t.id)}
                className={cn(
                  "flex items-baseline gap-2 py-4 font-display text-lg transition",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                <span className="num-mono text-xs opacity-70">{t.roman}.</span>
                <span className={active ? "italic" : ""}>{t.label}</span>
              </button>
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[var(--primary)]" />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn-wax fixed bottom-6 right-6 z-40 !px-6 !py-4"
      style={{ animation: "slowDrift 7s ease-in-out infinite" }}
    >
      <Plus className="size-4" strokeWidth={2.4} />
      <span className="italic">pen a new idea</span>
    </button>
  );
}
