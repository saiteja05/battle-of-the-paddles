"use client";

import { useState } from "react";
import type { Match, Player } from "@/lib/types";
import { playerMap, playerName, playerSub } from "@/lib/display";
import { useEvent } from "./Providers";

export function MatchCard({
  match,
  large = false,
  showCall = false,
}: {
  match: Match;
  large?: boolean;
  showCall?: boolean;
}) {
  const { event, post } = useEvent();
  const players = playerMap(event);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const p1 = match.player1Id ? players.get(match.player1Id) : undefined;
  const p2 = match.player2Id ? players.get(match.player2Id) : undefined;
  const decided = Boolean(match.winnerId);
  const ready = Boolean(match.player1Id && match.player2Id && !match.winnerId && !match.isBye);

  async function commit(winnerId: string) {
    if (pending !== winnerId) {
      setPending(winnerId);
      setErr("");
      return;
    }
    setBusy(true);
    try {
      await post(`/api/matches/${encodeURIComponent(match.id)}/winner`, { winnerId });
      setPending(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    setBusy(true);
    try {
      await post(`/api/matches/${encodeURIComponent(match.id)}/undo`);
      setPending(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function callTable() {
    setBusy(true);
    try {
      await post(`/api/matches/${encodeURIComponent(match.id)}/call`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function slotBtn(player: Player | undefined, id: string | null) {
    const selected = pending && id && pending === id;
    const won = match.winnerId && id && match.winnerId === id;
    return (
      <button
        disabled={!ready || busy || !id}
        onClick={() => id && commit(id)}
        className={`tap w-full px-3 py-3 text-left ${
          won ? "bg-gold text-ink" : selected ? "confirm-glow bg-crimson text-paper" : "bg-paper text-ink"
        } ${large ? "min-h-20 text-xl" : "min-h-14 text-base"}`}
      >
        <div className="font-black leading-tight">{playerName(players, id)}</div>
        <div className="font-cond text-sm opacity-80">{playerSub(player)}</div>
        {selected ? <div className="mt-1 text-xs">Tap again to CONFIRM</div> : null}
      </button>
    );
  }

  return (
    <article className={`panel p-2 ${match.calledAt && !decided ? "ring-4 ring-gold" : ""}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-black text-gold">{match.id}</span>
        {match.isBye ? <span className="slam-caption text-xs">BYE</span> : null}
        {match.calledAt && !decided ? <span className="text-xs font-black text-cyanx">CALLED</span> : null}
      </div>
      <div className="space-y-2">
        {slotBtn(p1, match.player1Id)}
        <div className="text-center font-bangers text-lg text-mag">VS</div>
        {slotBtn(p2, match.player2Id)}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {showCall && ready ? (
          <button className="tap bg-cyanx px-3 text-ink text-xs" disabled={busy} onClick={() => void callTable()}>
            Call to table
          </button>
        ) : null}
        {decided && !match.isBye ? (
          <button className="tap bg-paper px-3 text-ink text-xs" disabled={busy} onClick={() => void undo()}>
            Undo
          </button>
        ) : null}
      </div>
      {err ? <p className="mt-1 text-sm text-gold">{err}</p> : null}
    </article>
  );
}
