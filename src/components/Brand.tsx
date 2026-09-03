import { EVENT } from "@/lib/types";

/** Original six-petal blossom — geometric collab mark, not an official asset. */
export function OpenAiMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          transform={`rotate(${deg} 16 16)`}
          d="M16 2.4 C18.6 8.2 18.8 12.4 16 16 C13.2 12.4 13.4 8.2 16 2.4 Z"
          fill="currentColor"
        />
      ))}
      <circle cx="16" cy="16" r="2.35" fill="currentColor" />
    </svg>
  );
}

/** Original pointed leaf + vein — geometric collab mark, not an official asset. */
export function MongoLeaf({ className = "h-8 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className} aria-hidden>
      <path
        d="M12 1.2 C17.8 8.4 21.2 16.2 12 34.4 C2.8 16.2 6.2 8.4 12 1.2 Z"
        fill="currentColor"
      />
      <path d="M12 6.2 L12 29.5" stroke="#0D0D0D" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="32.2" r="1.55" fill="currentColor" />
    </svg>
  );
}

export function BrandStripe() {
  return (
    <div className="brand-stripe" aria-hidden>
      <span className="bg-oa-black" />
      <span className="bg-openai" />
      <span className="bg-gold" />
      <span className="bg-leaf" />
      <span className="bg-evergreen" />
      <span className="bg-forest" />
    </div>
  );
}

export function BrandLockup({
  size = "md",
  stacked = false,
  tone = "onInk",
}: {
  size?: "sm" | "md" | "lg";
  stacked?: boolean;
  tone?: "onInk" | "onPaper";
}) {
  const mark = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const leaf = size === "lg" ? "h-11 w-7" : size === "sm" ? "h-7 w-4" : "h-9 w-6";
  const type = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  const word = tone === "onPaper" ? "text-ink" : "text-paper";
  return (
    <div
      className={`flex items-center gap-2 ${stacked ? "flex-col sm:flex-row" : ""}`}
      role="group"
      aria-label="OpenAI times MongoDB"
    >
      <span className="inline-flex items-center gap-1.5 text-openai">
        <OpenAiMark className={mark} />
        <span className={`font-black leading-none tracking-tight ${word} ${type}`}>OpenAI</span>
      </span>
      <span className={`font-bangers text-xl leading-none ${tone === "onPaper" ? "text-evergreen" : "text-gold"}`} aria-hidden>
        ×
      </span>
      <span className="inline-flex items-center gap-1.5 text-leaf">
        <MongoLeaf className={leaf} />
        <span className={`font-black leading-none tracking-tight ${word} ${type}`}>MongoDB</span>
      </span>
    </div>
  );
}

export function VenueChip({ className = "" }: { className?: string }) {
  return (
    <span className={`venue-chip ${className}`}>
      {EVENT.venue} · {EVENT.dateLabel}
    </span>
  );
}

export function CollabStamp({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      <OpenAiMark className="h-4 w-4 text-openai" />
      <MongoLeaf className="h-5 w-3 text-leaf" />
    </span>
  );
}
