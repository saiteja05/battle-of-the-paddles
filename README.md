# Battle of the Paddles

OpenAI × MongoDB table tennis tournament — **Wed Sep 9 2026**, SPIN San Francisco.

Prizes: **1st NVIDIA RTX 5080** · **2nd Nintendo Switch 2** · **3rd Meta Quest 3**.

Two single-elim boards (A / B) with production pairing — everyone plays unless that board has an odd count — then Grand Final (A champ vs B champ) and 3rd place (runners-up, Quest 3).

Night-of ops: **two physical boards, two operators**, same PIN. Generate writes **first-round names only** (`ceil(N/2)` matches, not a padded 64). Later rounds stay empty until someone taps a winner (or the one real odd-N bye) — one next-round slot at a time. No skip-to-finals, auto-win, or prefilled podium.

## Run locally

```bash
cp .env.example .env
# preferred at the venue (Atlas) and locally:
docker compose up -d
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Operator PIN defaults to **`0909`**.

Local without Docker: `STORE=file OPERATOR_PIN=0909 npm run dev` — same document shape, file fallback only.

### Datastore

- **Preferred (venue):** MongoDB / Atlas via `MONGODB_URI`. One document in `tournaments` with `_id: "battle-of-the-paddles"`. `STORE=auto` (default) tries Mongo first.
- **Fallback:** if Mongo is unreachable, the API writes `data/tournament.json` with the same document. Force it with `STORE=file`. `STORE=mongo` fails instead of falling back.
- Emails are never stored or rendered. Public/TV views only show names.

## Day-of runbook (SPIN)

1. **Devices** — operator 1 on `/setup` + `/now`, operator 2 marking `/board/a` or `/board/b` while copying onto the paper sheet. Same PIN. `/tv` on a projector if you have one.
2. **Import** — `/setup` → upload the Luma registration CSV (the `Touranment? (yes/no)` typo is expected). Parser keeps `Touranment? = Yes` **and** `approval_status = approved`, skips declined (Nathan Dalal, Sebastian Ingino), merges duplicate names (Aydan Pirani, Joseph Miano, Uzair Ahmad) and flags them in the UI. Sample file: `public/sample-players.csv` (names + skill + competing only).
3. **Check-in** — tap names as people arrive. Huge targets; gold = in the door.
4. **Freeze & Generate ~6:30** — **Seeded**: Advanced > Intermediate > Beginner/unranked, shuffle *within* band, snake-deal across A/B (even split when N is even — 86 → 44 and 42). Pair 1v1; a bye only if that board is odd. **Chaos shuffle** is fully random order then the same pairing. Re-generate is allowed until the first *real* (non-bye) winner.
5. **Physical boards** — copy from match slot ids (`A-R64-07`, `B-R8-02`, …). Later-round slots are blank until a tap fills them. Digital twin updates both devices via 1s poll (SSE if the browser keeps the stream).
6. **Vacant slots and winners** — a one-player R64 shows **No opponent** (not a person named BYE). Tap the real name twice to advance **one** slot into R32. Same two-tap for a real match winner. Nothing auto-cascades into R16/quarters/finals.
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

Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, MongoDB Node driver (no Mongoose). PWA manifest at `/manifest.json`. Fonts: Bangers, Archivo Black, Archivo Narrow.
