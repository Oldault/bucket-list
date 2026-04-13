"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { createHouseholdAction, joinHouseholdAction } from "@/lib/actions";

export function OnboardingForms() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <CreateCard />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <JoinCard />
      </motion.div>
    </>
  );
}

function CreateCard() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const res = await createHouseholdAction(fd);
          if (res && "error" in res) setError(res.error);
        })
      }
      className="postcard relative px-8 py-10 sm:px-12 sm:py-12"
    >
      {/* chapter marker */}
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Chapter i.</span>
        <span className="num-mono text-[11px] text-[var(--muted-foreground)]">01 / 02</span>
      </div>

      <h2 className="font-display mt-5 text-5xl leading-[0.95] sm:text-6xl">
        Begin the<br />
        <span className="italic">almanac</span>.
      </h2>

      <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)]">
        Start a new book. You&apos;ll get an invitation code to share
        with your partner.
      </p>

      <div className="mt-8 space-y-6">
        <Field label="title of this volume" name="householdName" placeholder="our grand adventure" required />
        <Field label="signed by" name="yourName" placeholder="Eloise" required />
      </div>

      <div className="mt-10 flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-wax">
          {pending ? "pressing ink…" : "open the book"}
          <span aria-hidden>→</span>
        </button>
        {error && <p className="text-sm italic text-[var(--rose)]">{error}</p>}
      </div>
    </form>
  );
}

function JoinCard() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const res = await joinHouseholdAction(fd);
          if (res && "error" in res) setError(res.error);
        })
      }
      className="relative flex flex-col justify-between rounded-[4px] border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-8 py-10 sm:px-10 sm:py-12"
      style={{ minHeight: "100%" }}
    >
      <div>
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Chapter ii.</span>
          <span className="num-mono text-[11px] text-[var(--muted-foreground)]">02 / 02</span>
        </div>

        <h2 className="font-display mt-5 text-4xl italic leading-[0.95] sm:text-5xl">
          Received an
          <br />
          invitation?
        </h2>

        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)]">
          Enter the code your partner sent you.
        </p>

        <div className="mt-8 space-y-6">
          <Field
            label="invitation code"
            name="code"
            placeholder="ABCXYZ"
            required
            maxLength={8}
            className="num-mono !text-2xl tracking-[0.35em] uppercase"
          />
          <Field label="signed by" name="yourName" placeholder="Arthur" required />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-ghost">
          {pending ? "unsealing…" : "break the seal"}
          <span aria-hidden>→</span>
        </button>
        {error && <p className="text-sm italic text-[var(--rose)]">{error}</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="smallcaps">{label}</span>
      <input {...rest} className={`input-ink mt-1 ${className}`} />
    </label>
  );
}
