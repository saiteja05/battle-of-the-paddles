# Battle of the Paddles

OpenAI × MongoDB table tennis tournament bracket for **Battle of the Paddles** at SPIN San Francisco.

## Live site (GitHub Pages)

**https://saiteja05.github.io/battle-of-the-paddles/**

PIN: **`0909`**

Data is stored in your browser (`localStorage`). Same device / same browser tabs stay in sync. For two phones at the venue, use the **Node server** deploy below instead.

## Run locally (full server — two-phone sync)

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000 — PIN `0909`. Uses `data/tournament.json` on disk.

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
