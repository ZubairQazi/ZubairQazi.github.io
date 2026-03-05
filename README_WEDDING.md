# 💍 Wedding Website + RSVP System

A polished, fully private wedding website with a Cloudflare Worker + D1 backend for SMS-based household RSVP. Guest list never touches the browser.

---

## Architecture at a Glance

```
Browser (GitHub Pages)       Cloudflare Worker              D1 (SQLite)
/maryam/                   /worker/                       schema.sql
  index.html      ──GET──▶  /api/invite?t=TOKEN ──▶  invites + guests
  rsvp/index.html ──POST──▶ /api/rsvp?t=TOKEN  ──▶  rsvps (upsert)

Admin (local only, never committed):
  generate_tokens.mjs  →  import.csv + sms.csv
  import_to_d1.mjs     →  D1 inserts
  send_sms_twilio.mjs  →  Twilio SMS
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for full design docs.

---

## Repository Structure

```
/
├── maryam/            ← Static site (GitHub Pages)
│   ├── index.html
│   ├── schedule/index.html
│   ├── rsvp/index.html
│   ├── css/styles.css
│   ├── js/home.js · schedule.js · rsvp.js
│   └── assets/          ← Replace SVG placeholders with real photos
├── worker/              ← Cloudflare Worker (TypeScript)
│   ├── src/index.ts
│   ├── wrangler.toml    ← EDIT: set D1 database_id + ALLOWED_ORIGINS
│   └── package.json
├── scripts/             ← Admin tools (Node.js ESM, no framework)
│   ├── generate_tokens.mjs
│   ├── send_sms_twilio.mjs
│   └── import_to_d1.mjs
└── schema.sql           ← D1 database schema
```

---

## Quick Start

### 1. Customize the wedding details

Edit these files with your actual info:

| File | What to change |
|------|---------------|
| `maryam/index.html` | Names, date, location |
| `maryam/schedule/index.html` | Schedule times + descriptions |
| `maryam/js/home.js` | `WEDDING_DATE` constant (line ~5) |
| `maryam/js/rsvp.js` | `API_BASE` URL (line ~15) |
| `worker/wrangler.toml` | `database_id`, `ALLOWED_ORIGINS`, `WEDDING_DATE` |

Replace placeholder images:
- `maryam/assets/floral-header.svg` → your floral/calligraphy header image
- `maryam/assets/photo-main.svg` → your main engagement/couple photo
- `maryam/assets/photo-small.svg` → your secondary photo

### 2. Set up Cloudflare D1

```bash
# Install Wrangler globally (or use npx)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create the D1 database
wrangler d1 create wedding-rsvp
# → Copy the database_id to worker/wrangler.toml

# Apply schema
cd worker
wrangler d1 execute wedding-rsvp --file=../schema.sql

# Verify
wrangler d1 execute wedding-rsvp --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 3. Deploy the Cloudflare Worker

```bash
cd worker
npm install
npm run deploy
# → Note the worker URL: https://wedding-rsvp-worker.YOURNAME.workers.dev
```

Update `ALLOWED_ORIGINS` in `wrangler.toml` to your GitHub Pages URL:
```toml
[vars]
ALLOWED_ORIGINS = "https://YOURUSERNAME.github.io"
```

Then redeploy: `npm run deploy`

### 4. Deploy the frontend to GitHub Pages

Option A — deploy the whole repo and set Pages source to `/frontend`:
```
GitHub → Repo Settings → Pages → Branch: feature/wedding-site-rsvp → Folder: /frontend
```

Option B — copy `maryam/` to your `gh-pages` branch root.

### 5. Import guest list

Prepare `scripts/guests.csv` (gitignored — see template below):
```csv
household_label,phone_e164,guest_name
"Smith Family",+15551234567,Alice Smith
"Smith Family",+15551234567,Bob Smith
"Jones Family",+15559876543,Carol Jones
```

Run token generation:
```bash
node scripts/generate_tokens.mjs \
  --input=scripts/guests.csv \
  --base-url=https://YOURUSERNAME.github.io
```

This writes:
- `scripts/import.csv` — safe to keep; contains token hashes (no raw tokens)
- `scripts/sms.csv` — **GITIGNORED** — contains raw RSVP links

Import to D1:
```bash
node scripts/import_to_d1.mjs --output=scripts/seed.sql
cd worker
wrangler d1 execute wedding-rsvp --file=../scripts/seed.sql
# For remote deploy, remove --local flag
```

### 6. Send RSVP links via Twilio

```bash
# Export Twilio credentials
export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export TWILIO_AUTH_TOKEN=your_auth_token_here
export TWILIO_FROM=+15550001234

# Install Twilio SDK (scripts-local, not committed)
cd scripts
npm init -y
npm install twilio
cd ..

# Dry run first — preview all messages
node scripts/send_sms_twilio.mjs --dry-run

# Send for real
node scripts/send_sms_twilio.mjs --confirm
```

---

## Local Development

### Worker (local)
```bash
cd worker
npm install

# Create local D1 and apply schema
wrangler d1 execute wedding-rsvp --local --file=../schema.sql

# Start local dev server (http://localhost:8787)
npm run dev
```

### Frontend
Open `maryam/index.html` in a browser, or use a simple server:
```bash
npx serve frontend
```

Update `API_BASE` in `maryam/js/rsvp.js` to `http://localhost:8787` during development.

---

## Customization

### Change meal options
Edit `MEAL_OPTIONS` array in `maryam/js/rsvp.js`. Update validation in `worker/src/index.ts` (`validMeals` array).

### Change RSVP deadline
Update the deadline text in `maryam/rsvp/index.html`.

### Change wedding date
- `maryam/js/home.js` → `WEDDING_DATE` constant
- `worker/wrangler.toml` → `WEDDING_DATE` var

### Add a custom domain
1. Set custom domain in GitHub Pages settings
2. Add to `ALLOWED_ORIGINS` in `wrangler.toml`
3. Redeploy worker

---

## Security Notes

| Concern | Mitigation |
|---------|-----------|
| Guest list in browser | Never shipped — only returned per valid token |
| Raw token exposure | Never stored in DB; only SHA-256 hash stored |
| Token brute force | Tokens are 20 random bytes (~160 bits entropy) |
| Rate limiting | 10 requests per 10-min window per token |
| CORS | Locked to specific origin(s) |
| sms.csv leakage | .gitignored; contains raw tokens+phones |
| Open enumeration | 404 returned for any invalid token (no info leak) |

---

## .gitignore (relevant additions)

```
scripts/sms.csv        # Raw RSVP tokens + phone numbers
scripts/*.sms.csv
scripts/node_modules/
worker/node_modules/
.env
worker/.dev.vars
```
