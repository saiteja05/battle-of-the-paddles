import type { Match, Player, Tournament } from "@/lib/types";
import { skillLabel } from "@/lib/csv";

export function playerMap(event: Tournament): Map<string, Player> {
  return new Map(event.players.map((p) => [p.id, p]));
}

export function playerName(players: Map<string, Player>, id: string | null): string {
  if (!id) return "—";
  return players.get(id)?.name ?? id;
}

/** Empty later-round slots stay blank; a vacant BYE opponent is labeled BYE for the paper boards. */
export function slotName(
  players: Map<string, Player>,
  id: string | null,
  opts?: { vacantBye?: boolean },
): string {
  if (id) return players.get(id)?.name ?? id;
  if (opts?.vacantBye) return "BYE";
  return "";
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
