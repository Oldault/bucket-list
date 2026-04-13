import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { OnboardingForms } from "@/components/onboarding-forms";
import { Compass, Ornament, WaxSeal } from "@/components/ornament";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/app");

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="paper relative flex-1 overflow-hidden">
      {/* top masthead */}
      <div className="mx-auto w-full max-w-6xl px-6 pt-10 sm:pt-14">
        <div className="flex items-end justify-between">
          <div className="smallcaps flex items-center gap-3">
            <span className="inline-block size-[6px] rotate-45 bg-[var(--primary)]" />
            <span>est. one lazy afternoon</span>
          </div>
          <div className="smallcaps num-mono hidden sm:block">{today}</div>
        </div>
        <hr className="rule mt-4" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pt-14 sm:pt-24">
        {/* compass in the margin */}
        <Compass className="pointer-events-none absolute right-8 top-10 h-24 w-24 text-[var(--rule)] opacity-80 sm:right-12 sm:top-16 sm:h-32 sm:w-32" />

        <div className="eyebrow">a private almanac for two</div>

        <h1 className="font-display mt-4 text-[15vw] leading-[0.86] sm:text-[120px]">
          The book
          <br />
          <span className="italic">of us</span>
          <span className="text-[var(--primary)]">.</span>
        </h1>

        <div className="mt-8 flex items-center gap-4 text-[var(--rule)]">
          <Ornament className="h-3 w-40 text-[var(--accent-deep)]" />
          <span className="smallcaps text-[var(--accent-deep)]">no. i</span>
        </div>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
          A shared list for the things we want to do — pinned to a map,
          sorted by season, checked against the forecast. For all the{" "}
          <span className="italic">somedays</span> that deserve an actual date.
        </p>
      </section>

      {/* the two entry cards, as a paper spread */}
      <section className="mx-auto mt-16 grid w-full max-w-6xl gap-10 px-6 pb-20 sm:mt-24 sm:grid-cols-[1.05fr_0.95fr]">
        <OnboardingForms />
      </section>

      {/* running footer */}
      <footer className="mx-auto w-full max-w-6xl px-6 pb-12">
        <hr className="rule mb-4" />
        <div className="flex items-center justify-between text-[var(--muted-foreground)]">
          <span className="smallcaps">made with care · for two</span>
          <div className="flex items-center gap-3">
            <WaxSeal letter="&amp;" className="scale-75" />
          </div>
        </div>
      </footer>
    </main>
  );
}
