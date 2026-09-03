import type { Player, Skill } from "./types";

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function playerIdFromName(name: string): string {
  const n = normalizeName(name).replace(/\s+/g, "-");
  return n ? `p-${n}` : "p-unknown";
}

export function parseSkill(raw: string | undefined | null): Skill {
  const s = (raw || "").toLowerCase();
  if (s.includes("advanced")) return "advanced";
  if (s.includes("intermediate")) return "intermediate";
  if (s.includes("beginner")) return "beginner";
  return "unranked";
}

export function skillRank(skill: Skill): number {
  if (skill === "advanced") return 0;
  if (skill === "intermediate") return 1;
  return 2;
}

export function skillLabel(skill: Skill): string {
  if (skill === "advanced") return "Advanced";
  if (skill === "intermediate") return "Intermediate";
  if (skill === "beginner") return "Beginner";
  return "Unranked";
}

export function parseCsv(text: string): Record<string, string>[] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim().length > 0)) rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((x) => x.trim().length > 0)) rows.push(row);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => {
      o[h] = (r[i] ?? "").trim();
    });
    return o;
  });
}

function keysOf(row: Record<string, string>): string[] {
  return Object.keys(row);
}

function col(row: Record<string, string>, pred: (h: string) => boolean): string {
  const k = keysOf(row).find((h) => pred(h.trim().toLowerCase()));
  return k ? (row[k] ?? "").trim() : "";
}

function isYes(v: string): boolean {
  const s = v.trim().toLowerCase();
  if (!s) return false;
  if (s === "yes" || s === "y" || s === "true" || s === "1") return true;
  if (s.startsWith("yes")) return true;
  return false;
}

function isLumaExport(row: Record<string, string>): boolean {
  const headers = keysOf(row).map((h) => h.trim().toLowerCase());
  return headers.some((h) => h.includes("touranment") || h.includes("approval_status") || h.includes("guest_id"));
}

export interface ParseResult {
  players: Player[];
  declinedSkipped: Player[];
  duplicatesMerged: { name: string; count: number }[];
  rows: number;
  notCompeting: number;
  competingApproved: number;
}

export function importPlayersFromCsv(text: string): ParseResult {
  const records = parseCsv(text);
  const declinedSkipped: Player[] = [];
  const mergedMap = new Map<string, Player>();
  const mergeCounts = new Map<string, number>();
  let notCompeting = 0;
  let competingApproved = 0;

  for (const row of records) {
    const name =
      col(row, (h) => h === "name") ||
      [col(row, (h) => h === "first_name"), col(row, (h) => h === "last_name")].filter(Boolean).join(" ").trim();
    if (!name) continue;

    const approval = col(row, (h) => h === "approval_status").toLowerCase();
    const luma = isLumaExport(row) || Boolean(approval);

    const tournamentCol = col(
      row,
      (h) => h.includes("touranment") || (h.includes("tournament") && (h.includes("yes") || h.includes("no"))),
    );
    const competingCol = col(row, (h) => h === "competing" || h.startsWith("planning on joining"));
    const competingRaw = tournamentCol || competingCol;
    const wantsToCompete = isYes(competingRaw);

    const skill = parseSkill(
      col(row, (h) => h.includes("skill")) || col(row, (h) => h === "skill"),
    );

    const player: Player = {
      id: playerIdFromName(name),
      name,
      firstName: col(row, (h) => h === "first_name"),
      lastName: col(row, (h) => h === "last_name"),
      company: col(row, (h) => h === "company"),
      jobTitle: col(row, (h) => h === "job title" || h === "job_title"),
      skill,
      competing: false,
      checkedIn: false,
      mergedCount: 1,
      sourceIds: [col(row, (h) => h === "guest_id")].filter(Boolean),
      declined: approval === "declined",
    };

    if (player.declined) {
      declinedSkipped.push(player);
      continue;
    }

    if (luma) {
      player.competing = wantsToCompete && approval === "approved";
    } else {
      player.competing = wantsToCompete;
    }

    if (!player.competing) {
      notCompeting += 1;
    } else {
      competingApproved += 1;
    }

    const key = normalizeName(name);
    const existing = mergedMap.get(key);
    if (existing) {
      existing.mergedCount += 1;
      existing.sourceIds.push(...player.sourceIds);
      if (skillRank(player.skill) < skillRank(existing.skill)) existing.skill = player.skill;
      if (!existing.company) existing.company = player.company;
      if (!existing.jobTitle) existing.jobTitle = player.jobTitle;
      if (player.competing) existing.competing = true;
      mergeCounts.set(key, existing.mergedCount);
    } else {
      mergedMap.set(key, player);
    }
  }

  const players = [...mergedMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const duplicatesMerged = [...mergeCounts.entries()].map(([name, count]) => ({
    name: mergedMap.get(name)!.name,
    count,
  }));

  return {
    players,
    declinedSkipped,
    duplicatesMerged,
    rows: records.length,
    notCompeting,
    competingApproved,
  };
}

export function competitorsOf(players: Player[]): Player[] {
  return players.filter((p) => p.competing && !p.declined);
}
