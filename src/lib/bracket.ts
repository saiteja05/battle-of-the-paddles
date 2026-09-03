import type { BoardId, Match, Player, RoundId, Tournament } from "./types";
import { BOARD_ROUNDS, EVENT, TOURNAMENT_ID } from "./types";
import { quoteIdFor } from "./quotes";
import { rankForSeeding, snakeDeal, type Rng } from "./seed";

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

/**
 * Match counts per round for `playerCount` people, pairing everyone 1v1 and
 * adding a bye match only when the entering count is odd.
 * 44 → [22, 11, 6, 3, 2, 1]; 42 → [21, 11, 6, 3, 2, 1]; 8 → [4, 2, 1].
 */
export function boardRoundSizes(playerCount: number): number[] {
  if (playerCount <= 0) return [];
  if (playerCount === 1) return [1];
  const sizes: number[] = [];
  let n = playerCount;
  while (n > 1) {
    const matches = Math.ceil(n / 2);
    sizes.push(matches);
    n = matches;
  }
  if (sizes.length > BOARD_ROUNDS.length) {
    throw new Error(
      `Need ${sizes.length} rounds for ${playerCount} players; max is ${BOARD_ROUNDS.length} (64 per board)`,
    );
  }
  return sizes;
}

export function createBoardMatches(boardId: "A" | "B", playerCount: number): Match[] {
  const sizes = boardRoundSizes(playerCount);
  const matches: Match[] = [];
  for (let r = 0; r < sizes.length; r++) {
    const round = BOARD_ROUNDS[r];
    const count = sizes[r];
    const isLast = r === sizes.length - 1;
    for (let slot = 1; slot <= count; slot++) {
      if (isLast) {
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
        const nextRound = BOARD_ROUNDS[r + 1];
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
  return [...createFinalsMatches()];
}

/** Highest seed sits out when N is odd; remaining fold 1vN, 2vN-1, … */
export function foldPairs(ranked: Player[]): [string, string | null][] {
  const ids = ranked.map((p) => p.id);
  const pairs: [string, string | null][] = [];
  if (ids.length % 2 === 1) {
    const bye = ids.shift();
    if (bye) pairs.push([bye, null]);
  }
  let i = 0;
  let j = ids.length - 1;
  while (i < j) {
    pairs.push([ids[i], ids[j]]);
    i += 1;
    j -= 1;
  }
  return pairs;
}

export function placePlayersOnBoard(matches: Match[], boardId: "A" | "B", ranked: Player[]): void {
  const firstRound = matches
    .filter((m) => m.boardId === boardId && m.round === "R64")
    .sort((a, b) => a.slot - b.slot);
  const pairs = foldPairs(ranked);
  if (pairs.length !== firstRound.length) {
    throw new Error(
      `Board ${boardId}: ${ranked.length} players need ${pairs.length} first-round matches, found ${firstRound.length}`,
    );
  }
  for (let i = 0; i < pairs.length; i++) {
    firstRound[i].player1Id = pairs[i][0];
    firstRound[i].player2Id = pairs[i][1];
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

/** Lone player vs a vacant seed — not waiting on an unfinished feeder. */
export function isVacantBye(matches: Match[], match: Match): boolean {
  if (match.winnerId) return false;
  if (match.player1Id && match.player2Id) return false;
  if (match.player1Id && !match.player2Id) return slotIsVacant(matches, match, 2);
  if (match.player2Id && !match.player1Id) return slotIsVacant(matches, match, 1);
  return false;
}

/**
 * Flag one-player vacant matches as BYEs. Does not set winners or copy anyone
 * into a later round — the operator taps the lone player to advance one slot.
 */
export function markByeMatches(matches: Match[]): void {
  for (const match of matches) {
    if (match.winnerId) continue;
    match.isBye = isVacantBye(matches, match);
  }
}

/** @deprecated Does not auto-advance. Use markByeMatches. */
export function applyByeAdvances(matches: Match[]): void {
  markByeMatches(matches);
}

export function generateBracket(
  players: Player[],
  opts: { mode: "seeded" | "chaos"; rng: Rng; seedSalt: number },
): { matches: Match[]; boardA: Player[]; boardB: Player[] } {
  const ranked = rankForSeeding(players, opts.mode, opts.rng);
  const [boardA, boardB] = snakeDeal(ranked);
  const matches = [
    ...createBoardMatches("A", boardA.length),
    ...createBoardMatches("B", boardB.length),
    ...createFinalsMatches(),
  ];
  placePlayersOnBoard(matches, "A", boardA);
  placePlayersOnBoard(matches, "B", boardB);
  markByeMatches(matches);
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
  const bothReady = Boolean(match.player1Id && match.player2Id);
  if (!bothReady && !isVacantBye(matches, match)) throw new Error("Match is not ready");
  match.winnerId = winnerId;
  match.isBye = !bothReady;
  const next = matchById(matches, match.nextMatchId);
  if (next && match.nextSlot) setSlot(next, match.nextSlot, winnerId);
  if (bothReady && match.loserNextMatchId && match.loserNextSlot) {
    const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
    const third = matchById(matches, match.loserNextMatchId);
    if (third && loserId) setSlot(third, match.loserNextSlot, loserId);
  }
  markByeMatches(matches);
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
  markByeMatches(matches);
}

export function findLateByeMatch(matches: Match[]): Match | undefined {
  const candidates = matches.filter(
    (m) =>
      m.round === "R64" &&
      ((m.player1Id && !m.player2Id) || (m.player2Id && !m.player1Id)),
  );
  const unplayed = candidates.filter((m) => !m.winnerId);
  const pool = unplayed.length ? unplayed : candidates;
  return pool.sort((a, b) => b.slot - a.slot)[0];
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
  markByeMatches(matches);
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

/** Real two-player match, or a vacant BYE the operator can tap to advance one round. */
export function matchCanSelectWinner(m: Match): boolean {
  if (m.winnerId) return false;
  if (m.player1Id && m.player2Id) return true;
  return m.isBye && Boolean(m.player1Id || m.player2Id);
}

export function boardOf(matches: Match[], boardId: BoardId): Match[] {
  return matches.filter((m) => m.boardId === boardId);
}

/** First-round real matches (and a true odd-N bye). Empty later-round holes stay hidden. */
export function matchIsListed(m: Match): boolean {
  if (m.isBye) return true;
  return Boolean(m.player1Id || m.player2Id || m.winnerId);
}

export type RoundSnapshot = {
  matches: number;
  namedSlots: number;
  winners: number;
  pendingByes: number;
};

const SNAPSHOT_ROUNDS: RoundId[] = ["R64", "R32", "R16", "R8", "R4", "R2", "GF", "3RD"];

/** Named-slot counts per round — generate should only populate R64. */
export function roundSnapshot(matches: Match[]): Record<RoundId, RoundSnapshot> {
  const out = {} as Record<RoundId, RoundSnapshot>;
  for (const round of SNAPSHOT_ROUNDS) {
    const ms = matches.filter((m) => m.round === round);
    out[round] = {
      matches: ms.length,
      namedSlots: ms.reduce((n, m) => n + (m.player1Id ? 1 : 0) + (m.player2Id ? 1 : 0), 0),
      winners: ms.filter((m) => m.winnerId).length,
      pendingByes: ms.filter((m) => m.isBye && !m.winnerId).length,
    };
  }
  return out;
}

