"use client";

import { AppShell } from "@/components/AppShell";
import { HubHero } from "@/components/Brand";
import { HubTile } from "@/components/HubTile";
import { useEvent } from "@/components/Providers";
import { competitorsOf } from "@/lib/csv";
import { EVENT } from "@/lib/types";

const TILES = [
  { href: "/setup", title: "Setup", copy: "Import, check-in, freeze & generate", hue: "bg-crimson text-paper" },
  { href: "/board/a", title: "Board A", copy: "Bracket A · 64-slot tree", hue: "tile-oa bg-oa-black text-openai" },
  { href: "/board/b", title: "Board B", copy: "Bracket B · 64-slot tree", hue: "tile-mongo bg-evergreen text-leaf" },
  { href: "/now", title: "Now Playing", copy: "Ready + called tables", hue: "bg-mag text-paper" },
  { href: "/finals", title: "Finals", copy: "3rd place, grand final, podium", hue: "bg-paper text-ink" },
  { href: "/tv", title: "TV Mode", copy: "Read-only display · no emails", hue: "bg-forest text-leaf" },
];

export default function HubPage() {
  const { event } = useEvent();
  const comps = competitorsOf(event.players);
  const inCount = comps.filter((p) => p.checkedIn).length;
  return (
    <AppShell>
      <HubHero />
      <p className="mt-6 max-w-2xl font-cond text-xl">
        {EVENT.dateLabel} · {EVENT.venue}. 1st {EVENT.prizes.first} · 2nd {EVENT.prizes.second} · 3rd{" "}
        {EVENT.prizes.third}.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 font-black">
        <span className="panel px-3 py-2">{comps.length} competitors</span>
        <span className="panel px-3 py-2">{inCount} checked in</span>
        <span className="panel px-3 py-2">{event.status}</span>
        <span className="panel px-3 py-2">{event.matches.length} matches</span>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t, i) => (
          <HubTile key={t.href} {...t} index={i} />
        ))}
      </div>
    </AppShell>
  );
}
