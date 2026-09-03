import type { Player, Skill } from "./types";
import { skillRank } from "./csv";

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Standard power-of-two seed placement: index = court position, value = seed number. */
export function seedPlacement(size: number): number[] {
  if (size < 2 || (size & (size - 1)) !== 0) {
    throw new Error(`seedPlacement requires power of two, got ${size}`);
  }
  let seeds = [1];
  while (seeds.length < size) {
    const n = seeds.length * 2;
    const next: number[] = [];
    for (const s of seeds) {
      next.push(s);
      next.push(n + 1 - s);
    }
    seeds = next;
  }
  return seeds;
}

/**
 * Snake-deal across boards A/B (A, B, B, A, …). When total N is even, both
 * boards get even counts so nobody sits out — N ≡ 2 (mod 4) would otherwise
 * yield odd/odd (86 → 43/43). Shift the last B player onto A (86 → 44/42).
 * Odd N leaves exactly one board odd → one real bye for the event.
 */
export function snakeDeal<T>(items: T[]): [T[], T[]] {
  const a: T[] = [];
  const b: T[] = [];
  for (let i = 0; i < items.length; i++) {
    const dest = i % 4 === 0 || i % 4 === 3 ? a : b;
    dest.push(items[i]);
  }
  if (items.length % 2 === 0 && a.length % 2 === 1) {
    const moved = b.pop();
    if (moved !== undefined) a.push(moved);
  }
  return [a, b];
}

export function rankForSeeding(players: Player[], mode: "seeded" | "chaos", rng: Rng): Player[] {
  const list = players.map((p) => ({ ...p }));
  if (mode === "chaos") {
    return shuffleInPlace(list, rng);
  }
  const bands: Skill[][] = [["advanced"], ["intermediate"], ["beginner", "unranked"]];
  const out: Player[] = [];
  for (const band of bands) {
    const group = list.filter((p) => band.includes(p.skill));
    shuffleInPlace(group, rng);
    out.push(...group);
  }
  return out;
}

export function bandOf(p: Player): number {
  return skillRank(p.skill);
}
