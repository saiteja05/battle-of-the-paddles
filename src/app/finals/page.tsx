"use client";

import { AppShell } from "@/components/AppShell";
import { BrandLockup, CollabStamp, VenueChip } from "@/components/Brand";
import { MatchCard } from "@/components/MatchCard";
import { useEvent } from "@/components/Providers";
import { playerMap, playerName } from "@/lib/display";
import { EVENT } from "@/lib/types";

export default function FinalsPage() {
  const { event } = useEvent();
  const players = playerMap(event);
  const third = event.matches.find((m) => m.id === "FINALS-3RD-01");
  const gf = event.matches.find((m) => m.id === "FINALS-GF-01");
  const first = gf?.winnerId;
  const second = first && gf ? (gf.player1Id === first ? gf.player2Id : gf.player1Id) : null;
  const bronze = third?.winnerId;
  return (
    <AppShell>
      <p className="slam-caption">Play 3rd place first</p>
      <div className="mt-3">
        <BrandLockup />
      </div>
      <div className="mt-2">
        <VenueChip />
      </div>
      <h1 className="mt-2 font-bangers chromatic text-5xl">Finals + Podium</h1>
      <p className="mt-2 font-cond text-lg">
        A champ vs B champ for 1st/2nd. A runner-up vs B runner-up for the Quest 3. Run 3rd place while the finalists
        breathe, then slam the Grand Final.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {third ? <MatchCard match={third} large showCall /> : <p>Generate a bracket first.</p>}
        {gf ? <MatchCard match={gf} large showCall /> : null}
      </div>
      <section className="mt-10">
        <h2 className="font-black text-3xl">Podium</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="panel-paper p-4">
            <p className="slam-caption">2nd</p>
            <p className="mt-2 font-bangers text-4xl">{playerName(players, second ?? null)}</p>
            <p className="font-black">{EVENT.prizes.second}</p>
          </div>
          <div className="panel-paper p-4 md:-translate-y-4">
            <p className="slam-caption">1st</p>
            <div className="mt-1 flex justify-end">
              <CollabStamp />
            </div>
            <p className="mt-2 font-bangers text-5xl">{playerName(players, first ?? null)}</p>
            <p className="font-black">{EVENT.prizes.first}</p>
          </div>
          <div className="panel-paper p-4">
            <p className="slam-caption">3rd</p>
            <p className="mt-2 font-bangers text-4xl">{playerName(players, bronze ?? null)}</p>
            <p className="font-black">{EVENT.prizes.third}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
