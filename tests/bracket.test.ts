import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { applyByeAdvances, generateBracket, makeMatchId } from "../src/lib/bracket";
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

  it("splits boards, assigns byes to highest seeds, and fills R32", () => {
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

      const r32 = matches.filter((m) => m.boardId === board && m.round === "R32");
      const r32Slots = r32.flatMap((m) => [m.player1Id, m.player2Id]);
      expect(r32Slots.filter(Boolean)).toHaveLength(21);
      expect(r32.some((m) => m.player1Id && m.player2Id)).toBe(true);
      expect(r32.every((m) => !m.winnerId || m.isBye)).toBe(true);

      const seed1Match = matches.find((m) => m.id === makeMatchId(board, "R64", 1));
      expect(seed1Match?.isBye).toBe(true);
      expect(seed1Match?.player1Id).toBeTruthy();
      expect(seed1Match?.player2Id).toBeNull();
    }

    expect(matches.filter((m) => m.boardId === "FINALS")).toHaveLength(2);
    expect(matches.some((m) => m.id === "FINALS-GF-01")).toBe(true);
    expect(matches.some((m) => m.id === "FINALS-3RD-01")).toBe(true);
  });

  it("gives highest seeds the byes (seed 1 auto-advances from R64-01)", () => {
    const { matches, boardA } = generateBracket(players, {
      mode: "seeded",
      rng: mulberry32(1),
      seedSalt: 1,
    });
    const m = matches.find((x) => x.id === "A-R64-01")!;
    expect(m.player1Id).toBe(boardA[0].id);
    expect(m.isBye).toBe(true);
    const next = matches.find((x) => x.id === m.nextMatchId);
    expect(next?.player1Id).toBe(boardA[0].id);
  });
});

describe("applyByeAdvances", () => {
  it("does not auto-win a later match that is waiting on a live feeder", () => {
    const { matches } = generateBracket(loadCompetitors(), {
      mode: "seeded",
      rng: mulberry32(9),
      seedSalt: 9,
    });
    const real = matches.filter((m) => m.player1Id && m.player2Id && m.round === "R64");
    expect(real.length).toBeGreaterThan(0);
    const before = real.map((m) => m.winnerId);
    applyByeAdvances(matches);
    expect(real.map((m) => m.winnerId)).toEqual(before);
    const waiting = matches.filter(
      (m) => m.round === "R32" && ((m.player1Id && !m.player2Id) || (m.player2Id && !m.player1Id)),
    );
    expect(waiting.length).toBeGreaterThan(0);
    expect(waiting.every((m) => !m.winnerId)).toBe(true);
  });
});
