import type { BoardId, Match, Player, RoundId, Tournament } from "./types";
import { BOARD_ROUNDS, EVENT, MATCHES_PER_ROUND, NEXT_ROUND, TOURNAMENT_ID } from "./types";
import { quoteIdFor } from "./quotes";
import { rankForSeeding, seedPlacement, snakeDeal, type Rng } from "./seed";

export function padSlot(slot: number): string {
  return String(slot).padStart(2, "0");
}

export function makeMatchId(board: BoardId, round: RoundId, slot: number): string {
  return `${board}-${round}-${padSlot(slot)}`;
}

function emptyMatch(partial: {
  boardId: BoardId;
  round: RoundId;
  slot: number;
  nextMatchId: string | null;
  nextSlot: 1 | 2 | null;
  loserNextMatchId?: string | null;
  loserNextSlot?: 1 | 2 | null;
}): Match {
  const id = makeMatchId(partial.boardId, partial.round, partial.slot);
  return {
    id,
    boardId: partial.boardId,
    round: partial.round,
    slot: partial.slot,
    player1Id: null,
    player2Id: null,
    winnerId: null,
    isBye: false,
    calledAt: null,
    quoteId: quoteIdFor(id),
    nextMatchId: partial.nextMatchId,
    nextSlot: partial.nextSlot,
    loserNextMatchId: partial.loserNextMatchId ?? null,
    loserNextSlot: partial.loserNextSlot ?? null,
  };
}

export function createBoardMatches(boardId: "A" | "B"): Match[] {
  const matches: Match[] = [];
  for (const round of BOARD_ROUNDS) {
    const count = MATCHES_PER_ROUND[round];
    for (let slot = 1; slot <= count; slot++) {
      if (round === "R2") {
        matches.push(
          emptyMatch({
            boardId,
            round,
            slot,
            nextMatchId: "FINALS-GF-01",
            nextSlot: boardId === "A" ? 1 : 2,
            loserNextMatchId: "FINALS-3RD-01",
            loserNextSlot: boardId === "A" ? 1 : 2,
          }),
        );
      } else {
        const nextRound = NEXT_ROUND[round];
        matches.push(
          emptyMatch({
            boardId,
            round,
            slot,
            nextMatchId: makeMatchId(boardId, nextRound, Math.ceil(slot / 2)),
            nextSlot: slot % 2 === 1 ? 1 : 2,
          }),
        );
      }
    }
  }
  return matches;
}

export function createFinalsMatches(): Match[] {
  return [
    emptyMatch({
      boardId: "FINALS",
      round: "GF",
      slot: 1,
      nextMatchId: null,
      nextSlot: null,
    }),
    emptyMatch({
      boardId: "FINALS",
      round: "3RD",
      slot: 1,
      nextMatchId: null,
      nextSlot: null,
    }),
  ];
}

export function emptyBracket(): Match[] {
  return [...createBoardMatches("A"), ...createBoardMatches("B"), ...createFinalsMatches()];
}

export function placePlayersOnBoard(matches: Match[], boardId: "A" | "B", ranked: Player[]): void {
  const order = seedPlacement(64);
  const r64 = matches.filter((m) => m.boardId === boardId && m.round === "R64");
  const bySlot = new Map(r64.map((m) => [m.slot, m]));
  for (let pos = 0; pos < 64; pos++) {
    const seed = order[pos];
    const player = ranked[seed - 1];
    const slot = Math.floor(pos / 2) + 1;
    const match = bySlot.get(slot);
    if (!match) continue;
    if (pos % 2 === 0) match.player1Id = player?.id ?? null;
    else match.player2Id = player?.id ?? null;
  }
}

function matchById(matches: Match[], id: string | null): Match | undefined {
  if (!id) return undefined;
  return matches.find((m) => m.id === id);
}

function setSlot(match: Match, slot: 1 | 2, playerId: string | null) {
  if (slot === 1) match.player1Id = playerId;
  else match.player2Id = playerId;
}

function feederFor(matches: Match[], match: Match, slot: 1 | 2): Match | undefined {
  return matches.find((m) => m.nextMatchId === match.id && m.nextSlot === slot);
}

/** True when the empty slot is a vacant seed / empty subtree, not waiting on a live feeder. */
function slotIsVacant(matches: Match[], match: Match, slot: 1 | 2): boolean {
  const feeder = feederFor(matches, match, slot);
  if (!feeder) return true;
  return !feeder.player1Id && !feeder.player2Id && !feeder.winnerId;
}

export function applyByeAdvances(matches: Match[]): void {
  const order: RoundId[] = ["R64", "R32", "R16", "R8", "R4", "R2"];
  for (const round of order) {
    for (const match of matches.filter((m) => m.round === round)) {
      if (match.winnerId) continue;
      const p1 = match.player1Id;
      const p2 = match.player2Id;
      if (p1 && !p2 && slotIsVacant(matches, match, 2)) {
        match.isBye = true;
        match.winnerId = p1;
        const next = matchById(matches, match.nextMatchId);
        if (next && match.nextSlot) setSlot(next, match.nextSlot, p1);
      } else if (p2 && !p1 && slotIsVacant(matches, match, 1)) {
        match.isBye = true;
        match.winnerId = p2;
        const next = matchById(matches, match.nextMatchId);
        if (next && match.nextSlot) setSlot(next, match.nextSlot, p2);
      }
    }
  }
}

export function generateBracket(
  players: Player[],
  opts: { mode: "seeded" | "chaos"; rng: Rng; seedSalt: number },
): { matches: Match[]; boardA: Player[]; boardB: Player[] } {
  const ranked = rankForSeeding(players, opts.mode, opts.rng);
  const [boardA, boardB] = snakeDeal(ranked);
  const matches = emptyBracket();
  placePlayersOnBoard(matches, "A", boardA);
  placePlayersOnBoard(matches, "B", boardB);
  applyByeAdvances(matches);
  return { matches, boardA, boardB };
}

export function playerOnMatch(match: Match, playerId: string): boolean {
  return match.player1Id === playerId || match.player2Id === playerId;
}

export function hasRealWinner(matches: Match[]): boolean {
  return matches.some((m) => Boolean(m.winnerId) && !m.isBye);
}

export function applyWinner(matches: Match[], matchId: string, winnerId: string): Match {
  const match = matchById(matches, matchId);
  if (!match) throw new Error(`Unknown match ${matchId}`);
  if (match.winnerId) throw new Error("Match already has a winner");
  if (!playerOnMatch(match, winnerId)) throw new Error("Winner is not in this match");
  if (!match.player1Id || !match.player2Id) throw new Error("Match is not ready");
  match.winnerId = winnerId;
  match.isBye = false;
  const next = matchById(matches, match.nextMatchId);
  if (next && match.nextSlot) setSlot(next, match.nextSlot, winnerId);
  if (match.loserNextMatchId && match.loserNextSlot) {
    const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
    const third = matchById(matches, match.loserNextMatchId);
    if (third && loserId) setSlot(third, match.loserNextSlot, loserId);
  }
  return match;
}

export function undoWinner(matches: Match[], matchId: string): void {
  const match = matchById(matches, matchId);
  if (!match || !match.winnerId) return;
  if (match.nextMatchId) {
    const next = matchById(matches, match.nextMatchId);
    if (next?.winnerId) undoWinner(matches, next.id);
    if (next && match.nextSlot) {
      if (match.nextSlot === 1 && next.player1Id === match.winnerId) next.player1Id = null;
      if (match.nextSlot === 2 && next.player2Id === match.winnerId) next.player2Id = null;
    }
  }
  if (match.loserNextMatchId) {
    const loserId = match.player1Id === match.winnerId ? match.player2Id : match.player1Id;
    const third = matchById(matches, match.loserNextMatchId);
    if (third?.winnerId) undoWinner(matches, third.id);
    if (third && loserId) {
      if (third.player1Id === loserId) third.player1Id = null;
      if (third.player2Id === loserId) third.player2Id = null;
    }
  }
  match.winnerId = null;
  match.isBye = false;
  match.calledAt = null;
}

export function findLateByeMatch(matches: Match[]): Match | undefined {
  const byes = matches.filter(
    (m) =>
      m.round === "R64" &&
      m.isBye &&
      ((m.player1Id && !m.player2Id) || (m.player2Id && !m.player1Id)),
  );
  return byes.sort((a, b) => b.slot - a.slot)[0];
}

export function placeLatePlayer(matches: Match[], playerId: string): Match {
  const already = matches.some((m) => m.round === "R64" && playerOnMatch(m, playerId));
  if (already) throw new Error("Player already in the bracket");
  const match = findLateByeMatch(matches);
  if (!match) throw new Error("No remaining BYE slots");
  undoWinner(matches, match.id);
  if (!match.player1Id) match.player1Id = playerId;
  else match.player2Id = playerId;
  match.isBye = false;
  match.winnerId = null;
  return match;
}

export function createEmptyTournament(): Tournament {
  return {
    _id: TOURNAMENT_ID,
    name: EVENT.name,
    hosts: [...EVENT.hosts],
    eventDate: EVENT.dateIso,
    venue: EVENT.venue,
    prizes: { ...EVENT.prizes },
    status: "setup",
    pairingMode: "seeded",
    players: [],
    matches: [],
    revision: 0,
    lastEvent: { type: "created", at: new Date().toISOString() },
    frozenAt: null,
    seedSalt: 0,
    importStats: null,
  };
}

export function matchReady(m: Match): boolean {
  return Boolean(m.player1Id && m.player2Id && !m.winnerId && !m.isBye);
}

export function boardOf(matches: Match[], boardId: BoardId): Match[] {
  return matches.filter((m) => m.boardId === boardId);
}
