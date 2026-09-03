import type { Match, Player, Tournament } from "@/lib/types";
import { skillLabel } from "@/lib/csv";

export function playerMap(event: Tournament): Map<string, Player> {
  return new Map(event.players.map((p) => [p.id, p]));
}

export function playerName(players: Map<string, Player>, id: string | null): string {
  if (!id) return "TBD";
  return players.get(id)?.name ?? id;
}

export function playerSub(p?: Player): string {
  if (!p) return "";
  const bits = [skillLabel(p.skill)];
  if (p.mergedCount > 1) bits.push(`merged×${p.mergedCount}`);
  if (p.company) bits.push(p.company);
  return bits.join(" · ");
}

export function matchLabel(m: Match): string {
  return m.id;
}
