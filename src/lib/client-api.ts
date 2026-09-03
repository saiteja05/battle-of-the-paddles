"use client";

import {
  applyCall,
  applyCheckin,
  applyGenerate,
  applyImport,
  applyLateCheckin,
  applyReset,
  applySetWinner,
  applyUndo,
} from "./ops";
import { updateClientTournament } from "./client-store";
import type { Tournament } from "./types";

async function readCsvFromRequest(body: unknown, url: string): Promise<string> {
  if (body instanceof FormData) {
    const file = body.get("file");
    if (file instanceof File) return file.text();
    const csv = body.get("csv");
    if (typeof csv === "string") return csv;
  }
  if (typeof body === "string") return body;
  if (body && typeof body === "object") return JSON.stringify(body);
  return "";
}

export async function clientPost(url: string, body?: unknown): Promise<{ event?: Tournament; error?: string }> {
  try {
    if (url === "/api/players/import") {
      const csv = body instanceof FormData ? await readCsvFromRequest(body, url) : String(body ?? "");
      if (!csv.trim()) return { error: "Empty CSV" };
      const event = updateClientTournament((t) => applyImport(t, csv));
      return { event };
    }
    if (url === "/api/bracket/generate") {
      const b = (body ?? {}) as { mode?: "seeded" | "chaos"; includeUnchecked?: boolean };
      const event = updateClientTournament((t) =>
        applyGenerate(t, {
          mode: b.mode === "chaos" ? "chaos" : "seeded",
          includeUnchecked: Boolean(b.includeUnchecked),
        }),
      );
      return { event };
    }
    if (url === "/api/event/reset") {
      const b = (body ?? {}) as { keepPlayers?: boolean };
      const event = updateClientTournament((t) => applyReset(t, Boolean(b.keepPlayers)));
      return { event };
    }
    if (url === "/api/players/checkin") {
      const b = body as { playerId?: string; checkedIn?: boolean; late?: boolean };
      if (!b?.playerId) return { error: "playerId required" };
      const event = updateClientTournament((t) =>
        b.late ? applyLateCheckin(t, b.playerId!) : applyCheckin(t, b.playerId!, Boolean(b.checkedIn)),
      );
      return { event };
    }
    const match = url.match(/^\/api\/matches\/([^/]+)\/(winner|undo|call)$/);
    if (match) {
      const matchId = decodeURIComponent(match[1]!);
      const action = match[2]!;
      if (action === "winner") {
        const b = body as { winnerId?: string };
        if (!b?.winnerId) return { error: "winnerId required" };
        const event = updateClientTournament((t) => applySetWinner(t, matchId, b.winnerId!));
        return { event };
      }
      if (action === "undo") {
        const event = updateClientTournament((t) => applyUndo(t, matchId));
        return { event };
      }
      if (action === "call") {
        const event = updateClientTournament((t) => applyCall(t, matchId));
        return { event };
      }
    }
    return { error: `Unknown route ${url}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Request failed" };
  }
}
