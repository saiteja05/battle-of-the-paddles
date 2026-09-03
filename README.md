# Battle of the Paddles

Upload a CSV → run the bracket. **No database required.**

## Quick start (your Mac)

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000 — PIN **`0909`**

1. **Setup** — upload the Luma registration CSV
2. **Board A / B** — tap winners after each game
3. **Now** — see who plays next

Your tournament state is saved to **`data/tournament.json`** on your machine. No MongoDB, no cloud DB, no connection strings.

## GitHub Pages (optional)

Static site at **https://saiteja05.github.io/battle-of-the-paddles/** — same app, data stays in your browser (`localStorage`). Good for a demo; for event night with two phones, use `npm run dev` above instead.

See [GITHUB_PAGES.md](./GITHUB_PAGES.md) to deploy.

## GitHub Pages deploy

Pushes to `main` run `.github/workflows/deploy-pages.yml`:

- Static export with `basePath: /battle-of-the-paddles`
- Client-side bracket logic (no API routes)
- Enable **Settings → Pages → Source: GitHub Actions** on the repo

Local static preview:

```bash
rm -rf src/app/api   # restore from git after
npm run build:pages
npx serve out
```

## Event flow

1. **Setup** — import Luma CSV, check in players, generate bracket
2. **Board A / B** — tap winners (Spider-Verse slam)
3. **Now** — who plays next
4. **Finals** — grand final + 3rd place
5. **TV** — read-only display

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for Mac setup details.
