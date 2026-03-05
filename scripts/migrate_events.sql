-- ═══════════════════════════════════════════════════════════════
--  Migration: add per-event RSVP support
--  Apply via (from /worker directory):
--    wrangler d1 execute wedding-rsvp --remote --file=../scripts/migrate_events.sql
--  Note: D1 does not support BEGIN TRANSACTION — it auto-wraps each file.
-- ═══════════════════════════════════════════════════════════════

-- 1. Add events column to guests (default: all three events)
ALTER TABLE guests ADD COLUMN events TEXT NOT NULL DEFAULT 'mehndi,shaadi,walima';

-- 2. Rename old rsvps table
ALTER TABLE rsvps RENAME TO rsvps_old;

-- 3. Create new rsvps table with (guest_id, event) composite unique key
CREATE TABLE rsvps (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id       INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event          TEXT    NOT NULL,
  attending      INTEGER NOT NULL DEFAULT 0,
  meal_choice    TEXT,
  dietary_notes  TEXT,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(guest_id, event)
);

-- 4. Migrate existing responses (treat as shaadi)
INSERT INTO rsvps (guest_id, event, attending, meal_choice, dietary_notes, updated_at)
SELECT guest_id, 'shaadi', attending, meal_choice, dietary_notes, updated_at
FROM rsvps_old;

-- 5. Drop old table and stale index
DROP TABLE rsvps_old;
DROP INDEX IF EXISTS idx_rsvps_guest_id;

-- 6. Recreate index
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_event ON rsvps(guest_id, event);
