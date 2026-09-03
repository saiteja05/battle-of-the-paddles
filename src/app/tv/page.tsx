"use client";

import { OfflineBanner } from "@/components/OfflineBanner";
import { WinnerSlam } from "@/components/WinnerSlam";
import { BrandLockup, BrandStripe, VenueChip } from "@/components/Brand";
import { useEvent } from "@/components/Providers";
import { matchReady } from "@/lib/bracket";
import { celebrateWinnerName, playerMap, playerName } from "@/lib/display";
import { quoteById } from "@/lib/quotes";
import { EVENT } from "@/lib/types";

export default function TvPage() {
  const { event } = useEvent();
  const players = playerMap(event);
  const called = event.matches.filter((m) => m.calledAt && !m.winnerId && !m.isBye);
  const ready = event.matches.filter((m) => matchReady(m)).slice(0, 6);
  const lastWinnerName = celebrateWinnerName(players, event.lastEvent);
  const gf = event.matches.find((m) => m.id === "FINALS-GF-01");

  return (
    <div className="min-h-screen">
      <BrandStripe />
      <div className="p-6">
        <OfflineBanner />
        <WinnerSlam />
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <BrandLockup size="lg" />
            <p className="slam-caption mt-3">Live display</p>
            <h1 className="mt-2 font-bangers chromatic text-7xl leading-none">{EVENT.name}</h1>
            <div className="mt-3">
              <VenueChip />
            </div>
          </div>
          <div className="panel p-4 font-black">
            <div>1st {EVENT.prizes.first}</div>
            <div>2nd {EVENT.prizes.second}</div>
            <div>3rd {EVENT.prizes.third}</div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="panel-oa p-5">
            <h2 className="font-bangers text-4xl text-openai">On table</h2>
            <ul className="mt-4 space-y-4">
              {called.length === 0 ? <li className="font-cond text-2xl">Waiting for a call…</li> : null}
              {called.map((m) => (
                <li key={m.id} className="border-4 border-black bg-paper p-4 text-ink">
                  <div className="font-black text-crimson">{m.id}</div>
                  <div className="font-bangers text-4xl">
                    {playerName(players, m.player1Id)} vs {playerName(players, m.player2Id)}
                  </div>
                  <p className="mt-2 font-cond text-xl italic">“{quoteById(m.quoteId).text}”</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel-mongo p-5">
            <h2 className="font-bangers text-4xl text-leaf">Up next</h2>
            <ul className="mt-4 space-y-2 font-cond text-2xl">
              {ready.map((m) => (
                <li key={m.id}>
                  <span className="font-black text-gold">{m.id}</span> {playerName(players, m.player1Id)} vs{" "}
                  {playerName(players, m.player2Id)}
                </li>
              ))}
            </ul>
            {lastWinnerName ? (
              <div className="mt-6 panel-paper p-4">
                <p className="slam-caption">Last point</p>
                <p className="mt-2 font-bangers text-4xl">{lastWinnerName}</p>
                <p className="font-black">{event.lastEvent.matchId}</p>
              </div>
            ) : null}
            {gf?.winnerId ? (
              <div className="mt-6">
                <p className="slam-caption">Champion</p>
                <p className="mt-2 font-bangers chromatic text-6xl">{playerName(players, gf.winnerId)}</p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
