# Avenor API

Backend API for **Avenor**, handling smart-contract interactions, bridge integrations, and supporting services.

### ⚙️ Stack

* TypeScript
* Node.js
* Express
* PostgreSQL

### 🚀 Development

```bash
npm install
npm run dev
```

### 📦 Deploy (frontend + chat API on one origin)

The API also serves the built SPA, so the browser talks to `/api/chat` with no
CORS or separate static host.

```bash
# 1. build the frontend
cd ../Telos-Frontend/telos && npm install && npm run build

# 2. configure the API key (gitignored)
cd ../../Telos-API && cp .env.example .env   # then edit OPEN_ROUTER_SECRET

# 3. run API + Postgres
cd .. && docker compose up --build
```

Open `http://localhost:3000`. `GET /api/chat` reports whether a server-side key
is configured; `POST /api/chat` streams strategy tokens or returns a single
audit verdict when called with `stream: false` and `purpose: "audit"`.

> Free OpenRouter models require no credits, but an account with 0 credits is
> limited to **50 free requests/day**. One strategy needs ~2-4 requests
> (generation, optional repair, audit). Add credits to raise the cap, or point
> `OPEN_ROUTER_MODELS` at a paid model.

> **Avenor — the backend layer connecting applications to on-chain infrastructure.**
