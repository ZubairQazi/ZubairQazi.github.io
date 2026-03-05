# Subagent G: QA & Hardening Checklist

Run through this before deploy. Check each item manually.

---

## ✅ Security / Data Privacy

- [ ] `scripts/sms.csv` is in `.gitignore` and not staged: `git status scripts/sms.csv` → untracked/ignored
- [ ] `scripts/guests.csv` is in `.gitignore` and not staged
- [ ] `scripts/import.csv` is in `.gitignore` and not staged
- [ ] `worker/.dev.vars` is in `.gitignore`
- [ ] `schema.sql` has NO raw tokens — only token_hash column in invites table
- [ ] `worker/src/index.ts` — search for `rawToken` outside `sha256Hex()` → should not exist
- [ ] CORS: `ALLOWED_ORIGINS` in `wrangler.toml` is set to actual domain(s), not `*`
- [ ] Worker returns generic errors (`"Invalid or expired link."`) — no schema/table names

---

## ✅ Token Integrity

- [ ] `generate_tokens.mjs` uses `crypto.randomBytes(20)` (≥ 160-bit entropy) ✓
- [ ] `generate_tokens.mjs` writes SHA-256 hash to `import.csv` (not raw token) ✓
- [ ] `worker/src/index.ts` → `sha256Hex(tokenParam)` before any DB lookup ✓
- [ ] D1 `invites.token_hash` index created: `idx_invites_token_hash` ✓

---

## ✅ Rate Limiting

- [ ] Worker checks `rate_limits` table before DB guest lookup
- [ ] > 10 requests within 600s for same token → HTTP 429
- [ ] Test: submit same token 11 times rapidly → should see 429 on 11th

---

## ✅ Frontend — Landing Page

- [ ] Countdown shows correct days: open `/` → verify number decreases correctly
- [ ] Countdown gracefully shows 🎉 after wedding date
- [ ] Hero floral image loads (or SVG placeholder shows)
- [ ] Names render in Cormorant Garamond serif font
- [ ] RSVP button: hover shows lift + shadow + shine sweep
- [ ] Photo cards: desktop mouse move causes tilt (check with DevTools pointer device simulation)
- [ ] Nav underline slides on hover via CSS `::after` transition
- [ ] Active nav item has underline on each page

---

## ✅ Frontend — Schedule Page

- [ ] Schedule blocks animate in on scroll (GSAP ScrollTrigger)
- [ ] Timeline vertical line renders
- [ ] All times display correctly
- [ ] nav active = "Schedule"

---

## ✅ Frontend — RSVP Page

- [ ] Loading skeleton shows while fetching
- [ ] Invalid/missing token → error screen (no form shown)
- [ ] Valid token → household name + guest cards appear
- [ ] Attending toggle shows/hides meal + dietary fields with smooth transition
- [ ] Pre-filled with existing RSVP data on re-visit
- [ ] Can submit all guests attending + meal choices → success screen
- [ ] Can submit some attending, some not → success screen
- [ ] Submit with unanswered guest → inline error, card outlined in red, scroll to it
- [ ] Success screen shows correct personalized message
- [ ] "Use same link to resubmit" text present on success screen

---

## ✅ Reduced Motion

- [ ] Set `prefers-reduced-motion: reduce` in OS/browser settings
- [ ] Reload `/` → no parallax tilt, no GSAP transforms — elements just appear
- [ ] CSS shimmer skeleton stops animating
- [ ] Button shine pseudo-elements hidden
- [ ] Schedule blocks appear without scroll animation
- [ ] RSVP guest cards appear without stagger animation

---

## ✅ Responsive / Mobile

- [ ] `/` — two columns collapse to single column at ≤ 768px
- [ ] Nav links wrap gracefully on small screens
- [ ] RSVP form fields full-width on mobile
- [ ] Photo tilt disabled on touch/mobile (pointer: fine check) ✓

---

## ✅ Accessibility

- [ ] All images have `alt` text
- [ ] Headings are semantic (h1 on hero-names, h2 on section heads)
- [ ] Attending toggle uses `role="group"` + aria-label
- [ ] Form labels linked to inputs via `for`/`id`
- [ ] Focus ring visible on all interactive elements (`:focus-visible`)
- [ ] Error/success regions have `role="alert"` + `aria-live`

---

## ✅ Performance

- [ ] Non-critical images use `loading="lazy"`
- [ ] Floral header uses `loading="eager"` (above fold)
- [ ] GSAP scripts use `defer` attribute
- [ ] Google Fonts loaded with `display=swap`
- [ ] No blocking scripts in `<head>`

---

## ✅ Worker (Cloudflare)

- [ ] `wrangler.toml` has correct `database_id` (not placeholder)
- [ ] `ALLOWED_ORIGINS` set to actual GitHub Pages URL
- [ ] `wrangler d1 execute wedding-rsvp --command="SELECT count(*) FROM invites;"` returns expected count
- [ ] `curl https://worker.domain/api/invite?t=INVALID` → 400/404 JSON, no stack trace
- [ ] `curl -X POST https://worker.domain/api/rsvp?t=INVALID` → 400/404 JSON

---

## ✅ Admin Scripts

- [ ] `node scripts/generate_tokens.mjs --input=scripts/guests.csv.template --base-url=https://example.com` → creates `import.csv` + `sms.csv`
- [ ] `import.csv` contains `token_hash` (64-char hex), NOT raw tokens
- [ ] `sms.csv` contains RSVP links (raw tokens in URL)
- [ ] `node scripts/send_sms_twilio.mjs --dry-run` → prints expected messages, 0 Twilio calls
- [ ] `node scripts/import_to_d1.mjs --output=scripts/seed.sql` → valid SQL with INSERT statements

---

## 🔥 Final Checklist Before Go-Live

```bash
# Verify no secrets in repo
git log --oneline | head -20
git show HEAD --stat
grep -r "TWILIO" maryam/ worker/src/  # should be empty
grep -r "rawToken\|raw_token" worker/src/ scripts/import_to_d1.mjs  # should be empty

# Check .gitignore is covering sensitive files
git check-ignore -v scripts/sms.csv      # should output matching rule
git check-ignore -v scripts/guests.csv   # should output matching rule

# Confirm all required files committed
git ls-files maryam/ worker/ scripts/ schema.sql ARCHITECTURE.md
```
