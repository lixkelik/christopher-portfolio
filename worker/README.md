# Portfolio AI Worker

Cloudflare Worker that proxies chat requests to a fallback chain of free LLM
providers, keeping all API keys server-side.

## Provider chain

Providers are tried in order. On rate-limit (HTTP 429) or 5xx errors, the
worker falls through to the next one. The successful provider's name is
included in the response as `_provider` for debugging.

| # | Provider | Model (default) | Auth |
|---|---|---|---|
| 1 | Groq | `llama-3.3-70b-versatile` | `GROQ_API_KEY` (required) |
| 2 | Cloudflare Workers AI | `@cf/google/gemma-4-26b-a4b-it` | `[ai]` binding — no key |
| 3 | Cerebras | `llama3.1-8b` | `CEREBRAS_API_KEY` (optional) |

Models are overridable via `GROQ_MODEL`, `CEREBRAS_MODEL`, `CF_AI_MODEL` in
`wrangler.toml`.

## Deploy (production)

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY        # required — paste your gsk_… key
npx wrangler secret put CEREBRAS_API_KEY    # optional — fallback provider
npx wrangler deploy
```

Free keys:

- Groq: https://console.groq.com/keys
- Cerebras: https://cloud.cerebras.ai/
- Cloudflare Workers AI: nothing to do — the `[ai]` binding in `wrangler.toml`
  attaches automatically (10k neurons/day on the Workers free plan).

After deploy you'll get a URL like `https://christopheratika.<subdomain>.workers.dev`. Add it to:

- `.env.local` (for local Vite builds): `VITE_AI_ENDPOINT=https://...`
- GitHub repo → Settings → Secrets → Actions: `VITE_AI_ENDPOINT`

Edit `wrangler.toml` to change `ALLOWED_ORIGIN` (CORS) or any model var, then
re-run `npx wrangler deploy`.

## Run locally

```bash
cd worker
cp .dev.vars.example .dev.vars   # then put your real keys in .dev.vars
npx wrangler dev                 # http://localhost:8787
```

Point your dev portfolio at it via `.env.local` in the repo root:

```
VITE_AI_ENDPOINT=http://localhost:8787
```

`.dev.vars` is gitignored and overrides `wrangler.toml` vars during
`wrangler dev`, so localhost origins are allowed locally without weakening
production CORS.

## Updating the knowledge base

The portfolio knowledge base is bundled into the worker at build time (see
`src/context.ts`), so the browser never sends it. Whenever you edit any of
`src/data/*.json` (profile, experiences, projects, skills, achievements,
certifications, education, toolkit), run:

```bash
cd worker && npx wrangler deploy
```

### Lean vs. rich context

`src/context.ts` ships with a token-trimmed context (~1.7k tokens vs ~2.4k
rich) so requests stay well under Groq's 12k TPM free-tier limit. Each
trimmed section has a `[LEAN]` comment with a commented-out richer block
beneath it — swap them and redeploy if you want fuller answers. Same idea for
`SYSTEM_PROMPT` in `src/index.ts`.

## API shape

**Request** (POST /):

```json
{ "messages": [{ "role": "user" | "assistant", "content": "string" }, ...] }
```

**Response** (OpenAI-compatible chat completion):

```json
{
  "choices": [{ "message": { "role": "assistant", "content": "…" } }],
  "_provider": "groq" | "cerebras" | "cloudflare"
}
```

On total failure: `503 { "error": "All providers failed", "attempts": ["groq:429", "cerebras:429", "cloudflare:500"] }`.

## Conversation logging (D1)

Every chat request is logged to a free Cloudflare D1 database. The IP is
SHA-256 hashed before storage (no plaintext PII), and writes happen via
`ctx.waitUntil` so they never delay the user's response. If the `LOGS`
binding is missing the worker silently no-ops, so local dev still works.

### One-time setup

```bash
cd worker

# 1. Create the database. Copy the printed `database_id` into wrangler.toml
#    (replace REPLACE_WITH_D1_ID).
npx wrangler d1 create portfolio-logs

# 2. Apply migrations to production.
npx wrangler d1 migrations apply portfolio-logs

# 3. (Optional) Apply locally too if you want logs from `wrangler dev --local`.
npx wrangler d1 migrations apply portfolio-logs --local

# 4. Redeploy the worker so the new binding takes effect.
npx wrangler deploy
```

### Inspecting logs

Last 20 prompts:

```bash
npx wrangler d1 execute portfolio-logs --command \
  "SELECT datetime(ts,'unixepoch') AS at, country, provider, status, latency_ms, substr(user_msg,1,80) AS msg FROM prompts ORDER BY ts DESC LIMIT 20"
```

Provider mix over the last 24h:

```bash
npx wrangler d1 execute portfolio-logs --command \
  "SELECT provider, COUNT(*) AS n FROM prompts WHERE ts > strftime('%s','now','-1 day') GROUP BY provider"
```

Or browse it in the Cloudflare dashboard → **D1** → `portfolio-logs` → Console.

### Schema

`migrations/0001_init_logs.sql` defines a single `prompts` table:

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | autoincrement |
| `ts` | INTEGER | unix seconds (UTC) |
| `ip_hash` | TEXT | SHA-256 hex of the visitor IP |
| `country` | TEXT | from `CF-IPCountry` header |
| `user_msg` | TEXT | last user message (≤250 chars) |
| `assistant` | TEXT | bot reply (NULL on failure) |
| `provider` | TEXT | `groq` / `cloudflare` / `cerebras` / NULL |
| `status` | INTEGER | final HTTP status returned |
| `attempts` | TEXT | JSON array, e.g. `["groq:429","cloudflare:200"]` |
| `latency_ms` | INTEGER | end-to-end worker time |
| `turn_count` | INTEGER | conversation depth |

Storage is effectively free at portfolio scale (D1 free tier: 5 GB total,
100k writes/day, 5M reads/day).
