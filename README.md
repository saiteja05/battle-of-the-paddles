# Battle of the Paddles

Upload a CSV → run the bracket. **No database required.**

## Quick start

```bash
git clone https://github.com/saiteja05/battle-of-the-paddles.git
cd battle-of-the-paddles
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000 — PIN **`0909`** (change `OPERATOR_PIN` in `.env` for a live event).

1. **Setup** — upload a registration CSV (or the fictional `public/sample-players.csv`)
2. **Board A / B** — tap winners after each game
3. **Now** — see who plays next

Tournament state is saved to **`data/tournament.json`** on your machine. Do not commit that file.

## GitHub Pages (optional)

Pushes to `main` run `.github/workflows/deploy-pages.yml`:

- Static export (no API routes)
- Client-side bracket logic; data stays in the browser (`localStorage`)
- Enable **Settings → Pages → Source: GitHub Actions**

For event night with two phones, use `npm run dev` instead of the static demo.

See [GITHUB_PAGES.md](./GITHUB_PAGES.md) and [LOCAL_SETUP.md](./LOCAL_SETUP.md).

## Event flow

1. **Setup** — import CSV, check in players, generate bracket
2. **Board A / B** — tap winners
3. **Now** — who plays next
4. **Finals** — grand final + 3rd place
5. **TV** — read-only display
