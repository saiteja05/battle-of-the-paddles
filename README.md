# Battle of the Paddles

OpenAI × MongoDB table tennis tournament — **Wed Sep 9 2026**, SPIN San Francisco.

Prizes: **1st NVIDIA RTX 5080** · **2nd Nintendo Switch 2** · **3rd Meta Quest 3**.

Two 64-slot single-elim boards (A / B), then Grand Final (A champ vs B champ) and 3rd place (runners-up, Quest 3).

## Run locally

```bash
cp .env.example .env
# optional, preferred:
docker compose up -d
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Operator PIN defaults to **`0909`**.

### Datastore

- **Preferred:** MongoDB 7 via `docker-compose.yml` (`MONGODB_URI=mongodb://127.0.0.1:27017/paddles`). One document in `tournaments` with `_id: "battle-of-the-paddles"`.
- **Fallback:** if Mongo is unreachable, the API writes `data/tournament.json` with the same document shape. Force it with `STORE=file`.
- Emails are never stored or rendered. Public/TV views only show names.

## Day-of runbook

1. **Phones / tablets** — one operator on `/setup` + `/now`, one marker on `/board/a` or `/board/b`. Same PIN. `/tv` on a projector if you have one.
2. **Import** — `/setup` → upload the Luma registration CSV (the `Touranment? (yes/no)` typo is expected). Parser keeps `Touranment? = Yes` **and** `approval_status = approved`, skips declined (Nathan Dalal, Sebastian Ingino), merges duplicate names (Aydan Pirani, Joseph Miano, Uzair Ahmad) and flags them in the UI. Demo file: `public/sample-players.csv` (names + skill + competing only).
3. **Check-in** — tap names as people arrive. Huge targets; gold = in the door.
4. **Freeze & Generate ~6:30** — default **Seeded**: Advanced > Intermediate > Beginner/unranked, shuffle *within* band, snake-deal across A/B (Advanced split 3 and 3), standard 64-bracket seed placement, highest seeds get R64 BYEs. **Chaos shuffle** is fully random order then the same placement. Re-generate is allowed until the first *real* (non-bye) winner.
5. **Mark the physical boards** from match slot ids (`A-R64-07`, `B-R8-02`, …). Digital twin updates both devices via 1s poll (SSE if the browser keeps the stream).
6. **Call to table** on `/now`. Same `quoteId` is stored on the match so both screens show the same original one-liner.
7. **Tap winner once** (gold confirm glow) **then tap again to commit**. Undo cascades through later rounds.
8. **Late arrivals** — check them in after freeze; they fill remaining BYE slots (auto-advance is undone so they actually play).
9. **Finals order** — play **3rd place first** (`FINALS-3RD-01`) while finalists rest, then **Grand Final** (`FINALS-GF-01`). Podium fills from those two matches.
10. **Wifi blip** — gold **OFFLINE** banner if the poll fails; last snapshot stays on screen.

### Reset

- **Reset bracket** keeps the imported players / check-ins.
- **Full reset** wipes everything.

## Routes

| Path | Who |
| --- | --- |
| `/` | PIN gate → hub |
| `/setup` | CSV, check-in, pairing, generate, reset |
| `/board/a` `/board/b` | Visual 64-brackets |
| `/now` | Ready + called |
| `/finals` | 3rd, grand final, podium |
| `/tv` | Read-only display (no PIN, no emails) |

Mutating APIs require the PIN cookie (`POST /api/auth`) or header `x-operator-pin`.

## Tests

```bash
npm test
```

Vitest covers Luma CSV columns, duplicate merge, declined skip, bye counts, seed placement, snake split, winner advance, cascade undo, and N ≈ 86.

## Stack

Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, MongoDB Node driver (no Mongoose). PWA manifest at `/manifest.json`. Fonts: Bangers, Archivo Black, Archivo Narrow.
