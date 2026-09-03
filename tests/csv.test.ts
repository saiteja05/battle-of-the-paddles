import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { competitorsOf, importPlayersFromCsv, normalizeName, parseCsv, parseSkill } from "../src/lib/csv";

const REAL =
  "/home/ubuntu/.cursor/projects/agent/uploads/9.9.26_OAI_x_Mongo_SPIN_Tournament_Registration_-_Sheet1_05a4.csv";
const FIXTURE = path.join(__dirname, "fixtures/luma-export.redacted.csv");
const SAMPLE = path.join(__dirname, "../public/sample-players.csv");

function lumaPath() {
  return fs.existsSync(REAL) ? REAL : FIXTURE;
}

describe("csv parse — Luma columns", () => {
  it("reads the Touranment typo header and skill column", () => {
    const text = fs.readFileSync(lumaPath(), "utf8");
    const rows = parseCsv(text);
    expect(rows.length).toBeGreaterThan(80);
    const headers = Object.keys(rows[0]);
    expect(headers.some((h) => h.toLowerCase().includes("touranment"))).toBe(true);
    expect(headers.some((h) => h.toLowerCase().includes("skill"))).toBe(true);
    expect(headers).toContain("approval_status");
    expect(headers).toContain("name");
  });

  it("skips declined guests Nathan Dalal and Sebastian Ingino", () => {
    const parsed = importPlayersFromCsv(fs.readFileSync(lumaPath(), "utf8"));
    expect(parsed.declinedSkipped.map((p) => p.name).sort()).toEqual(["Nathan Dalal", "Sebastian Ingino"]);
    const names = parsed.players.map((p) => p.name);
    expect(names).not.toContain("Nathan Dalal");
    expect(names).not.toContain("Sebastian Ingino");
  });

  it("merges duplicate people by normalized name", () => {
    const parsed = importPlayersFromCsv(fs.readFileSync(lumaPath(), "utf8"));
    const dups = parsed.duplicatesMerged.map((d) => d.name).sort();
    expect(dups).toEqual(["Aydan Pirani", "Joseph Miano", "Uzair Ahmad"]);
    for (const name of dups) {
      const hits = parsed.players.filter((p) => normalizeName(p.name) === normalizeName(name));
      expect(hits).toHaveLength(1);
      expect(hits[0].mergedCount).toBe(2);
    }
  });

  it("keeps only Touranment Yes + approved as competing, N around 86", () => {
    const parsed = importPlayersFromCsv(fs.readFileSync(lumaPath(), "utf8"));
    const comps = competitorsOf(parsed.players);
    expect(comps.length).toBeGreaterThanOrEqual(84);
    expect(comps.length).toBeLessThanOrEqual(88);
    expect(comps.length).toBe(86);
    expect(parsed.declinedSkipped).toHaveLength(2);
    expect(parsed.duplicatesMerged).toHaveLength(3);
  });

  it("parses the six Advanced competitors", () => {
    const parsed = importPlayersFromCsv(fs.readFileSync(lumaPath(), "utf8"));
    const adv = competitorsOf(parsed.players)
      .filter((p) => p.skill === "advanced")
      .map((p) => p.name)
      .sort();
    expect(adv).toEqual(["Ben Xu", "Cheuk Hei Chu", "Cyrus Daruwala", "Hanyu Song", "Sapto Banerjee", "Zhenpei Yang"]);
  });

  it("does not persist emails on player records", () => {
    const parsed = importPlayersFromCsv(fs.readFileSync(lumaPath(), "utf8"));
    const blob = JSON.stringify(parsed.players);
    expect(blob).not.toMatch(/@openai\.com/);
    expect(blob).not.toMatch(/@mongodb\.com/);
    expect(parsed.players[0]).not.toHaveProperty("email");
  });

  it("parses skill bands from Luma wording", () => {
    expect(parseSkill("Advanced (Competitive / Tournament experience)")).toBe("advanced");
    expect(parseSkill("Intermediate (Play regularly)")).toBe("intermediate");
    expect(parseSkill("Beginner (Just learning or playing for fun)")).toBe("beginner");
    expect(parseSkill("")).toBe("unranked");
  });

  it("accepts the sanitized sample-players.csv", () => {
    const parsed = importPlayersFromCsv(fs.readFileSync(SAMPLE, "utf8"));
    expect(parsed.players.length).toBeGreaterThan(80);
    expect(competitorsOf(parsed.players).length).toBeGreaterThan(80);
  });
});
