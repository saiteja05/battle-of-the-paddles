import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { applyByeAdvances, generateBracket, makeMatchId, roundSnapshot } from "../src/lib/bracket";
import { competitorsOf, importPlayersFromCsv } from "../src/lib/csv";
import { mulberry32, seedPlacement, snakeDeal } from "../src/lib/seed";
import type { Player } from "../src/lib/types";

const REAL =
  "/home/ubuntu/.cursor/projects/agent/uploads/9.9.26_OAI_x_Mongo_SPIN_Tournament_Registration_-_Sheet1_05a4.csv";
const FIXTURE = path.join(__dirname, "fixtures/luma-export.redacted.csv");

function loadCompetitors(): Player[] {
  const p = fs.existsSync(REAL) ? REAL : FIXTURE;
  return competitorsOf(importPlayersFromCsv(fs.readFileSync(p, "utf8")).players);
}

describe("seed placement + snake split", () => {
  it("places seed 1 in position 1 and seed 64 opposite in a 64 bracket", () => {
    const order = seedPlacement(64);
    expect(order).toHaveLength(64);
    expect(order[0]).toBe(1);
    expect(order[1]).toBe(64);
    expect(new Set(order).size).toBe(64);
    expect(order[2]).toBe(32);
    expect(order[3]).toBe(33);
  });

  it("snake-deals Advanced 3 and 3 across A/B", () => {
    const adv = ["A1", "A2", "A3", "A4", "A5", "A6"];
    const [a, b] = snakeDeal(adv);
    expect(a).toEqual(["A1", "A4", "A5"]);
    expect(b).toEqual(["A2", "A3", "A6"]);
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(3);
  });

  it("snake-deals 86 into 43/43", () => {
    const items = Array.from({ length: 86 }, (_, i) => i);
    const [a, b] = snakeDeal(items);
    expect(a).toHaveLength(43);
    expect(b).toHaveLength(43);
  });
});

describe("bracket generate around N=86", () => {
  const players = loadCompetitors();

  it("has ~86 unique approved competitors", () => {
    expect(players.length).toBe(86);
  });

  it("splits boards, assigns byes to highest seeds, and leaves R32+ empty", () => {
    const { matches, boardA, boardB } = generateBracket(players, {
      mode: "seeded",
      rng: mulberry32(20260909),
      seedSalt: 20260909,
    });
    expect(boardA).toHaveLength(43);
    expect(boardB).toHaveLength(43);

    const advA = boardA.filter((p) => p.skill === "advanced").length;
    const advB = boardB.filter((p) => p.skill === "advanced").length;
    expect(advA).toBe(3);
    expect(advB).toBe(3);

    for (const board of ["A", "B"] as const) {
      const r64 = matches.filter((m) => m.boardId === board && m.round === "R64");
      const byes = r64.filter((m) => m.isBye);
      const real = r64.filter((m) => !m.isBye && m.player1Id && m.player2Id);
      expect(r64).toHaveLength(32);
      expect(byes.length).toBe(21);
      expect(real.length).toBe(11);
      expect(64 - boardA.length).toBe(21);
      expect(r64.every((m) => !m.winnerId)).toBe(true);
      expect(byes.every((m) => Boolean(m.player1Id) !== Boolean(m.player2Id))).toBe(true);

      for (const round of ["R32", "R16", "R8", "R4", "R2"] as const) {
        const later = matches.filter((m) => m.boardId === board && m.round === round);
        const names = later.flatMap((m) => [m.player1Id, m.player2Id]).filter(Boolean);
        expect(names).toHaveLength(0);
        expect(later.every((m) => !m.winnerId && !m.isBye)).toBe(true);
      }

      const seed1Match = matches.find((m) => m.id === makeMatchId(board, "R64", 1));
      expect(seed1Match?.isBye).toBe(true);
      expect(seed1Match?.player1Id).toBeTruthy();
      expect(seed1Match?.player2Id).toBeNull();
      expect(seed1Match?.winnerId).toBeNull();
    }

    expect(matches.filter((m) => m.boardId === "FINALS")).toHaveLength(2);
    expect(matches.some((m) => m.id === "FINALS-GF-01")).toBe(true);
    expect(matches.some((m) => m.id === "FINALS-3RD-01")).toBe(true);
    const finals = matches.filter((m) => m.boardId === "FINALS");
    expect(finals.every((m) => !m.player1Id && !m.player2Id && !m.winnerId)).toBe(true);

    const snap = roundSnapshot(matches);
    expect(snap.R64.namedSlots).toBe(86);
    expect(snap.R64.winners).toBe(0);
    expect(snap.R64.pendingByes).toBe(42);
    expect(snap.R32.namedSlots).toBe(0);
    expect(snap.R16.namedSlots).toBe(0);
    expect(snap.R8.namedSlots).toBe(0);
    expect(snap.R4.namedSlots).toBe(0);
    expect(snap.R2.namedSlots).toBe(0);
    expect(snap.GF.namedSlots).toBe(0);
    expect(snap["3RD"].namedSlots).toBe(0);
  });

  it("gives highest seeds the byes without copying them into R32", () => {
    const { matches, boardA } = generateBracket(players, {
      mode: "seeded",
      rng: mulberry32(1),
      seedSalt: 1,
    });
    const m = matches.find((x) => x.id === "A-R64-01")!;
    expect(m.player1Id).toBe(boardA[0].id);
    expect(m.isBye).toBe(true);
    expect(m.winnerId).toBeNull();
    const next = matches.find((x) => x.id === m.nextMatchId);
    expect(next?.player1Id).toBeNull();
    expect(next?.player2Id).toBeNull();
    expect(next?.winnerId).toBeNull();
  });
});

describe("markByeMatches", () => {
  it("flags R64 byes but does not auto-win or fill later rounds", () => {
    const { matches } = generateBracket(loadCompetitors(), {
      mode: "seeded",
      rng: mulberry32(9),
      seedSalt: 9,
    });
    const real = matches.filter((m) => m.player1Id && m.player2Id && m.round === "R64");
    expect(real.length).toBeGreaterThan(0);
    expect(real.every((m) => !m.winnerId)).toBe(true);
    applyByeAdvances(matches);
    expect(real.every((m) => !m.winnerId)).toBe(true);
    const laterNames = matches
      .filter((m) => m.round !== "R64")
      .flatMap((m) => [m.player1Id, m.player2Id])
      .filter(Boolean);
    expect(laterNames).toHaveLength(0);
  });
});
