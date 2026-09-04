import { describe, expect, it } from "vitest";
import {
  byeAdvanceHint,
  celebrateWinnerName,
  nextRoundLabel,
  playerSub,
  slotName,
  vacantOpponentLabel,
} from "../src/lib/display";
import type { Match, Player } from "../src/lib/types";

function match(partial: Partial<Match> = {}): Match {
  return {
    id: "A-R64-01",
    boardId: "A",
    round: "R64",
    slot: 1,
    player1Id: "p-1",
    player2Id: null,
    winnerId: null,
    isBye: true,
    calledAt: null,
    quoteId: "q-00",
    nextMatchId: "A-R32-01",
    nextSlot: 1,
    loserNextMatchId: null,
    loserNextSlot: null,
    ...partial,
  };
}

const pat: Player = {
  id: "p-1",
  name: "Pat Player",
  firstName: "Pat",
  lastName: "Player",
  company: "Acme",
  jobTitle: "",
  skill: "beginner",
  competing: true,
  checkedIn: true,
  mergedCount: 1,
  sourceIds: [],
  declined: false,
};

describe("vacant bye copy", () => {
  it("never labels an empty slot as the name BYE", () => {
    const players = new Map<string, Player>([[pat.id, pat]]);
    expect(slotName(players, null)).toBe("");
    expect(slotName(players, "p-1")).toBe("Pat Player");
    expect(vacantOpponentLabel()).toBe("No opponent");
    expect(vacantOpponentLabel()).not.toMatch(/bye/i);
  });

  it("names the actual next round on the vacant plate", () => {
    expect(nextRoundLabel(match({ round: "R64", nextMatchId: "A-R32-01" }))).toBe("Round of 32");
    expect(byeAdvanceHint(match({ round: "R64" }))).toBe("Bye — tap name to send to Round of 32");
    expect(byeAdvanceHint(match({ round: "R32", nextMatchId: "A-R16-01" }))).toBe(
      "Bye — tap name to send to Sweet 16",
    );
    expect(byeAdvanceHint(match({ round: "R2", nextMatchId: "FINALS-GF-01" }))).toBe(
      "Bye — tap name to send to Grand Final",
    );
    expect(byeAdvanceHint(match({ winnerId: "p-1" }))).toBe("Bye — advanced to Round of 32");
  });

  it("does not celebrate a bye advance as a WinnerSlam name", () => {
    expect(celebrateWinnerName([pat], { type: "bye", winnerId: "p-1" })).toBeNull();
    expect(celebrateWinnerName([pat], { type: "winner", winnerId: "p-1" })).toBe("Pat Player");
    expect(celebrateWinnerName([{ ...pat, name: "BYE" }], { type: "winner", winnerId: "p-1" })).toBeNull();
  });
});

describe("playerSub", () => {
  it("shows skill only — not company affiliation", () => {
    expect(playerSub(pat)).toBe("Beginner");
    expect(playerSub({ ...pat, company: "Acme", mergedCount: 2 })).toBe("Beginner · merged×2");
  });
});
