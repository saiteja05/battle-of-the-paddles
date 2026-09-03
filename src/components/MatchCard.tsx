"use client";

import { useState } from "react";
import { matchCanSelectWinner, matchReady } from "@/lib/bracket";
import type { Match, Player } from "@/lib/types";
import { byeAdvanceHint, playerMap, playerSub, slotName } from "@/lib/display";
import { MongoLeaf } from "./Brand";
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
  const [flashId, setFlashId] = useState<string | null>(null);

  const p1 = match.player1Id ? players.get(match.player1Id) : undefined;
  const p2 = match.player2Id ? players.get(match.player2Id) : undefined;
  const decided = Boolean(match.winnerId);
  const ready = matchReady(match);
  const canPick = matchCanSelectWinner(match);

  async function commit(winnerId: string) {
    if (pending !== winnerId) {
      setPending(winnerId);
      setErr("");
      return;
    }
    setBusy(true);
    setFlashId(winnerId);
    try {
      await post(`/api/matches/${encodeURIComponent(match.id)}/winner`, { winnerId });
      setPending(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      setFlashId(null);
    } finally {
      setBusy(false);
      setTimeout(() => setFlashId(null), 400);
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
    if (!id) return null;
    const selected = pending && id && pending === id;
    const won = match.winnerId && id && match.winnerId === id;
    const flashing = flashId === id;
    const label = slotName(players, id);
    return (
      <button
        disabled={!canPick || busy || !id}
        onClick={() => id && commit(id)}
        className={`tap w-full px-3 py-3 text-left ${
          won ? "bg-gold text-ink" : selected ? "confirm-glow bg-crimson text-paper" : "bg-paper text-ink"
        } ${flashing ? "chromatic-flash" : ""} ${large ? "min-h-20 text-xl" : "min-h-14 text-base"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className={`font-black leading-tight ${won ? "slam-title-flash" : ""}`}>{label || "\u00a0"}</div>
            <div className="font-cond text-sm opacity-80">{playerSub(player)}</div>
            {selected ? <div className="mt-1 text-xs">Tap again to CONFIRM</div> : null}
          </div>
          {won ? <MongoLeaf className="leaf-stamp h-6 shrink-0" tone="onPaper" /> : null}
        </div>
      </button>
    );
  }

  return (
    <article className={`panel relative p-2 ${match.calledAt && !decided ? "ring-4 ring-gold now-playing-pulse" : ""}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-black text-gold">{match.id}</span>
        {match.isBye ? (
          <span className="font-cond text-[10px] font-semibold uppercase tracking-[0.14em] text-gold/90">
            {decided ? "Advanced" : "Advances"}
          </span>
        ) : null}
        {match.calledAt && !decided ? (
          <span className="now-playing-pulse text-xs font-black text-openai">CALLED</span>
        ) : null}
      </div>
      <div className="space-y-2">
        {slotBtn(p1, match.player1Id)}
        {match.isBye ? (
          <p className="px-1 font-cond text-xs leading-snug text-paper/70">{byeAdvanceHint(match)}</p>
        ) : (
          <div className="match-vs text-center font-bangers text-lg text-mag">VS</div>
        )}
        {slotBtn(p2, match.player2Id)}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {showCall && ready ? (
          <button className="tap bg-openai px-3 text-ink text-xs" disabled={busy} onClick={() => void callTable()}>
            Call to table
          </button>
        ) : null}
        {decided ? (
          <button className="tap bg-paper px-3 text-ink text-xs" disabled={busy} onClick={() => void undo()}>
            Undo
          </button>
        ) : null}
      </div>
      {err ? <p className="mt-1 text-sm text-gold">{err}</p> : null}
    </article>
  );
}
