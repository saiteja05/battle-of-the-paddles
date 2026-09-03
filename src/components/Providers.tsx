"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LastEvent, Tournament } from "@/lib/types";
import { createEmptyTournament } from "@/lib/bracket";
import { clientPost } from "@/lib/client-api";
import { loadClientTournament, subscribeClientTournament } from "@/lib/client-store";
import { AUTH_KEY, isStaticHosting } from "@/lib/static-mode";

type EventCtx = {
  event: Tournament;
  offline: boolean;
  slam: LastEvent | null;
  dismissSlam: () => void;
  refresh: () => Promise<void>;
  authed: boolean;
  setAuthed: (v: boolean) => void;
  post: (url: string, body?: unknown) => Promise<{ event?: Tournament; error?: string }>;
  staticMode: boolean;
};

const Ctx = createContext<EventCtx | null>(null);

export function useEvent() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEvent outside Providers");
  return v;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<Tournament>(createEmptyTournament());
  const [offline, setOffline] = useState(false);
  const [slam, setSlam] = useState<LastEvent | null>(null);
  const [authed, setAuthedState] = useState(false);
  const rev = useRef(-1);

  const apply = useCallback((data: Tournament) => {
    if (data.revision !== rev.current) {
      if (rev.current >= 0 && data.lastEvent?.type === "winner") {
        setSlam(data.lastEvent);
      }
      rev.current = data.revision;
      setEvent(data);
    }
  }, []);

  const setAuthed = useCallback((v: boolean) => {
    setAuthedState(v);
    if (isStaticHosting && typeof window !== "undefined") {
      if (v) sessionStorage.setItem(AUTH_KEY, "1");
      else sessionStorage.removeItem(AUTH_KEY);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (isStaticHosting) {
      apply(loadClientTournament());
      setOffline(false);
      return;
    }
    try {
      const r = await fetch("/api/event", { cache: "no-store" });
      if (!r.ok) throw new Error("poll failed");
      const data = (await r.json()) as Tournament;
      setOffline(false);
      apply(data);
    } catch {
      setOffline(true);
    }
  }, [apply]);

  useEffect(() => {
    if (isStaticHosting) {
      apply(loadClientTournament());
      setAuthedState(sessionStorage.getItem(AUTH_KEY) === "1");
      return subscribeClientTournament((t) => {
        apply(t);
        setOffline(false);
      });
    }
    void fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setAuthedState(Boolean(d.ok)))
      .catch(() => setAuthedState(false));
  }, [apply]);

  useEffect(() => {
    void refresh();
    if (isStaticHosting) {
      const iv = setInterval(() => void refresh(), 1000);
      return () => clearInterval(iv);
    }
    const iv = setInterval(() => void refresh(), 1000);
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/event/stream");
      es.onmessage = (msg) => {
        try {
          apply(JSON.parse(msg.data) as Tournament);
          setOffline(false);
        } catch {
          /* ignore malformed */
        }
      };
    } catch {
      /* poll is enough */
    }
    return () => {
      clearInterval(iv);
      es?.close();
    };
  }, [refresh, apply]);

  const post = useCallback(
    async (url: string, body?: unknown) => {
      if (isStaticHosting) {
        const data = await clientPost(url, body);
        if (data.event) apply(data.event);
        if (data.error) throw new Error(data.error);
        return data;
      }
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = (await r.json()) as { event?: Tournament; error?: string };
      if (data.event) apply(data.event);
      if (!r.ok) throw new Error(data.error || "Request failed");
      return data;
    },
    [apply],
  );

  const value = useMemo(
    () => ({
      event,
      offline,
      slam,
      dismissSlam: () => setSlam(null),
      refresh,
      authed,
      setAuthed,
      post,
      staticMode: isStaticHosting,
    }),
    [event, offline, slam, refresh, authed, setAuthed, post],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
