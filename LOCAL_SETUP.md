# Battle of the Paddles — Run on Your Machine

Run the tournament app **locally on your laptop**. No VM, no tunnels, no Docker, no MongoDB required for event night.

Tournament data is saved to `data/tournament.json` on disk — works fully offline.

## Get the code

**Option A — Git clone** (after you push this repo to GitHub):

```bash
git clone <your-repo-url>
cd battle-of-the-paddles
```

**Option B — Copy the folder** from a Cursor agent run:

Download or copy the `/agent` project folder to your machine, then:

```bash
cd battle-of-the-paddles   # or whatever you named the folder
```

If you do not have a git remote yet, copy the folder from Cursor agent artifacts or push to your own GitHub and clone locally.

## Requirements

- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- npm (included with Node)

Check your version:

```bash
node -v   # should be v18.0.0 or higher
```

## Quick start (Mac / Linux)

```bash
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:3000** and enter PIN **`0909`**.

## Quick start (Windows)

In PowerShell or Command Prompt:

```powershell
npm install
copy .env.example .env
npm run dev
```

Open **http://localhost:3000** and enter PIN **`0909`**.

(Git Bash on Windows works the same as Mac/Linux commands above.)

## Production mode (event night)

Build once, then run the production server:

```bash
npm install
cp .env.example .env
npm run build
npm run start:local
```

Or without the helper script:

```bash
npm run build
STORE=file OPERATOR_PIN=0909 npm start
```

`npm run start:local` runs `scripts/start-local.sh` (Mac/Linux/Git Bash). It builds if needed, binds to port 3000, and uses the file store.

## Environment (`.env`)

```env
STORE=file
OPERATOR_PIN=0909
# MONGODB_URI=   # optional — only if you later use MongoDB Atlas
```

| Variable       | Default | Purpose                                      |
|----------------|---------|----------------------------------------------|
| `STORE`        | `file`  | `file` = local JSON; `mongo` = Atlas/MongoDB |
| `OPERATOR_PIN` | `0909`  | PIN for setup and board operators            |

## Verify

```bash
npm test
npm run build
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `PORT=3001 npm run dev` then open http://localhost:3001 |
| `EACCES` on port | Use a port above 1024, or run without sudo |
| Data reset | Delete `data/tournament.json` or use **Full reset** in `/setup` |
| Wrong PIN | Set `OPERATOR_PIN` in `.env` and restart the server |

## Optional: MongoDB later

For two operators on separate machines syncing through Atlas, set `MONGODB_URI` and `STORE=mongo` in `.env`. For a single laptop running setup + boards, **`STORE=file` is all you need**.

## Optional: Docker

Docker is **not required**. If you want a container anyway:

```bash
docker compose up -d
```

The compose file defaults to `STORE=file` and mounts `./data` for persistence.
