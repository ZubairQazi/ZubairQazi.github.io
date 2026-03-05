-- ═══════════════════════════════════════════════════════
--  Wedding RSVP · Cloudflare D1 Schema
--  Apply via: wrangler d1 execute wedding-rsvp --file=../../schema.sql
--  (run from /worker directory)
-- ═══════════════════════════════════════════════════════

-- One row per household invite
CREATE TABLE IF NOT EXISTS invites (
  id             INTEGER  PRIMARY KEY AUTOINCREMENT,
  token_hash     TEXT     NOT NULL UNIQUE,   -- SHA-256 hex of raw token
  household_label TEXT    NOT NULL,          -- "Smith Family" shown in UI
  phone_e164     TEXT     NOT NULL,          -- +15551234567
  created_at     TEXT     NOT NULL DEFAULT (datetime('now'))
);

-- One or more guests per invite
CREATE TABLE IF NOT EXISTS guests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  invite_id  INTEGER NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  full_name  TEXT    NOT NULL,
  events     TEXT    NOT NULL DEFAULT 'mehndi,shaadi,walima'  -- comma-separated invited events
);

-- One row per guest per event (upsert on guest_id + event)
CREATE TABLE IF NOT EXISTS rsvps (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id       INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event          TEXT    NOT NULL,             -- "mehndi"|"shaadi"|"walima"
  attending      INTEGER NOT NULL DEFAULT 0,  -- 1=yes, 0=no
  meal_choice    TEXT,                         -- "chicken"|"fish"|"vegetarian"|"vegan"|null
  dietary_notes  TEXT,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(guest_id, event)
);

-- Rate limiting: fixed 10-min window per token_hash
CREATE TABLE IF NOT EXISTS rate_limits (
  token_hash   TEXT    NOT NULL PRIMARY KEY,
  window_start TEXT    NOT NULL,  -- ISO datetime of window start
  count        INTEGER NOT NULL DEFAULT 0
);

-- ── Indices ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invites_token_hash  ON invites(token_hash);
CREATE INDEX IF NOT EXISTS idx_guests_invite_id    ON guests(invite_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_event   ON rsvps(guest_id, event);
CREATE INDEX IF NOT EXISTS idx_ratelimits_hash     ON rate_limits(token_hash);
