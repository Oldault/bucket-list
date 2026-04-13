export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <line x1="2" y1="7" x2="82" y2="7" />
      <line x1="118" y1="7" x2="198" y2="7" />
      <g transform="translate(100 7)">
        <path d="M0 -5 L4 0 L0 5 L-4 0 Z" fill="currentColor" />
        <circle cx="-12" cy="0" r="1.1" fill="currentColor" />
        <circle cx="12" cy="0" r="1.1" fill="currentColor" />
      </g>
    </svg>
  );
}

export function Compass({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <circle cx="30" cy="30" r="27" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
      <g stroke="currentColor" strokeWidth="0.8">
        <line x1="30" y1="3" x2="30" y2="9" />
        <line x1="30" y1="51" x2="30" y2="57" />
        <line x1="3" y1="30" x2="9" y2="30" />
        <line x1="51" y1="30" x2="57" y2="30" />
      </g>
      <path d="M30 12 L34 30 L30 48 L26 30 Z" fill="currentColor" opacity="0.85" />
      <circle cx="30" cy="30" r="1.6" fill="currentColor" />
      <text x="30" y="8" textAnchor="middle" fontSize="5" fontFamily="var(--font-display)" fill="currentColor">N</text>
    </svg>
  );
}

export function WaxSeal({ className = "", letter = "♥" }: { className?: string; letter?: string }) {
  return (
    <div
      className={
        "relative inline-flex items-center justify-center rounded-full text-[var(--primary-foreground)] " +
        className
      }
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #c93a3a 0%, #7a1a1a 55%, #4a0a0a 100%)",
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,0.25), 0 12px 20px -10px rgba(60,0,0,0.6)",
        width: "3.4rem",
        height: "3.4rem",
        transform: "rotate(-4deg)",
      }}
    >
      <span className="font-display text-2xl italic leading-none">{letter}</span>
    </div>
  );
}
