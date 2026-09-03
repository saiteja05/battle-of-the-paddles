"use client";

import { AppShell } from "@/components/AppShell";
import { BattleTitle, VenueChip } from "@/components/Brand";
import { MatchCard } from "@/components/MatchCard";
import { useEvent } from "@/components/Providers";
import { matchReady } from "@/lib/bracket";
import { quoteById } from "@/lib/quotes";

export default function NowPage() {
  const { event } = useEvent();
  const live = event.matches.filter((m) => !m.isBye && (m.round === "R64" || m.round === "R32" || m.round === "R16" || m.round === "R8" || m.round === "R4" || m.round === "R2" || m.round === "GF" || m.round === "3RD"));
  const called = live.filter((m) => m.calledAt && !m.winnerId);
  const ready = live.filter((m) => matchReady(m) && !m.calledAt);
  return (
    <AppShell>
      <p className="slam-caption">Call the table</p>
      <div className="mt-2">
        <VenueChip />
      </div>
      <div className="mt-2">
        <BattleTitle size="md" />
      </div>
      <h1 className="mt-2 font-bangers chromatic text-4xl now-playing-pulse">Now Playing</h1>
      <section className="mt-6">
        <h2 className="font-black text-2xl text-openai">Called ({called.length})</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {called.map((m) => (
            <div key={m.id}>
              <MatchCard match={m} large showCall />
              <p className="mt-2 font-cond italic opacity-80">“{quoteById(m.quoteId).text}”</p>
            </div>
          ))}
          {called.length === 0 ? <p className="font-cond">No tables called yet.</p> : null}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-black text-2xl text-leaf">Ready ({ready.length})</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ready.map((m) => (
            <MatchCard key={m.id} match={m} large showCall />
          ))}
          {ready.length === 0 ? <p className="font-cond">No ready matches. Check-in and generate, or wait for winners.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
