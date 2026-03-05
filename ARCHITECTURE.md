# Wedding Website + RSVP System — Architecture

## Overview

```
Browser (GitHub Pages)
   │  GET /rsvp/?t=TOKEN
   │  fetch /api/invite?t=TOKEN
   │  POST /api/rsvp?t=TOKEN
   ▼
Cloudflare Worker (CORS-locked)
   │  SHA-256(TOKEN) → lookup invites
   │  rate_limits table guard
   │  upsert rsvps
   ▼
Cloudflare D1 (SQLite)
   invites / guests / rsvps / rate_limits

Admin flow (local, never committed):
  CSV of guests
   → generate_tokens.mjs
       → import.csv  (token_hash, no raw token)
       → sms.csv     (raw token, .gitignored)
   → import_to_d1.mjs (load import.csv → D1)
   → send_sms_twilio.mjs (send from sms.csv)
```

---

## Token Security Model

| Step | Detail |
|------|--------|
| Generation | `crypto.getRandomValues(20 bytes)` → base64url → ~27 chars |
| Link | `https://DOMAIN/rsvp/?t=<raw_token>` |
| Storage | DB stores `SHA-256(raw_token)` as 64-char hex; raw token NEVER in DB/repo |
| Lookup | Worker computes SHA-256 of incoming token param, queries by hash |
| Revocation | Delete row from `invites` |
| sms.csv | .gitignored; contains phone + raw token for Twilio send |
| import.csv | Safe to commit: contains only hashes, labels, names |

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/invite?t=TOKEN` | token | Fetch invite + guests + existing RSVPs |
| POST | `/api/rsvp?t=TOKEN` | token | Submit/update RSVPs for household |

### GET /api/invite Response
```json
{
  "household_label": "Smith Family",
  "guests": [
    { "id": 1, "full_name": "Alice Smith" },
    { "id": 2, "full_name": "Bob Smith" }
  ],
  "rsvps": [
    { "guest_id": 1, "attending": true, "meal_choice": "chicken", "dietary_notes": "" }
  ]
}
```

### POST /api/rsvp Body
```json
{
  "responses": [
    { "guest_id": 1, "attending": true, "meal_choice": "vegetarian", "dietary_notes": "no nuts" },
    { "guest_id": 2, "attending": false, "meal_choice": null, "dietary_notes": null }
  ]
}
```

---

## Database Schema

See `schema.sql`. Tables:
- `invites` — one row per household
- `guests` — one or more rows per invite
- `rsvps` — upserted per guest submission
- `rate_limits` — sliding window per token_hash

---

## Rate Limiting

10-minute fixed window per `token_hash`. If `count >= 10` within window, reject with HTTP 429.
Window resets automatically when `window_start` is > 10 min old.

---

## CORS Policy

Worker `ALLOWED_ORIGINS` env var (comma-separated). Defaults to `https://YOURDOMAIN.github.io`.
Preflight returns `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`.

---

## Frontend Pages & Routes

| URL | File | Description |
|-----|------|-------------|
| `/` | `maryam/index.html` | Hero landing page |
| `/schedule/` | `maryam/schedule/index.html` | Wedding day schedule |
| `/rsvp/` | `maryam/rsvp/index.html` | RSVP form (token required) |

---

## Animation Strategy

Library: **GSAP 3** via CDN with ScrollTrigger plugin.
Fallback: CSS transitions only if GSAP unavailable.
Reduced motion: JS checks `window.matchMedia('(prefers-reduced-motion: reduce)')` before registering GSAP timelines. CSS also has `@media (prefers-reduced-motion: reduce)` rules.

### Component Hooks (CSS IDs / Classes)

| Selector | Animation |
|----------|-----------|
| `#hero` | Wrapper for hero section |
| `.hero-floral` | Fade in from top, scale 0.97→1 |
| `.hero-names` | Fade in + slide up, stagger after floral |
| `.hero-tagline` | Fade in after names |
| `.hero-countdown` | Fade in, counter tick-up on load |
| `#main-nav` | Fade in after tagline |
| `.nav-link` | Individual stagger |
| `.nav-indicator` | Sliding underline bar (CSS transform) |
| `#main-grid` | Reveal on scroll (ScrollTrigger) |
| `.main-left` | Slide in from left |
| `.main-right` | Slide in from right |
| `.rsvp-btn` | Hover: translateY(-3px) + box-shadow + shine pseudo-element sweep |
| `.photo-card` | Mouse-enter tilt (max ±8deg) via JS, disabled on mobile/reduced-motion |
| `.schedule-block` | ScrollTrigger stagger reveal from bottom |
| `.rsvp-guest-card` | Stagger fade in after data loads |
| `.loading-skeleton` | Shimmer animation while fetching |

---

## File Tree

```
/
├── maryam/
│   ├── index.html              ← landing page
│   ├── schedule/
│   │   └── index.html          ← schedule page
│   ├── rsvp/
│   │   └── index.html          ← RSVP page
│   ├── css/
│   │   └── styles.css          ← shared CSS (variables, layout, components)
│   ├── js/
│   │   ├── home.js             ← landing animations + countdown
│   │   ├── schedule.js         ← schedule scroll reveals
│   │   └── rsvp.js             ← RSVP fetch + form logic
│   └── assets/
│       ├── floral-header.svg   ← placeholder floral graphic
│       ├── photo-main.svg      ← placeholder main photo
│       └── photo-small.svg     ← placeholder small photo
├── worker/
│   ├── src/
│   │   └── index.ts            ← Cloudflare Worker (all endpoints)
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml
├── scripts/
│   ├── generate_tokens.mjs     ← CSV → import.csv + sms.csv
│   ├── send_sms_twilio.mjs     ← send from sms.csv via Twilio
│   └── import_to_d1.mjs        ← import.csv → D1 SQL
├── schema.sql                  ← D1 schema
├── ARCHITECTURE.md
└── README.md
```

---

## Acceptance Tests (Manual Checklist)

- [ ] `/` loads with all animations playing (or gracefully skipped on reduced-motion)
- [ ] Countdown shows correct days to wedding date
- [ ] Nav underline slides between active items
- [ ] RSVP button hover shows lift + shine
- [ ] Photos tilt on mouse move (desktop), flat on mobile
- [ ] `GET /api/invite?t=BADTOKEN` returns 404, no details
- [ ] `GET /api/invite?t=GOODTOKEN` returns household + guests
- [ ] `POST /api/rsvp?t=GOODTOKEN` updates RSVPs, idempotent on re-submit
- [ ] Rate limit: 11th request within 10 min → 429
- [ ] CORS: request from allowed origin → 200; from other origin → blocked
- [ ] `sms.csv` in .gitignore; not staged
- [ ] `import.csv` contains no raw tokens
- [ ] `schema.sql` has all 4 tables with indices
- [ ] Reduced-motion: page loads without any position transforms or parallax
