/**
 * Wedding RSVP · Cloudflare Worker
 * ─────────────────────────────────
 * GET  /api/invite?t=TOKEN  → invite + guests + existing rsvps
 * POST /api/rsvp?t=TOKEN    → upsert rsvp responses
 *
 * Security:
 *  - Token validated via SHA-256 hash lookup; raw token never stored
 *  - CORS locked to ALLOWED_ORIGINS env var
 *  - Rate limited: 10 requests per 10-minute window per token_hash
 *  - All error responses are generic (no schema/data leakage)
 */

export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string; // comma-separated list
  WEDDING_DATE: string;    // YYYY-MM-DD
  DASHBOARD_PIN: string;   // secret — set via wrangler secret put DASHBOARD_PIN
}

// ── Types ──────────────────────────────────────────────────────────

interface InviteRow {
  id: number;
  token_hash: string;
  household_label: string;
  phone_e164: string;
  source_list: string;
  created_at: string;
}

interface GuestRow {
  id: number;
  invite_id: number;
  full_name: string;
  events: string; // comma-separated e.g. "mehndi,shaadi,walima"
}

interface RsvpRow {
  id: number;
  guest_id: number;
  event: string;
  attending: number;
  meal_choice: string | null;
  dietary_notes: string | null;
  updated_at: string;
}

interface RsvpResponse {
  guest_id: number;
  event: string;
  attending: boolean;
  meal_choice: string | null;
  dietary_notes: string | null;
}

interface RateLimitRow {
  token_hash: string;
  window_start: string;
  count: number;
}

// ── Helpers ────────────────────────────────────────────────────────

/** Compute SHA-256 of a string, return lower-case hex. */
async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Validate token param: must be 20–64 printable ASCII chars (base64url). */
function isValidTokenShape(t: string | null): t is string {
  if (!t) return false;
  return /^[A-Za-z0-9_\-]{20,64}$/.test(t);
}

/** Build a CORS-aware JSON response. */
function jsonResponse(
  body: unknown,
  status: number,
  corsOrigin: string | null
): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  };
  if (corsOrigin) {
    headers["Access-Control-Allow-Origin"] = corsOrigin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    headers["Access-Control-Max-Age"] = "86400";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

/** Return the allowed CORS origin for this request, or null if not allowed. */
function getAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  // In local dev (no Origin header), allow all
  if (!origin) return "*";
  return allowed.includes(origin) ? origin : null;
}

// ── Rate Limiting (D1) ─────────────────────────────────────────────

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

async function checkRateLimit(
  db: D1Database,
  tokenHash: string
): Promise<boolean> {
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - RATE_LIMIT_WINDOW_SECONDS * 1000);

  const row = await db
    .prepare("SELECT token_hash, window_start, count FROM rate_limits WHERE token_hash = ?")
    .bind(tokenHash)
    .first<RateLimitRow>();

  if (!row) {
    // First request — insert
    await db
      .prepare(
        "INSERT INTO rate_limits (token_hash, window_start, count) VALUES (?, ?, 1)"
      )
      .bind(tokenHash, now.toISOString())
      .run();
    return true;
  }

  const windowStart = new Date(row.window_start);
  if (windowStart < windowCutoff) {
    // Window expired — reset
    await db
      .prepare(
        "UPDATE rate_limits SET window_start = ?, count = 1 WHERE token_hash = ?"
      )
      .bind(now.toISOString(), tokenHash)
      .run();
    return true;
  }

  if (row.count >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }

  // Increment
  await db
    .prepare("UPDATE rate_limits SET count = count + 1 WHERE token_hash = ?")
    .bind(tokenHash)
    .run();
  return true;
}

// ── Route Handlers ─────────────────────────────────────────────────

/** GET /api/invite?t=TOKEN */
async function handleGetInvite(
  request: Request,
  env: Env,
  tokenHash: string,
  corsOrigin: string
): Promise<Response> {
  // Rate limit
  const allowed = await checkRateLimit(env.DB, tokenHash);
  if (!allowed) {
    return jsonResponse({ error: "Too many requests. Please try again later." }, 429, corsOrigin);
  }

  // Lookup invite
  const invite = await env.DB
    .prepare("SELECT id, household_label FROM invites WHERE token_hash = ?")
    .bind(tokenHash)
    .first<Pick<InviteRow, "id" | "household_label">>();

  if (!invite) {
    return jsonResponse({ error: "Invalid or expired link." }, 404, corsOrigin);
  }

  // Fetch guests
  const guestRows = await env.DB
    .prepare("SELECT id, full_name, events FROM guests WHERE invite_id = ? ORDER BY id ASC")
    .bind(invite.id)
    .all<Pick<GuestRow, "id" | "full_name" | "events">>();

  const guests = guestRows.results ?? [];
  const guestIds = guests.map((g) => g.id);

  // Fetch existing RSVPs
  let rsvps: Pick<RsvpRow, "guest_id" | "event" | "attending" | "meal_choice" | "dietary_notes">[] = [];
  if (guestIds.length > 0) {
    const placeholders = guestIds.map(() => "?").join(", ");
    const rsvpRows = await env.DB
      .prepare(
        `SELECT guest_id, event, attending, meal_choice, dietary_notes FROM rsvps WHERE guest_id IN (${placeholders})`
      )
      .bind(...guestIds)
      .all<Pick<RsvpRow, "guest_id" | "event" | "attending" | "meal_choice" | "dietary_notes">>();
    rsvps = (rsvpRows.results ?? []).map((r) => ({
      ...r,
      attending: Boolean(r.attending) as unknown as number,
    }));
  }

  return jsonResponse(
    {
      household_label: invite.household_label,
      // Return events as array per guest
      guests: guests.map(g => ({
        id: g.id,
        full_name: g.full_name,
        events: g.events.split(',').map(e => e.trim()).filter(Boolean),
      })),
      rsvps,
    },
    200,
    corsOrigin
  );
}

/** POST /api/rsvp?t=TOKEN */
async function handlePostRsvp(
  request: Request,
  env: Env,
  tokenHash: string,
  corsOrigin: string
): Promise<Response> {
  // Rate limit
  const allowed = await checkRateLimit(env.DB, tokenHash);
  if (!allowed) {
    return jsonResponse({ error: "Too many requests. Please try again later." }, 429, corsOrigin);
  }

  // Lookup invite
  const invite = await env.DB
    .prepare("SELECT id FROM invites WHERE token_hash = ?")
    .bind(tokenHash)
    .first<Pick<InviteRow, "id">>();

  if (!invite) {
    return jsonResponse({ error: "Invalid or expired link." }, 404, corsOrigin);
  }

  // Parse body
  let body: { responses?: RsvpResponse[] };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400, corsOrigin);
  }

  if (!Array.isArray(body.responses) || body.responses.length === 0) {
    return jsonResponse({ error: "No responses provided." }, 400, corsOrigin);
  }

  // Validate all guest_ids belong to this invite and events are valid for that guest
  const guestRows = await env.DB
    .prepare("SELECT id, events FROM guests WHERE invite_id = ?")
    .bind(invite.id)
    .all<Pick<GuestRow, "id" | "events">>();

  const validGuests = new Map((guestRows.results ?? []).map((g) => [
    g.id,
    new Set(g.events.split(',').map(e => e.trim()).filter(Boolean)),
  ]));

  const validEvents = new Set(["mehndi", "shaadi", "walima"]);

  for (const r of body.responses) {
    if (typeof r.guest_id !== "number" || !validGuests.has(r.guest_id)) {
      return jsonResponse({ error: "Invalid guest in request." }, 400, corsOrigin);
    }
    if (typeof r.event !== "string" || !validEvents.has(r.event)) {
      return jsonResponse({ error: "Invalid event." }, 400, corsOrigin);
    }
    if (!validGuests.get(r.guest_id)!.has(r.event)) {
      return jsonResponse({ error: "Guest not invited to this event." }, 403, corsOrigin);
    }
    if (typeof r.attending !== "boolean") {
      return jsonResponse({ error: "Invalid attending value." }, 400, corsOrigin);
    }
    // Validate meal_choice
    const validMeals = ["chicken", "fish", "vegetarian", "vegan", null];
    if (!validMeals.includes(r.meal_choice ?? null)) {
      return jsonResponse({ error: "Invalid meal choice." }, 400, corsOrigin);
    }
    // Clamp dietary_notes to 500 chars
    if (r.dietary_notes && r.dietary_notes.length > 500) {
      r.dietary_notes = r.dietary_notes.slice(0, 500);
    }
  }

  // Upsert RSVPs in a batch (one per guest+event)
  const now = new Date().toISOString();
  const stmts = body.responses.map((r) =>
    env.DB
      .prepare(
        `INSERT INTO rsvps (guest_id, event, attending, meal_choice, dietary_notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(guest_id, event) DO UPDATE SET
           attending = excluded.attending,
           meal_choice = excluded.meal_choice,
           dietary_notes = excluded.dietary_notes,
           updated_at = excluded.updated_at`
      )
      .bind(
        r.guest_id,
        r.event,
        r.attending ? 1 : 0,
        r.meal_choice ?? null,
        r.dietary_notes ?? null,
        now
      )
  );

  // D1 batch
  try {
    await env.DB.batch(stmts);
  } catch (err) {
    console.error("DB batch error:", err);
    return jsonResponse({ error: "Failed to save. Please try again." }, 500, corsOrigin);
  }

  return jsonResponse({ success: true }, 200, corsOrigin);
}

/** GET /api/admin/rsvps — protected by DASHBOARD_PIN secret */
async function handleGetAdminRsvps(
  request: Request,
  env: Env,
  corsOrigin: string
): Promise<Response> {
  const auth = request.headers.get("Authorization") ?? "";
  const pin = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!pin || pin !== env.DASHBOARD_PIN) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsOrigin);
  }

  const rows = await env.DB
    .prepare(`
      SELECT
        i.household_label,
        i.phone_e164,
        i.source_list,
        g.id as guest_id,
        g.full_name,
        g.events as invited_events,
        r.event,
        CASE WHEN r.attending = 1 THEN 'YES' WHEN r.attending = 0 THEN 'NO' ELSE NULL END as attending,
        r.updated_at
      FROM guests g
      JOIN invites i ON i.id = g.invite_id
      LEFT JOIN rsvps r ON r.guest_id = g.id
      ORDER BY i.household_label, g.full_name, r.event
    `)
    .all();

  return jsonResponse({ rsvps: rows.results ?? [] }, 200, corsOrigin);
}
/** PATCH /api/admin/rsvp — manually set or clear a guest+event response */
async function handlePatchAdminRsvp(
  request: Request,
  env: Env,
  corsOrigin: string
): Promise<Response> {
  const auth = request.headers.get("Authorization") ?? "";
  const pin = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!pin || pin !== env.DASHBOARD_PIN) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsOrigin);
  }

  let body: { guest_id?: number; event?: string; attending?: boolean | null };
  try { body = await request.json(); } catch {
    return jsonResponse({ error: "Invalid request body." }, 400, corsOrigin);
  }

  const { guest_id, event, attending } = body;
  if (typeof guest_id !== "number" || typeof event !== "string") {
    return jsonResponse({ error: "guest_id and event are required." }, 400, corsOrigin);
  }
  const validEvents = new Set(["mehndi", "shaadi", "walima"]);
  if (!validEvents.has(event)) {
    return jsonResponse({ error: "Invalid event." }, 400, corsOrigin);
  }

  // attending === null means delete (reset to pending)
  if (attending === null || attending === undefined) {
    await env.DB.prepare("DELETE FROM rsvps WHERE guest_id = ? AND event = ?")
      .bind(guest_id, event).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO rsvps (guest_id, event, attending, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(guest_id, event) DO UPDATE SET
         attending = excluded.attending,
         updated_at = excluded.updated_at`
    ).bind(guest_id, event, attending ? 1 : 0, new Date().toISOString()).run();
  }

  return jsonResponse({ success: true }, 200, corsOrigin);
}
// ── Main Handler ───────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── CORS origin check
    const corsOrigin = getAllowedOrigin(request, env);

    // ── Handle CORS preflight
    if (request.method === "OPTIONS") {
      if (corsOrigin) {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": corsOrigin,
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });
      }
      return new Response("Forbidden", { status: 403 });
    }

    // ── Reject non-allowed origins for actual requests
    if (!corsOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    // ── Route: GET /api/invite
    if (path === "/api/invite" && request.method === "GET") {
      const tokenParam = url.searchParams.get("t");
      if (!isValidTokenShape(tokenParam)) {
        return jsonResponse({ error: "Invalid or expired link." }, 400, corsOrigin);
      }
      const tokenHash = await sha256Hex(tokenParam);
      return handleGetInvite(request, env, tokenHash, corsOrigin);
    }

    // ── Route: POST /api/rsvp
    if (path === "/api/rsvp" && request.method === "POST") {
      const tokenParam = url.searchParams.get("t");
      if (!isValidTokenShape(tokenParam)) {
        return jsonResponse({ error: "Invalid or expired link." }, 400, corsOrigin);
      }
      const tokenHash = await sha256Hex(tokenParam);
      return handlePostRsvp(request, env, tokenHash, corsOrigin);
    }

    // ── Route: GET /api/admin/rsvps
    if (path === "/api/admin/rsvps" && request.method === "GET") {
      return handleGetAdminRsvps(request, env, corsOrigin);
    }

    // ── Route: PATCH /api/admin/rsvp
    if (path === "/api/admin/rsvp" && request.method === "PATCH") {
      return handlePatchAdminRsvp(request, env, corsOrigin);
    }

    // ── 404 for everything else
    return jsonResponse({ error: "Not found." }, 404, corsOrigin);
  },
};
