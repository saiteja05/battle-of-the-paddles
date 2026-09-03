"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BracketView } from "@/components/BracketView";
import type { BoardId } from "@/lib/types";

export default function BoardPage() {
  const params = useParams<{ boardId: string }>();
  const raw = String(params.boardId || "a").toUpperCase();
  const boardId: BoardId = raw === "B" ? "B" : "A";
  return (
    <AppShell>
      <p className="slam-caption">Physical board twin</p>
      <h1 className="mt-2 font-bangers chromatic text-5xl">Board {boardId}</h1>
      <p className="mt-2 max-w-3xl font-cond text-lg">
        Slot numbers match the paper sheets (example <span className="font-black">A-R64-07</span>). Tap a name once for
        the gold confirm glow, tap again to commit. Undo cascades.
      </p>
      <div className="mt-6">
        <BracketView boardId={boardId} />
      </div>
    </AppShell>
  );
}
