"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EVENT } from "@/lib/types";

type LogoTone = "onInk" | "onPaper";

function markVariant(tone: LogoTone): { openai: string; mongo: string } {
  return tone === "onPaper"
    ? { openai: "/logos/openai-mark-black.svg", mongo: "/logos/mongodb-mark-black.svg" }
    : { openai: "/logos/openai-mark-white.svg", mongo: "/logos/mongodb-mark-green.svg" };
}

const LOGO_SIZES = {
  sm: { mark: "h-6 w-6", leaf: "h-7 w-4", word: "text-sm", x: "text-xl" },
  md: { mark: "h-8 w-8", leaf: "h-9 w-5", word: "text-lg", x: "text-2xl" },
  lg: { mark: "h-10 w-10", leaf: "h-11 w-7", word: "text-2xl", x: "text-3xl" },
} as const;

/** Official OpenAI blossom mark (SVG asset). */
export function OpenAiMark({ className = "h-7 w-7", tone = "onInk" }: { className?: string; tone?: LogoTone }) {
  const src = tone === "onPaper" ? "/logos/openai-mark-black.svg" : "/logos/openai-mark-white.svg";
  return <img src={src} alt="" className={className} aria-hidden />;
}

/** Official MongoDB leaf mark (SVG asset). */
export function MongoLeaf({ className = "h-8 w-5", tone = "onInk" }: { className?: string; tone?: LogoTone }) {
  const src = tone === "onPaper" ? "/logos/mongodb-mark-black.svg" : "/logos/mongodb-mark-green.svg";
  return <img src={src} alt="" className={className} aria-hidden />;
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
  animate = false,
}: {
  size?: "sm" | "md" | "lg";
  stacked?: boolean;
  tone?: LogoTone;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const marks = markVariant(tone);
  const s = LOGO_SIZES[size];
  const word = tone === "onPaper" ? "text-ink" : "text-paper";

  const content = (
    <div
      className={`brand-lockup flex items-center gap-2 ${stacked ? "flex-col sm:flex-row" : ""}`}
      role="group"
      aria-label="OpenAI times MongoDB"
    >
      <span className="inline-flex items-center gap-1.5">
        <img src={marks.openai} alt="" className={`brand-lockup__mark ${s.mark}`} aria-hidden />
        <span className={`brand-lockup__word font-black leading-none tracking-tight ${word} ${s.word}`}>OpenAI</span>
      </span>
      <span
        className={`brand-lockup__x font-bangers leading-none ${tone === "onPaper" ? "text-evergreen" : "text-gold"} ${s.x}`}
        aria-hidden
      >
        ×
      </span>
      <span className="inline-flex items-center gap-1.5">
        <img src={marks.mongo} alt="" className={`brand-lockup__mark ${s.leaf}`} aria-hidden />
        <span className={`brand-lockup__word font-black leading-none tracking-tight ${word} ${s.word}`}>MongoDB</span>
      </span>
    </div>
  );

  if (!animate || reduce) return content;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
      {content}
    </motion.div>
  );
}

export function BattleTitle({
  size = "hero",
  className = "",
  animate = true,
}: {
  size?: "hero" | "lg" | "md" | "sm";
  className?: string;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const sizes = {
    hero: "text-6xl sm:text-8xl lg:text-9xl",
    lg: "text-5xl sm:text-7xl",
    md: "text-4xl sm:text-5xl",
    sm: "text-2xl sm:text-3xl",
  };

  const title = (
    <h1
      className={`font-bangers chromatic title-slam leading-[0.88] tracking-wide ${sizes[size]} ${className}`}
      aria-label={EVENT.name}
    >
      <span className="block">BATTLE OF</span>
      <span className="block text-gold title-slam-accent">THE PADDLES</span>
    </h1>
  );

  if (!animate || reduce) return title;
  return (
    <motion.div
      initial={{ scale: 2.4, rotate: -8, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.2 }}
    >
      {title}
    </motion.div>
  );
}

export function HubHero() {
  const reduce = useReducedMotion();
  return (
    <section className="hero-banner relative overflow-hidden comic-chrome bg-ink p-5 sm:p-8">
      <div className="halftone-drift pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative z-10">
        <BrandLockup size="lg" animate={!reduce} />
        <div className="mt-4">
          <BattleTitle size="hero" animate={!reduce} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <VenueChip />
          <span className="font-cond text-sm uppercase tracking-widest text-paper/70">OpenAI × MongoDB</span>
        </div>
      </div>
    </section>
  );
}

export function VenueChip({ className = "", pulse = false }: { className?: string; pulse?: boolean }) {
  return (
    <span className={`venue-chip ${pulse ? "venue-pulse" : ""} ${className}`}>
      {EVENT.venue} · Sep 9
    </span>
  );
}

export function CollabStamp({ className = "", tone = "onInk" }: { className?: string; tone?: LogoTone }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-hidden>
      <OpenAiMark className="h-5 w-5" tone={tone} />
      <MongoLeaf className="h-6 w-4" tone={tone} />
    </span>
  );
}
