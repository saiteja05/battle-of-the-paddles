"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EVENT } from "@/lib/types";
import { useEvent } from "@/components/Providers";
import { competitorsOf } from "@/lib/csv";

const TILES = [
  { href: "/setup", title: "Setup", copy: "Import, check-in, freeze & generate", hue: "bg-crimson text-paper" },
  { href: "/board/a", title: "Board A", copy: "64-slot visual bracket", hue: "bg-gold text-ink" },
  { href: "/board/b", title: "Board B", copy: "64-slot visual bracket", hue: "bg-cyanx text-ink" },
  { href: "/now", title: "Now Playing", copy: "Ready + called tables", hue: "bg-mag text-paper" },
  { href: "/finals", title: "Finals", copy: "3rd place, grand final, podium", hue: "bg-paper text-ink" },
  { href: "/tv", title: "TV Mode", copy: "Read-only display · no emails", hue: "bg-crimson text-gold" },
];

export default function HubPage() {
  const { event } = useEvent();
  const comps = competitorsOf(event.players);
  const inCount = comps.filter((p) => p.checkedIn).length;
  return (
    <AppShell>
      <p className="slam-caption">OpenAI × MongoDB</p>
      <h1 className="mt-3 font-bangers chromatic text-6xl leading-[0.9] sm:text-8xl">{EVENT.name}</h1>
      <p className="mt-4 max-w-2xl font-cond text-xl">
        {EVENT.dateLabel} · {EVENT.venue}. 1st {EVENT.prizes.first} · 2nd {EVENT.prizes.second} · 3rd {EVENT.prizes.third}.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 font-black">
        <span className="panel px-3 py-2">{comps.length} competitors</span>
        <span className="panel px-3 py-2">{inCount} checked in</span>
        <span className="panel px-3 py-2">{event.status}</span>
        <span className="panel px-3 py-2">{event.matches.length} matches</span>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className={`tap panel ${t.hue} min-h-32 p-5`}>
            <h2 className="font-bangers text-4xl">{t.title}</h2>
            <p className="mt-2 font-cond text-lg">{t.copy}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
