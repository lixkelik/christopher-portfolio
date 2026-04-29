-- Conversation log for the portfolio chat widget.
--
-- One row per chat request. The IP is SHA-256 hashed (no plaintext PII), the
-- user message and assistant reply are stored verbatim so you can review what
-- visitors are asking and how the bot responded.
--
-- Apply with:
--   npx wrangler d1 migrations apply portfolio-logs            # production
--   npx wrangler d1 migrations apply portfolio-logs --local    # local dev

CREATE TABLE IF NOT EXISTS prompts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           INTEGER NOT NULL,                  -- unix seconds (UTC)
  ip_hash      TEXT    NOT NULL,                  -- sha256(ip), hex
  country      TEXT,                              -- CF-IPCountry header
  user_msg     TEXT    NOT NULL,                  -- last user message (capped 250 chars upstream)
  assistant    TEXT,                              -- assistant reply (NULL on failure)
  provider     TEXT,                              -- groq | cloudflare | cerebras | NULL
  status       INTEGER NOT NULL,                  -- final HTTP status returned
  attempts     TEXT,                              -- JSON array, e.g. ["groq:429","cloudflare:200"]
  latency_ms   INTEGER NOT NULL,                  -- end-to-end worker time
  turn_count   INTEGER NOT NULL                   -- how many messages in this conversation
);

CREATE INDEX IF NOT EXISTS prompts_ts_idx       ON prompts (ts DESC);
CREATE INDEX IF NOT EXISTS prompts_provider_idx ON prompts (provider, ts DESC);
CREATE INDEX IF NOT EXISTS prompts_status_idx   ON prompts (status, ts DESC);
