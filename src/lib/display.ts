import type { LastEvent, Match, Player, Tournament } from "@/lib/types";
import { NEXT_ROUND, ROUND_LABEL } from "@/lib/types";
import { skillLabel } from "@/lib/csv";

export function playerMap(event: Tournament): Map<string, Player> {
  return new Map(event.players.map((p) => [p.id, p]));
}

export function playerName(players: Map<string, Player>, id: string | null): string {
  if (!id) return "—";
  return players.get(id)?.name ?? id;
}

/** Empty later-round slots stay blank. Never render BYE as if it were a competitor name. */
export function slotName(players: Map<string, Player>, id: string | null): string {
  if (id) return players.get(id)?.name ?? id;
  return "";
}

/** Vacant-seed plate title — not a person, not a tap target. */
export function vacantOpponentLabel(): string {
  return "No opponent";
}

export function nextRoundLabel(match: Match): string {
  const mapped = NEXT_ROUND[match.round];
  if (mapped) return ROUND_LABEL[mapped];
  if (match.round === "R2" || match.nextMatchId?.includes("-GF-")) return ROUND_LABEL.GF;
  if (match.nextMatchId?.includes("-3RD-")) return ROUND_LABEL["3RD"];
  return "the next round";
}

/** Operator caption on a vacant bye plate. */
export function byeAdvanceHint(match: Match): string {
  const dest = nextRoundLabel(match);
  if (match.winnerId) return `Bye — advanced to ${dest}`;
  return `Bye — tap name to send to ${dest}`;
}

/**
 * Name for WinnerSlam / TV last-point. Real match winners only — never "BYE".
 */
export function celebrateWinnerName(
  players: Map<string, Player> | Player[],
  lastEvent: Pick<LastEvent, "type" | "winnerId"> | null | undefined,
): string | null {
  if (!lastEvent || lastEvent.type !== "winner" || !lastEvent.winnerId) return null;
  const list = Array.isArray(players) ? players : [...players.values()];
  const name = list.find((p) => p.id === lastEvent.winnerId)?.name?.trim() ?? "";
  if (!name || /^bye$/i.test(name)) return null;
  return name;
}

export function playerSub(p?: Player): string {
  if (!p) return "";
  const bits = [skillLabel(p.skill)];
  if (p.mergedCount > 1) bits.push(`merged×${p.mergedCount}`);
  return bits.join(" · ");
}

export function matchLabel(m: Match): string {
  return m.id;
}
