"use client";

import { matchIsListed } from "@/lib/bracket";
import { BOARD_ROUNDS, ROUND_LABEL, type BoardId, type RoundId } from "@/lib/types";
import { useEvent } from "./Providers";
import { MatchCard } from "./MatchCard";

export function BracketView({ boardId }: { boardId: BoardId }) {
  const { event } = useEvent();
  const rounds: RoundId[] = boardId === "FINALS" ? ["3RD", "GF"] : BOARD_ROUNDS;
  return (
    <div className="flex gap-3 overflow-x-auto pb-8">
      {rounds.map((round) => {
        const listed = event.matches
          .filter((m) => m.boardId === boardId && m.round === round && matchIsListed(m))
          .sort((a, b) => a.slot - b.slot);
        if (listed.length === 0) return null;
        return (
          <section key={round} className="flex min-w-[260px] flex-col gap-3">
            <h2 className="sticky top-14 z-10 slam-caption text-center">{ROUND_LABEL[round]}</h2>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {listed.map((m) => (
                <MatchCard key={m.id} match={m} showCall />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
