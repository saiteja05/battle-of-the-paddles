"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BracketView } from "@/components/BracketView";
import { VenueChip } from "@/components/Brand";
import type { BoardId } from "@/lib/types";

export default function BoardPage() {
  const params = useParams<{ boardId: string }>();
  const raw = String(params.boardId || "a").toUpperCase();
  const boardId: BoardId = raw === "B" ? "B" : "A";
  const boardB = boardId === "B";
  return (
    <AppShell>
      <div className={boardB ? "universe-b" : "universe-a"}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="slam-caption">{boardB ? "Right board" : "Left board"}</p>
          <VenueChip />
        </div>
        <h1 className="mt-2 font-bangers chromatic text-5xl">Board {boardId}</h1>
        <p className="mt-2 max-w-3xl font-cond text-lg">
          Bracket {boardId} · 64-slot tree. Same comic chrome as Board {boardB ? "A" : "B"}, different palette.{" "}
          Slot numbers match the paper sheets (example <span className="font-black">{boardId}-R64-07</span>). Only real
          first-round matches are shown — unused 64-holes stay hidden. Tap a name once for the gold confirm glow, tap
          again to commit. Undo cascades.
        </p>
        <div className="mt-6">
          <BracketView boardId={boardId} />
        </div>
      </div>
    </AppShell>
  );
}
