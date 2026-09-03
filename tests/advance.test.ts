import { describe, expect, it } from "vitest";
import {
  applyWinner,
  generateBracket,
  hasRealWinner,
  placeLatePlayer,
  undoWinner,
} from "../src/lib/bracket";
import { mulberry32 } from "../src/lib/seed";
import type { Player } from "../src/lib/types";

function fakePlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `Player ${i + 1}`,
    firstName: "P",
    lastName: String(i + 1),
    company: "",
    jobTitle: "",
    skill: i < 6 ? "advanced" : i < 20 ? "intermediate" : "beginner",
    competing: true,
    checkedIn: true,
    mergedCount: 1,
    sourceIds: [],
    declined: false,
  }));
}

describe("winner advance + cascade undo", () => {
  it("copies the winner into the child match slot", () => {
    const { matches } = generateBracket(fakePlayers(86), {
      mode: "seeded",
      rng: mulberry32(42),
      seedSalt: 42,
    });
    const real = matches.find((m) => m.round === "R64" && m.player1Id && m.player2Id && !m.winnerId)!;
    const winner = real.player1Id!;
    applyWinner(matches, real.id, winner);
    const child = matches.find((m) => m.id === real.nextMatchId)!;
    if (real.nextSlot === 1) expect(child.player1Id).toBe(winner);
    else expect(child.player2Id).toBe(winner);
    expect(hasRealWinner(matches)).toBe(true);
  });

  it("board final fills Grand Final (winner) and 3rd place (loser)", () => {
    const { matches } = generateBracket(fakePlayers(8), {
      mode: "chaos",
      rng: mulberry32(7),
      seedSalt: 7,
    });
    const boardFinal = matches.find((m) => m.id === "A-R2-01")!;
    boardFinal.player1Id = "p-1";
    boardFinal.player2Id = "p-2";
    boardFinal.winnerId = null;
    boardFinal.isBye = false;
    applyWinner(matches, "A-R2-01", "p-1");
    const gf = matches.find((m) => m.id === "FINALS-GF-01")!;
    const third = matches.find((m) => m.id === "FINALS-3RD-01")!;
    expect(gf.player1Id).toBe("p-1");
    expect(third.player1Id).toBe("p-2");
  });

  it("cascade undo clears descendants and the 3rd-place loser slot", () => {
    const { matches } = generateBracket(fakePlayers(86), {
      mode: "seeded",
      rng: mulberry32(3),
      seedSalt: 3,
    });
    const r64 = matches.filter((m) => m.boardId === "A" && m.round === "R64" && m.player1Id && m.player2Id && !m.winnerId);
    const first = r64[0];
    expect(first).toBeTruthy();
    applyWinner(matches, first.id, first.player1Id!);
    const child = matches.find((m) => m.id === first.nextMatchId)!;
    if (child.player1Id && child.player2Id && !child.winnerId) {
      applyWinner(matches, child.id, first.player1Id!);
    }
    undoWinner(matches, first.id);
    expect(first.winnerId).toBeNull();
    const childAfter = matches.find((m) => m.id === first.nextMatchId)!;
    expect(childAfter.winnerId).toBeNull();
    if (first.nextSlot === 1) expect(childAfter.player1Id).toBeNull();
    else expect(childAfter.player2Id).toBeNull();
  });

  it("late arrival consumes a remaining BYE slot and undoes the auto-advance", () => {
    const { matches } = generateBracket(fakePlayers(40), {
      mode: "seeded",
      rng: mulberry32(11),
      seedSalt: 11,
    });
    const target = [...matches]
      .filter((m) => m.round === "R64" && m.isBye)
      .sort((a, b) => b.slot - a.slot)[0];
    const advanced = target.winnerId;
    const placed = placeLatePlayer(matches, "p-late");
    expect(placed.id).toBe(target.id);
    expect(placed.player1Id && placed.player2Id).toBeTruthy();
    expect(placed.winnerId).toBeNull();
    expect(placed.isBye).toBe(false);
    const child = matches.find((m) => m.id === placed.nextMatchId)!;
    if (placed.nextSlot === 1) expect(child.player1Id).not.toBe(advanced);
    else expect(child.player2Id).not.toBe(advanced);
    expect(child.winnerId).toBeNull();
  });
});
