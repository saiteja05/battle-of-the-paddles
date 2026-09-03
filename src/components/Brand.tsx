"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EVENT } from "@/lib/types";

type LogoTone = "onInk" | "onPaper";

const OPENAI_LOGO = "/logos/openai.png";
const MONGODB_LOGO = "/logos/mongodb.png";

const LOGO_SIZES = {
  sm: { logo: "h-7 sm:h-8", x: "text-xl" },
  md: { logo: "h-9", x: "text-2xl" },
  lg: { logo: "h-10 sm:h-12", x: "text-3xl" },
} as const;

function toneClass(tone: LogoTone) {
  return tone === "onInk" ? "brand-lockup--onInk" : "brand-lockup--onPaper";
}

/** Official OpenAI wordmark lockup (PNG). */
export function OpenAiMark({ className = "h-7", tone = "onInk" }: { className?: string; tone?: LogoTone }) {
  return (
    <span className={`brand-lockup inline-flex items-center ${toneClass(tone)}`}>
      <img
        src={OPENAI_LOGO}
        alt=""
        className={`brand-lockup__logo brand-lockup__logo--openai w-auto object-contain ${className}`}
        aria-hidden
      />
    </span>
  );
}

/** Official MongoDB wordmark lockup (PNG). */
export function MongoLeaf({ className = "h-7", tone = "onInk" }: { className?: string; tone?: LogoTone }) {
  return (
    <span className={`brand-lockup inline-flex items-center ${toneClass(tone)}`}>
      <img
        src={MONGODB_LOGO}
        alt=""
        className={`brand-lockup__logo brand-lockup__logo--mongodb w-auto object-contain ${className}`}
        aria-hidden
      />
    </span>
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
  animate = false,
}: {
  size?: "sm" | "md" | "lg";
  stacked?: boolean;
  tone?: LogoTone;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const s = LOGO_SIZES[size];

  const content = (
    <div
      className={`brand-lockup flex items-center gap-2 ${toneClass(tone)} ${stacked ? "flex-col sm:flex-row" : ""}`}
      role="group"
      aria-label="OpenAI times MongoDB"
    >
      <img
        src={OPENAI_LOGO}
        alt="OpenAI"
        className={`brand-lockup__logo brand-lockup__logo--openai w-auto object-contain ${s.logo}`}
      />
      <span
        className={`brand-lockup__x font-bangers leading-none ${tone === "onPaper" ? "text-evergreen" : "text-gold"} ${s.x}`}
        aria-hidden
      >
        ×
      </span>
      <img
        src={MONGODB_LOGO}
        alt="MongoDB"
        className={`brand-lockup__logo brand-lockup__logo--mongodb w-auto object-contain ${s.logo}`}
      />
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
      <OpenAiMark className="h-5" tone={tone} />
      <MongoLeaf className="h-5" tone={tone} />
    </span>
  );
}
