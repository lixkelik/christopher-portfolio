# Portfolio AI Worker

Cloudflare Worker that proxies chat requests to Groq's free LLM API, keeping the API key server-side.

## Deploy (production)

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY     # paste your gsk_… key
npx wrangler deploy
```

Get a free Groq key at https://console.groq.com/keys.

After deploy you'll get a URL like `https://christopheratika.<subdomain>.workers.dev`. Add it to:

- `.env.local` (for local Vite builds): `VITE_AI_ENDPOINT=https://...`
- GitHub repo → Settings → Secrets → Actions: `VITE_AI_ENDPOINT`

Edit `wrangler.toml` to change `ALLOWED_ORIGIN` (CORS) or `GROQ_MODEL`, then re-run `npx wrangler deploy`.

## Run locally

```bash
cd worker
cp .dev.vars.example .dev.vars   # then put your real GROQ_API_KEY in .dev.vars
npx wrangler dev                 # http://localhost:8787
```

Point your dev portfolio at it via `.env.local` in the repo root:

```
VITE_AI_ENDPOINT=http://localhost:8787
```

`.dev.vars` is gitignored and overrides `wrangler.toml` vars during `wrangler dev`, so localhost origins are allowed locally without weakening production CORS.
