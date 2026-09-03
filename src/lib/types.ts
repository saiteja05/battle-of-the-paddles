export const TOURNAMENT_ID = "battle-of-the-paddles";

export const EVENT = {
  name: "Battle of the Paddles",
  hosts: ["OpenAI", "MongoDB"] as const,
  dateLabel: "Wed Sep 9 2026",
  dateIso: "2026-09-09",
  venue: "SPIN San Francisco",
  prizes: {
    first: "NVIDIA RTX 5080",
    second: "Nintendo Switch 2",
    third: "Meta Quest 3",
  },
};

export type Skill = "advanced" | "intermediate" | "beginner" | "unranked";
export type BoardId = "A" | "B" | "FINALS";
export type RoundId = "R64" | "R32" | "R16" | "R8" | "R4" | "R2" | "GF" | "3RD";
export type PairingMode = "seeded" | "chaos";
export type TournamentStatus = "setup" | "checkin" | "frozen" | "live" | "complete";

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  skill: Skill;
  competing: boolean;
  checkedIn: boolean;
  mergedCount: number;
  sourceIds: string[];
  declined: boolean;
}

export interface Match {
  id: string;
  boardId: BoardId;
  round: RoundId;
  slot: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  isBye: boolean;
  calledAt: string | null;
  quoteId: string;
  nextMatchId: string | null;
  nextSlot: 1 | 2 | null;
  loserNextMatchId: string | null;
  loserNextSlot: 1 | 2 | null;
}

export interface LastEvent {
  type: string;
  at: string;
  matchId?: string;
  winnerId?: string;
  playerId?: string;
  quoteId?: string;
  detail?: string;
}

export interface Tournament {
  _id: typeof TOURNAMENT_ID;
  name: string;
  hosts: string[];
  eventDate: string;
  venue: string;
  prizes: { first: string; second: string; third: string };
  status: TournamentStatus;
  pairingMode: PairingMode;
  players: Player[];
  matches: Match[];
  revision: number;
  lastEvent: LastEvent;
  frozenAt: string | null;
  seedSalt: number;
  importStats: ImportStats | null;
}

export interface ImportStats {
  rows: number;
  competingApproved: number;
  uniqueCompetitors: number;
  declinedSkipped: number;
  duplicatesMerged: number;
  notCompeting: number;
}

export const BOARD_ROUNDS: RoundId[] = ["R64", "R32", "R16", "R8", "R4", "R2"];

export const MATCHES_PER_ROUND: Record<string, number> = {
  R64: 32,
  R32: 16,
  R16: 8,
  R8: 4,
  R4: 2,
  R2: 1,
  GF: 1,
  "3RD": 1,
};

export const NEXT_ROUND: Record<string, RoundId> = {
  R64: "R32",
  R32: "R16",
  R16: "R8",
  R8: "R4",
  R4: "R2",
};

export const ROUND_LABEL: Record<RoundId, string> = {
  R64: "Round of 64",
  R32: "Round of 32",
  R16: "Sweet 16",
  R8: "Quarterfinals",
  R4: "Semifinals",
  R2: "Board Final",
  GF: "Grand Final",
  "3RD": "3rd Place",
};
