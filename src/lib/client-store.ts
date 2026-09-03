"use client";

import { createEmptyTournament } from "./bracket";
import { STORAGE_KEY } from "./static-mode";
import type { Tournament } from "./types";

function read(): Tournament {
  if (typeof window === "undefined") return createEmptyTournament();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyTournament();
    return JSON.parse(raw) as Tournament;
  } catch {
    return createEmptyTournament();
  }
}

function write(t: Tournament): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  window.dispatchEvent(new CustomEvent("botp-storage", { detail: t }));
}

export function loadClientTournament(): Tournament {
  return read();
}

export function updateClientTournament(mutator: (t: Tournament) => Tournament): Tournament {
  const current = structuredClone(read());
  const next = mutator(current);
  write(next);
  return next;
}

export function subscribeClientTournament(cb: (t: Tournament) => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb(read());
  };
  const onCustom = (e: Event) => {
    cb((e as CustomEvent<Tournament>).detail ?? read());
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("botp-storage", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("botp-storage", onCustom);
  };
}
