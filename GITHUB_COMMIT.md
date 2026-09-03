# Push to GitHub from your Mac

Repo: **https://github.com/saiteja05/battle-of-the-paddles**

Your code folder (use the one that contains `package.json`):

```bash
cd /Users/teja.boddapati/Downloads/battle-of-the-paddles/battle-of-the-paddles
```

## Quick setup

```bash
chmod +x scripts/init-github.sh
./scripts/init-github.sh
git commit -m "Battle of the Paddles tournament app"
git push -u origin main
```

When `git push` asks for credentials:
- **Username:** `saiteja05`
- **Password:** a GitHub **personal access token** (not your GitHub password)

Create token: https://github.com/settings/tokens/new → scope **repo**

## Missing `.env.example`?

If your zip was old, create it:

```bash
cat > .env.example << 'EOF'
STORE=file
OPERATOR_PIN=0909
EOF
cp .env.example .env
```

Or skip — defaults work without `.env`.

## Run the app

```bash
npm install
npm run dev
```

http://localhost:3000 — PIN **0909**

## GitHub Pages (optional)

After push: **Settings → Pages → Build and deployment → GitHub Actions**

Live at: **https://saiteja05.github.io/battle-of-the-paddles/**

## What gets committed

Included: source, tests, logos, sample CSV, GitHub Actions workflow  
Excluded (`.gitignore`): `node_modules/`, `.next/`, `.env`, `data/tournament.json`
