"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BattleTitle, MongoLeaf, VenueChip } from "@/components/Brand";
import { useEvent } from "@/components/Providers";
import { competitorsOf, skillLabel } from "@/lib/csv";
import { hasRealWinner } from "@/lib/bracket";

export default function SetupPage() {
  const { event, post } = useEvent();
  const [q, setQ] = useState("");
  const [includeUnchecked, setIncludeUnchecked] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const comps = useMemo(() => competitorsOf(event.players), [event.players]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return comps.filter((p) => !n || p.name.toLowerCase().includes(n) || p.company.toLowerCase().includes(n));
  }, [comps, q]);
  const checked = comps.filter((p) => p.checkedIn).length;
  const locked = hasRealWinner(event.matches);
  const dups = event.players.filter((p) => p.mergedCount > 1 && p.competing);

  async function onFile(file: File) {
    setBusy(true);
    setMsg("Importing…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/players/import", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "import failed");
      setMsg(
        `Imported ${data.stats.uniqueCompetitors} unique competitors · ${data.stats.duplicatesMerged} merged · ${data.stats.declinedSkipped} declined skipped`,
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "import failed");
    } finally {
      setBusy(false);
    }
  }

  async function generate(mode: "seeded" | "chaos") {
    setBusy(true);
    try {
      await post("/api/bracket/generate", { mode, includeUnchecked });
      setMsg(`Generated ${mode} bracket.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "generate failed");
    } finally {
      setBusy(false);
    }
  }

  async function reset(keepPlayers: boolean) {
    if (!confirm(keepPlayers ? "Clear bracket, keep players?" : "Full reset?")) return;
    setBusy(true);
    try {
      await post("/api/event/reset", { keepPlayers });
      setMsg("Reset complete.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <p className="slam-caption">Night-of desk</p>
      <div className="mt-2">
        <VenueChip />
      </div>
      <div className="mt-2">
        <BattleTitle size="md" />
      </div>
      <h1 className="mt-2 font-bangers chromatic text-4xl">Setup / Check-in</h1>
      <p className="mt-2 max-w-3xl font-cond text-lg">
        Import the Luma CSV (typo header is fine). Check people in as they arrive. Freeze & Generate around 6:30. Late
        arrivals fill a remaining odd-count bye if one exists.
      </p>

      <section className="panel mt-6 p-4">
        <h2 className="font-black text-2xl">1. Import</h2>
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={busy || locked}
          className="mt-3 block w-full font-cond"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
        <p className="mt-2 text-sm opacity-80">Sanitized demo: /sample-players.csv — parser still accepts the real Luma export.</p>
        {event.importStats ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-3 font-black">
            <li className="bg-black/40 p-2">Rows {event.importStats.rows}</li>
            <li className="bg-black/40 p-2">Unique {event.importStats.uniqueCompetitors}</li>
            <li className="bg-black/40 p-2">Merged {event.importStats.duplicatesMerged}</li>
            <li className="bg-black/40 p-2">Declined skip {event.importStats.declinedSkipped}</li>
            <li className="bg-black/40 p-2">Not competing {event.importStats.notCompeting}</li>
            <li className="bg-black/40 p-2">Yes+approved rows {event.importStats.competingApproved}</li>
          </ul>
        ) : null}
        {dups.length ? (
          <div className="mt-3">
            <p className="font-black text-gold">Merged duplicates (flagged)</p>
            <ul className="font-cond">
              {dups.map((p) => (
                <li key={p.id}>
                  {p.name} ×{p.mergedCount}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="panel mt-6 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-black text-2xl">2. Check-in</h2>
            <p className="font-cond">
              {checked} / {comps.length} competitors in the door
            </p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name…"
            className="tap min-w-56 bg-paper px-3 text-ink"
          />
        </div>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-3 border-2 border-black bg-black/30 p-2">
              <button
                className={`tap min-h-16 flex-1 px-3 text-left ${p.checkedIn ? "bg-gold text-ink" : "bg-paper text-ink"}`}
                disabled={busy}
                onClick={() =>
                  void post("/api/players/checkin", {
                    playerId: p.id,
                    checkedIn: !p.checkedIn,
                    late: Boolean(event.matches.length) && !p.checkedIn,
                  }).catch((e) => setMsg(e.message))
                }
              >
                <div className="font-black">{p.name}</div>
                <div className="text-sm font-cond">
                  {skillLabel(p.skill)}
                  {p.mergedCount > 1 ? ` · merged×${p.mergedCount}` : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-6 p-4">
        <h2 className="font-black text-2xl">3. Freeze & Generate</h2>
        <p className="font-cond">
          Pairs every competing player 1v1 (a bye only if that board has an odd count). First-round slot ids like{" "}
          A-R64-07. Later rounds stay empty until an operator taps a winner — or the one real bye when N is odd. Seeded:
          Advanced → Intermediate → Beginner/unranked, shuffle within band, snake-deal A/B (even split when N is even).
          Chaos = fully random order then the same pairing.
        </p>
        <label className="mt-3 flex items-center gap-2 font-black">
          <input type="checkbox" checked={includeUnchecked} onChange={(e) => setIncludeUnchecked(e.target.checked)} />
          Include players not yet checked in (freeze with the full list)
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="tap bg-gold px-6 text-ink" disabled={busy || locked} onClick={() => void generate("seeded")}>
            Freeze · Seeded
          </button>
          <button className="tap bg-mag px-6 text-paper" disabled={busy || locked} onClick={() => void generate("chaos")}>
            Chaos shuffle
          </button>
          <button className="tap bg-paper px-6 text-ink" disabled={busy} onClick={() => void reset(true)}>
            Reset bracket
          </button>
          <button className="tap bg-crimson px-6 text-paper" disabled={busy} onClick={() => void reset(false)}>
            Full reset
          </button>
        </div>
        {locked ? <p className="mt-3 font-black text-gold">Locked — a real match already has a winner. Undo it to re-generate.</p> : null}
      </section>
      {msg ? (
        <p className="mt-4 flex flex-wrap items-center gap-2 font-black text-leaf">
          {/generated|imported|reset complete/i.test(msg) ? (
            <MongoLeaf className="leaf-stamp h-6" tone="onPaper" />
          ) : null}
          <span>{msg}</span>
        </p>
      ) : null}
    </AppShell>
  );
}
