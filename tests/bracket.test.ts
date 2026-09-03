import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  applyByeAdvances,
  boardRoundSizes,
  generateBracket,
  makeMatchId,
  matchIsListed,
  playerOnMatch,
  roundSnapshot,
} from "../src/lib/bracket";
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

  it("snake-deals six items even/even so neither board is odd", () => {
    const adv = ["A1", "A2", "A3", "A4", "A5", "A6"];
    const [a, b] = snakeDeal(adv);
    expect(a).toEqual(["A1", "A4", "A5", "A6"]);
    expect(b).toEqual(["A2", "A3"]);
    expect(a.length % 2).toBe(0);
    expect(b.length % 2).toBe(0);
  });

  it("snake-deals 86 into 44/42 (both even)", () => {
    const items = Array.from({ length: 86 }, (_, i) => i);
    const [a, b] = snakeDeal(items);
    expect(a).toHaveLength(44);
    expect(b).toHaveLength(42);
    expect(a.length + b.length).toBe(86);
  });

  it("snake-deals 87 into 43/44 (exactly one odd board)", () => {
    const items = Array.from({ length: 87 }, (_, i) => i);
    const [a, b] = snakeDeal(items);
    expect([a.length, b.length].sort((x, y) => x - y)).toEqual([43, 44]);
    expect((a.length % 2) + (b.length % 2)).toBe(1);
  });
});

describe("boardRoundSizes", () => {
  it("sizes first round to ceil(N/2)", () => {
    expect(boardRoundSizes(44)).toEqual([22, 11, 6, 3, 2, 1]);
    expect(boardRoundSizes(42)).toEqual([21, 11, 6, 3, 2, 1]);
    expect(boardRoundSizes(43)).toEqual([22, 11, 6, 3, 2, 1]);
    expect(boardRoundSizes(8)).toEqual([4, 2, 1]);
  });
});

function extraPlayer(i: number): Player {
  return {
    id: `extra-${i}`,
    name: `Extra ${i}`,
    firstName: "Extra",
    lastName: String(i),
    company: "",
    jobTitle: "",
    skill: "beginner",
    competing: true,
    checkedIn: true,
    mergedCount: 1,
    sourceIds: [],
    declined: false,
  };
}

describe("bracket generate around N=86", () => {
  const players = loadCompetitors();

  it("has ~86 unique approved competitors", () => {
    expect(players.length).toBe(86);
  });

  it("splits 44/42, pairs everyone 1v1, and leaves later rounds empty", () => {
    const { matches, boardA, boardB } = generateBracket(players, {
      mode: "seeded",
      rng: mulberry32(20260909),
      seedSalt: 20260909,
    });
    expect(boardA).toHaveLength(44);
    expect(boardB).toHaveLength(42);

    const advA = boardA.filter((p) => p.skill === "advanced").length;
    const advB = boardB.filter((p) => p.skill === "advanced").length;
    expect(advA).toBe(3);
    expect(advB).toBe(3);

    const r64 = matches.filter((m) => m.round === "R64");
    const byes = r64.filter((m) => m.isBye);
    const real = r64.filter((m) => !m.isBye && m.player1Id && m.player2Id);
    expect(r64.filter((m) => m.boardId === "A")).toHaveLength(22);
    expect(r64.filter((m) => m.boardId === "B")).toHaveLength(21);
    expect(r64).toHaveLength(43);
    expect(byes).toHaveLength(0);
    expect(real).toHaveLength(43);
    const vacantOpponents = r64.filter((m) => Boolean(m.player1Id) !== Boolean(m.player2Id));
    expect(vacantOpponents).toHaveLength(0);
    expect(r64.every((m) => !m.winnerId)).toBe(true);
    expect(r64.every((m) => Boolean(m.player1Id && m.player2Id))).toBe(true);
    expect(r64.filter((m) => !matchIsListed(m))).toHaveLength(0);

    for (const id of players.map((p) => p.id)) {
      const home = r64.find((m) => playerOnMatch(m, id));
      expect(home).toBeTruthy();
      expect(home!.player1Id && home!.player2Id).toBeTruthy();
      expect(home!.isBye).toBe(false);
    }

    for (const board of ["A", "B"] as const) {
      for (const round of ["R32", "R16", "R8", "R4", "R2"] as const) {
        const later = matches.filter((m) => m.boardId === board && m.round === round);
        const names = later.flatMap((m) => [m.player1Id, m.player2Id]).filter(Boolean);
        expect(names).toHaveLength(0);
        expect(later.every((m) => !m.winnerId && !m.isBye)).toBe(true);
      }
    }

    expect(matches.filter((m) => m.boardId === "FINALS")).toHaveLength(2);
    expect(matches.some((m) => m.id === "FINALS-GF-01")).toBe(true);
    expect(matches.some((m) => m.id === "FINALS-3RD-01")).toBe(true);
    const finals = matches.filter((m) => m.boardId === "FINALS");
    expect(finals.every((m) => !m.player1Id && !m.player2Id && !m.winnerId)).toBe(true);

    const snap = roundSnapshot(matches);
    expect(snap.R64.namedSlots).toBe(86);
    expect(snap.R64.matches).toBe(43);
    expect(snap.R64.winners).toBe(0);
    expect(snap.R64.pendingByes).toBe(0);
    expect(snap.R32.namedSlots).toBe(0);
    expect(snap.R16.namedSlots).toBe(0);
    expect(snap.R8.namedSlots).toBe(0);
    expect(snap.R4.namedSlots).toBe(0);
    expect(snap.R2.namedSlots).toBe(0);
    expect(snap.GF.namedSlots).toBe(0);
    expect(snap["3RD"].namedSlots).toBe(0);
  });

  it("puts seed 1 in a real first-round match, not a bye", () => {
    const { matches, boardA } = generateBracket(players, {
      mode: "seeded",
      rng: mulberry32(1),
      seedSalt: 1,
    });
    const m = matches.find((x) => x.id === makeMatchId("A", "R64", 1))!;
    expect(m.player1Id).toBe(boardA[0].id);
    expect(m.player2Id).toBe(boardA[boardA.length - 1].id);
    expect(m.isBye).toBe(false);
    expect(m.winnerId).toBeNull();
    const next = matches.find((x) => x.id === m.nextMatchId);
    expect(next?.player1Id).toBeNull();
    expect(next?.player2Id).toBeNull();
    expect(next?.winnerId).toBeNull();
  });
});

describe("bracket generate around N=87", () => {
  it("leaves exactly one bye on the odd board", () => {
    const players = [...loadCompetitors(), extraPlayer(1)];
    expect(players.length).toBe(87);
    const { matches, boardA, boardB } = generateBracket(players, {
      mode: "seeded",
      rng: mulberry32(20260909),
      seedSalt: 20260909,
    });
    expect([boardA.length, boardB.length].sort((a, b) => a - b)).toEqual([43, 44]);
    const r64 = matches.filter((m) => m.round === "R64");
    const byes = r64.filter((m) => m.isBye);
    const real = r64.filter((m) => m.player1Id && m.player2Id);
    expect(byes).toHaveLength(1);
    expect(real).toHaveLength(43);
    expect(r64).toHaveLength(44);
    expect(roundSnapshot(matches).R64.pendingByes).toBe(1);
    expect(roundSnapshot(matches).R64.namedSlots).toBe(87);

    const oddBoard = boardA.length % 2 === 1 ? boardA : boardB;
    const bye = byes[0];
    expect(bye.boardId).toBe(oddBoard === boardA ? "A" : "B");
    expect(bye.player1Id).toBe(oddBoard[0].id);
    expect(bye.player2Id).toBeNull();
    expect(bye.winnerId).toBeNull();
    const next = matches.find((x) => x.id === bye.nextMatchId);
    expect(next?.player1Id).toBeNull();
    expect(next?.player2Id).toBeNull();
  });
});

describe("markByeMatches", () => {
  it("does not auto-win or fill later rounds for an even field", () => {
    const { matches } = generateBracket(loadCompetitors(), {
      mode: "seeded",
      rng: mulberry32(9),
      seedSalt: 9,
    });
    const real = matches.filter((m) => m.player1Id && m.player2Id && m.round === "R64");
    expect(real.length).toBe(43);
    expect(matches.filter((m) => m.round === "R64" && m.isBye)).toHaveLength(0);
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
