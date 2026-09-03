# Battle of the Paddles

OpenAI × MongoDB table tennis tournament — **Wed Sep 9 2026**, SPIN San Francisco.

Prizes: **1st NVIDIA RTX 5080** · **2nd Nintendo Switch 2** · **3rd Meta Quest 3**.

## Run locally (start here)

**→ [LOCAL_SETUP.md](./LOCAL_SETUP.md)** — copy-paste steps for Mac, Linux, and Windows. No VM, no tunnels, no Docker, no Mongo required.

```bash
npm install
cp .env.example .env
npm run dev
# open http://localhost:3000  PIN 0909
```

Tournament state lives in `data/tournament.json` (`STORE=file` by default).

Night-of ops: **two physical boards, two operators**, same PIN. Generate writes **first-round names only** (`ceil(N/2)` matches, not a padded 64). Later rounds stay empty until someone taps a winner (or the one real odd-N bye) — one next-round slot at a time. No skip-to-finals, auto-win, or prefilled podium.

### Datastore

- **Default (local):** `STORE=file` writes `data/tournament.json`. Works offline on one machine.
- **Optional (multi-device):** MongoDB / Atlas via `MONGODB_URI` with `STORE=mongo`. One document in `tournaments` with `_id: "battle-of-the-paddles"`.
- Emails are never stored or rendered. Public/TV views only show names.

## Day-of runbook (SPIN)

1. **Devices** — operator 1 on `/setup` + `/now`, operator 2 marking `/board/a` or `/board/b` while copying onto the paper sheet. Same PIN. `/tv` on a projector if you have one.
2. **Import** — `/setup` → upload the Luma registration CSV (the `Touranment? (yes/no)` typo is expected). Parser keeps `Touranment? = Yes` **and** `approval_status = approved`, skips declined (Nathan Dalal, Sebastian Ingino), merges duplicate names (Aydan Pirani, Joseph Miano, Uzair Ahmad) and flags them in the UI. Sample file: `public/sample-players.csv` (names + skill + competing only).
3. **Check-in** — tap names as people arrive. Huge targets; gold = in the door.
4. **Freeze & Generate ~6:30** — **Seeded**: Advanced > Intermediate > Beginner/unranked, shuffle *within* band, snake-deal across A/B (even split when N is even — 86 → 44 and 42). Pair 1v1; a bye only if that board is odd. **Chaos shuffle** is fully random order then the same pairing. Re-generate is allowed until the first *real* (non-bye) winner.
5. **Physical boards** — copy from match slot ids (`A-R64-07`, `B-R8-02`, …). Later-round slots are blank until a tap fills them. Digital twin updates both devices via 1s poll (SSE if the browser keeps the stream).
6. **Winners (and the rare real bye)** — even fields have no byes; everyone in round 1 has a human opponent. If N is odd, the leftover highest seed on that board is the only bye — tap their name twice to advance **one** slot. Same two-tap for a real match winner. Nothing auto-cascades into R16/quarters/finals.
7. **Call to table** on `/now` (two-player matches only). Same `quoteId` is stored on the match so both screens show the same original one-liner.
8. **Late arrivals** — check them in after freeze; they fill a remaining unplayed odd-count bye so they actually play.
9. **Finals order** — play **3rd place first** (`FINALS-3RD-01`) while finalists rest, then **Grand Final** (`FINALS-GF-01`). Podium fills from those two matches only — no fake names.
10. **Wifi blip** — gold **OFFLINE** banner if the poll fails; last snapshot stays on screen.

### Reset

- **Reset bracket** keeps the imported players / check-ins.
- **Full reset** wipes everything.

## Routes

| Path | Who |
| --- | --- |
| `/` | PIN gate → hub |
| `/setup` | CSV, check-in, pairing, generate, reset |
| `/board/a` `/board/b` | Visual boards (real first-round matches only) |
| `/now` | Ready + called |
| `/finals` | 3rd, grand final, podium |
| `/tv` | Read-only display (no PIN, no emails) |

Mutating APIs require the PIN cookie (`POST /api/auth`) or header `x-operator-pin`.

## Tests

```bash
npm test
```

Vitest covers Luma CSV columns, duplicate merge, declined skip, first-round-only generate, even board split, seed placement, one-slot winner/bye advance, cascade undo, N=86 → 0 byes, and N=87 → 1 bye.

## Stack

Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, MongoDB Node driver (optional; file store default). PWA manifest at `/manifest.json`. Fonts: Bangers, Archivo Black, Archivo Narrow.
