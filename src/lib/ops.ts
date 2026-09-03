import {
  applyWinner,
  createEmptyTournament,
  generateBracket,
  hasRealWinner,
  placeLatePlayer,
  undoWinner,
} from "./bracket";
import { competitorsOf, importPlayersFromCsv } from "./csv";
import { mulberry32 } from "./seed";
import type { Player, Tournament } from "./types";

export function bump(t: Tournament, event: Tournament["lastEvent"]): Tournament {
  t.revision += 1;
  t.lastEvent = event;
  return t;
}

export function applyImport(t: Tournament, csvText: string): Tournament {
  if (hasRealWinner(t.matches)) {
    throw new Error("Cannot re-import after a real match has a winner");
  }
  const parsed = importPlayersFromCsv(csvText);
  const previousCheckins = new Map(t.players.map((p) => [p.id, p.checkedIn]));
  t.players = parsed.players.map((p) => ({
    ...p,
    checkedIn: previousCheckins.get(p.id) ?? false,
  }));
  t.matches = [];
  t.frozenAt = null;
  t.status = "checkin";
  t.importStats = {
    rows: parsed.rows,
    competingApproved: parsed.competingApproved,
    uniqueCompetitors: competitorsOf(parsed.players).length,
    declinedSkipped: parsed.declinedSkipped.length,
    duplicatesMerged: parsed.duplicatesMerged.length,
    notCompeting: parsed.notCompeting,
  };
  return bump(t, {
    type: "import",
    at: new Date().toISOString(),
    detail: `${t.importStats.uniqueCompetitors} unique competitors`,
  });
}

export function applyCheckin(t: Tournament, playerId: string, checkedIn: boolean): Tournament {
  const p = t.players.find((x) => x.id === playerId);
  if (!p) throw new Error("Unknown player");
  p.checkedIn = checkedIn;
  if (t.status === "setup") t.status = "checkin";
  return bump(t, { type: "checkin", at: new Date().toISOString(), playerId, detail: String(checkedIn) });
}

export function eligibleForBracket(t: Tournament, includeUnchecked: boolean): Player[] {
  const pool = competitorsOf(t.players);
  const checked = pool.filter((p) => p.checkedIn);
  if (includeUnchecked) return pool;
  if (checked.length === 0) return pool;
  return checked;
}

export function applyGenerate(
  t: Tournament,
  opts: { mode: "seeded" | "chaos"; includeUnchecked?: boolean; salt?: number },
): Tournament {
  if (hasRealWinner(t.matches)) {
    throw new Error("Re-generate is locked after the first real winner. Undo that match first.");
  }
  const players = eligibleForBracket(t, Boolean(opts.includeUnchecked));
  if (players.length < 2) throw new Error("Need at least 2 competitors to generate a bracket");
  const salt = opts.salt ?? Date.now();
  const { matches } = generateBracket(players, {
    mode: opts.mode,
    rng: mulberry32(salt),
    seedSalt: salt,
  });
  t.matches = matches;
  t.pairingMode = opts.mode;
  t.seedSalt = salt;
  t.frozenAt = new Date().toISOString();
  t.status = "live";
  return bump(t, {
    type: "generate",
    at: t.frozenAt,
    detail: `${opts.mode} · ${players.length} players`,
  });
}

export function applyReset(t: Tournament, keepPlayers: boolean): Tournament {
  const players = keepPlayers ? t.players.map((p) => ({ ...p })) : [];
  const stats = keepPlayers ? t.importStats : null;
  const next = createEmptyTournament();
  next.players = players;
  next.importStats = stats;
  next.status = players.length ? "checkin" : "setup";
  next.revision = t.revision + 1;
  next.lastEvent = { type: "reset", at: new Date().toISOString(), detail: keepPlayers ? "keep players" : "full reset" };
  return next;
}

export function applySetWinner(t: Tournament, matchId: string, winnerId: string): Tournament {
  const match = applyWinner(t.matches, matchId, winnerId);
  const gf = t.matches.find((m) => m.id === "FINALS-GF-01");
  if (gf?.winnerId) t.status = "complete";
  else t.status = "live";
  return bump(t, {
    type: match.isBye ? "bye" : "winner",
    at: new Date().toISOString(),
    matchId,
    winnerId,
    quoteId: match.quoteId,
  });
}

export function applyUndo(t: Tournament, matchId: string): Tournament {
  const match = t.matches.find((m) => m.id === matchId);
  if (!match) throw new Error(`Unknown match ${matchId}`);
  undoWinner(t.matches, matchId);
  if (t.status === "complete") t.status = "live";
  return bump(t, { type: "undo", at: new Date().toISOString(), matchId });
}

export function applyCall(t: Tournament, matchId: string): Tournament {
  const match = t.matches.find((m) => m.id === matchId);
  if (!match) throw new Error(`Unknown match ${matchId}`);
  if (!match.player1Id || !match.player2Id) throw new Error("Match is not ready to call");
  if (match.winnerId) throw new Error("Match already finished");
  match.calledAt = new Date().toISOString();
  return bump(t, {
    type: "call",
    at: match.calledAt,
    matchId,
    quoteId: match.quoteId,
  });
}

export function applyLateCheckin(t: Tournament, playerId: string): Tournament {
  const p = t.players.find((x) => x.id === playerId);
  if (!p) throw new Error("Unknown player");
  p.checkedIn = true;
  p.competing = true;
  if (t.matches.length > 0) {
    const match = placeLatePlayer(t.matches, playerId);
    return bump(t, {
      type: "late",
      at: new Date().toISOString(),
      playerId,
      matchId: match.id,
      detail: `placed into ${match.id}`,
    });
  }
  return applyCheckin(t, playerId, true);
}
