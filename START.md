# Battle of the Paddles — Local Production Deploy

Run the app in **production mode** on the machine where the command runs (VM or laptop).

## Quick start

```bash
cd /agent
npm install
npm run build
STORE=file OPERATOR_PIN=0909 npm start -- -H 0.0.0.0 -p 3000
```

Or use the helper script:

```bash
cd /agent
npm install
./scripts/start-local.sh
```

Or the npm script:

```bash
cd /agent
npm install
npm run start:local
```

Open **http://localhost:3000** and enter PIN **0909**.

## Environment

| Variable       | Default | Purpose                          |
|----------------|---------|----------------------------------|
| `STORE`        | `file`  | Persistence backend (`file` or `mongo`) |
| `OPERATOR_PIN` | `0909`  | Operator gate PIN                |
| `HOST`         | `0.0.0.0` | Bind address (script only)     |
| `PORT`         | `3000`  | Listen port (script only)        |

## Remote VM access

`localhost` on your laptop is **not** the VM. Use one of:

1. **Cursor / VS Code port forwarding** — forward port `3000`, then open the forwarded local URL.
2. **SSH tunnel** — `ssh -L 3000:localhost:3000 user@<vm-host>`
3. **Public tunnel** (after prod server is running):

   ```bash
   npx localtunnel --port 3000
   # or
   npx cloudflared tunnel --url http://localhost:3000
   ```

## Verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -s http://localhost:3000/api/auth
curl -s -X POST http://localhost:3000/api/auth -H 'Content-Type: application/json' -d '{"pin":"0909"}'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/api/event
```

## Docker (optional)

Mongo only (file store, no Docker app required):

```bash
docker compose up -d mongo
```

Full stack with app container:

```bash
docker compose up -d
```

App will be at http://localhost:3000 with PIN 0909.

## Tests

```bash
npm test
```
