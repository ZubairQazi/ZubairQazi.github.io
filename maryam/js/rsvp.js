/**
 * rsvp.js — RSVP page: per-event attendance with green/red toggles
 * ─────────────────────────────────────────────────────────────────
 * Flow:
 *  1. Read ?t=TOKEN (or ?demo=1 for preview) from URL
 *  2. Fetch GET /api/invite?t=TOKEN
 *  3. Render guest cards with per-event attend/decline toggles
 *  4. On submit: POST /api/rsvp?t=TOKEN  (one response per guest+event)
 *  5. Show success / error state
 *
 * Demo mode: /rsvp/?demo=1  — loads mock data, no API call needed.
 */

// ── Config ─────────────────────────────────────────────────────────
const API_BASE = 'https://wedding-rsvp-worker.zubair-qazi-5b.workers.dev';

const EVENT_META = {
  mehndi: { label: 'Mehndi',  day: 'Thursday, June 11', time: '6:30 PM', address: '340 N Escondido Blvd, Escondido, CA 92025', image: '/maryam/assets/invite-mehndi.png' },
  shaadi: { label: 'Shaadi',  day: 'Friday, June 12',   time: '6:00 PM', address: '4240 La Jolla Village Dr, La Jolla, CA 92037', image: '/maryam/assets/invite-shaadi.png' },
  walima: { label: 'Walima',  day: 'Saturday, June 13', time: '5:30 PM', address: '15575 Jimmy Durante Blvd, Del Mar, CA 92014', image: '/maryam/assets/invite-walima.png' },
};
const EVENT_ORDER = ['mehndi', 'shaadi', 'walima'];

// ── Demo mock data ──────────────────────────────────────────────────
const DEMO_DATA = {
  household_label: 'Ahmed Family',
  guests: [
    { id: 1, full_name: 'Fatima Ahmed',  events: ['mehndi', 'shaadi', 'walima'] },
    { id: 2, full_name: 'Omar Ahmed',    events: ['shaadi', 'walima'] },
    { id: 3, full_name: 'Layla Ahmed',   events: ['mehndi', 'shaadi'] },
  ],
  rsvps: [],
};

// ── Render event blocks on the success screen ───────────────────────
// eventsSet: Set or Array of event keys the household is invited to
function renderSuccessEvents(eventsSet) {
  const container = document.getElementById('rsvp-success-events');
  if (!container) return;
  const invited = EVENT_ORDER.filter(e => eventsSet.has ? eventsSet.has(e) : eventsSet.includes(e));
  if (!invited.length) return;
  container.innerHTML = invited.map(evt => {
    const m = EVENT_META[evt];
    const imgHtml = m.image
      ? `<img class="success-event-img" src="${m.image}" alt="${m.label} Invitation" loading="lazy">`
      : '';
    return `<div class="success-event-block success-event-block--${evt}${m.image ? ' has-invite-img' : ''}">
  ${imgHtml}
  <span class="success-event-name">${m.label}</span>
  <span class="success-event-detail">${m.day} &middot; ${m.time}</span>
  <span class="success-event-address">${m.address}</span>
</div>`;
  }).join('');
}

// ── Helpers ─────────────────────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getToken() {
  return new URLSearchParams(window.location.search).get('t')
    ?? sessionStorage.getItem('rsvp_token')
    ?? null;
}
function isDemo() {
  return new URLSearchParams(window.location.search).get('demo') === '1';
}

function show(id)  { const el = document.getElementById(id); if (el) { el.style.display = '';   el.classList.add('visible');    } }
function hide(id)  { const el = document.getElementById(id); if (el) { el.style.display = 'none'; el.classList.remove('visible'); } }

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── Guest card builder ───────────────────────────────────────────────
// guest.events = ['mehndi', 'shaadi', 'walima'] (subset each guest is invited to)
// rsvpMap keyed by "guest_id:event"
function buildGuestCard(guest, rsvpMap) {
  const eventsHtml = guest.events.map(evt => {
    const meta     = EVENT_META[evt];
    if (!meta) return '';
    const key      = `${guest.id}:${evt}`;
    const existing = rsvpMap[key];
    const attending = existing?.attending;  // true | false | undefined

    const yesActive = attending === true  ? 'active yes-active' : '';
    const noActive  = attending === false ? 'active no-active'  : '';

    return `
      <div class="event-rsvp-row" data-guest-id="${guest.id}" data-event="${evt}">
        <div class="event-row-top">
          <div class="event-chip-col">
            <span class="event-chip event-chip--${evt}">${escapeHtml(meta.label)}</span>
            <span class="event-chip-date">${meta.day} &middot; ${meta.time}</span>
          </div>
          <div class="attend-btns" role="group" aria-label="${escapeHtml(guest.full_name)} — ${escapeHtml(meta.label)}">
            <button type="button" class="attend-btn attend-btn--yes ${yesActive}"
              data-val="yes" aria-pressed="${attending === true}">
              <span class="attend-icon" aria-hidden="true">✓</span> Attending
            </button>
            <button type="button" class="attend-btn attend-btn--no ${noActive}"
              data-val="no" aria-pressed="${attending === false}">
              <span class="attend-icon" aria-hidden="true">✗</span> Declining
            </button>
          </div>
        </div>
      </div>`.trim();
  }).join('');

  return `
    <div class="guest-card" data-guest-id="${guest.id}">
      <div class="guest-card-header">
        <h3 class="guest-name">${escapeHtml(guest.full_name)}</h3>
      </div>
      <div class="guest-events">
        ${eventsHtml}
      </div>
    </div>`.trim();
}

// ── Wire up attend button clicks ─────────────────────────────────────
function bindEventToggleListeners() {
  document.querySelectorAll('.event-rsvp-row').forEach(row => {
    row.querySelectorAll('.attend-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        row.querySelectorAll('.attend-btn').forEach(b => {
          b.classList.remove('active', 'yes-active', 'no-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active', val === 'yes' ? 'yes-active' : 'no-active');
        btn.setAttribute('aria-pressed', 'true');
        row.closest('.guest-card')?.style.removeProperty('outline');
      });
    });
  });
}

// ── Inject household-level extras block (email + note) ───────────────
function renderHouseholdExtras(savedEmail, savedNote) {
  const container = document.getElementById('household-extras');
  if (!container) return;
  container.innerHTML = `
    <div class="household-extras-block">
      <div class="field-group">
        <label for="household-email">Email Address <span class="field-required">*</span></label>
        <input type="email" id="household-email" name="household-email"
          placeholder="your@email.com" maxlength="254" autocomplete="email"
          required value="${escapeHtml(savedEmail ?? '')}">
      </div>
      <div class="field-group">
        <label for="household-note">Note to the Couple <span class="field-optional">(optional)</span></label>
        <textarea id="household-note" name="household-note"
          placeholder="Anything you'd like us to know…" maxlength="1000"
          rows="3">${escapeHtml(savedNote ?? '')}</textarea>
      </div>
    </div>`;
}

// ── Animate guest cards in ───────────────────────────────────────────
function animateCardsIn(cards) {
  if (typeof gsap === 'undefined' || prefersReduced) {
    cards.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
    return;
  }
  gsap.from(cards, { opacity: 0, y: 20, duration: 0.55, ease: 'power3.out', stagger: 0.1 });
}

// ── Render form with loaded data ─────────────────────────────────────
function renderForm(data) {
  const householdLabel = document.getElementById('rsvp-household-label');
  if (householdLabel) householdLabel.textContent = data.household_label;

  const guestList = document.getElementById('guest-list');
  if (!guestList) return;

  // Build rsvpMap keyed by "guest_id:event"
  const rsvpMap = {};
  (data.rsvps ?? []).forEach(r => { rsvpMap[`${r.guest_id}:${r.event}`] = r; });

  guestList.innerHTML = (data.guests ?? []).map(g => buildGuestCard(g, rsvpMap)).join('');

  // Restore saved email/note if available (from previous partial rsvp)
  const savedEmail = data.email ?? '';
  const savedNote  = data.note  ?? '';
  renderHouseholdExtras(savedEmail, savedNote);

  bindEventToggleListeners();
  animateCardsIn(Array.from(guestList.querySelectorAll('.guest-card')));

  hide('rsvp-loading');
  show('rsvp-form-wrap');
}

// ── Collect per-event responses from the DOM ─────────────────────────
function collectResponses() {
  const responses = [];
  const unanswered = [];

  document.querySelectorAll('.event-rsvp-row').forEach(row => {
    const guestId = parseInt(row.dataset.guestId, 10);
    const evt     = row.dataset.event;
    const active  = row.querySelector('.attend-btn.active');

    if (!active) { unanswered.push(row); return; }

    const attending = active.dataset.val === 'yes';
    responses.push({ guest_id: guestId, event: evt, attending });
  });

  const emailRaw = document.getElementById('household-email')?.value?.trim() ?? '';
  const email = emailRaw || null;
  const note  = document.getElementById('household-note')?.value?.trim()  || null;

  // Basic email format validation
  const emailValid = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : false;

  return { responses, unanswered, email, emailValid, note };
}

// ── Main ─────────────────────────────────────────────────────────────
async function initRsvp() {

  // ── Demo mode ──
  if (isDemo()) {
    renderForm(DEMO_DATA);
    const form     = document.getElementById('rsvp-form');
    const statusEl = document.getElementById('rsvp-status');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { unanswered, email, emailValid } = collectResponses();
        if (unanswered.length > 0) {
          unanswered.forEach(row => {
            const card = row.closest('.guest-card');
            if (card) { card.style.outline = '2px solid var(--color-error)'; card.style.borderRadius = 'var(--radius-lg)'; }
          });
          if (statusEl) { statusEl.textContent = 'Please answer every event row.'; statusEl.className = 'rsvp-status visible error'; }
          unanswered[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (!emailValid) {
          const emailInput = document.getElementById('household-email');
          if (emailInput) { emailInput.style.outline = '2px solid var(--color-error)'; emailInput.style.borderRadius = '6px'; emailInput.focus(); emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          if (statusEl) { statusEl.textContent = email ? 'Please enter a valid email address.' : 'Please enter your email address.'; statusEl.className = 'rsvp-status visible error'; }
          return;
        }
        hide('rsvp-form-wrap');
        show('rsvp-success-screen');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const householdEvents = new Set((DEMO_DATA.guests ?? []).flatMap(g => g.events));
        renderSuccessEvents(householdEvents);
      });
    }
    return;
  }

  // ── Code-entry screen ──
  async function showCodeEntry(errorMsg = '') {
    hide('rsvp-loading');
    const errEl   = document.getElementById('rsvp-code-error');
    const codeInput = document.getElementById('rsvp-code-input');
    if (errEl) errEl.textContent = errorMsg;
    show('rsvp-code-screen');

    // Pre-fill from URL ?t= first, then sessionStorage fallback
    const urlToken = new URLSearchParams(window.location.search).get('t');
    const stored   = sessionStorage.getItem('rsvp_token');
    if (codeInput && !codeInput.value) codeInput.value = urlToken ?? stored ?? '';

    const codeForm = document.getElementById('rsvp-code-form');
    if (!codeForm) return;

    codeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = codeInput?.value?.trim() ?? '';
      if (!code) {
        if (errEl) errEl.textContent = 'Please enter your RSVP code.';
        codeInput?.focus();
        return;
      }
      if (code.toLowerCase() === 'demo') {
        window.location.href = `${window.location.pathname}?demo=1`;
        return;
      }

      // Look up the code
      if (errEl) errEl.textContent = '';
      const btn = codeForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      let data;
      try {
        const res = await fetch(`${API_BASE}/api/invite?t=${encodeURIComponent(code)}`, {
          method: 'GET', headers: { 'Content-Type': 'application/json' },
        });
        if (res.status === 404 || res.status === 400) {
          if (errEl) errEl.textContent = 'Code not found. Please double-check and try again.';
          if (btn) btn.disabled = false;
          sessionStorage.removeItem('rsvp_token');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (err) {
        console.error('Failed to load invite:', err);
        if (errEl) errEl.textContent = 'Something went wrong. Please check your connection and try again.';
        if (btn) btn.disabled = false;
        return;
      }

      // Save valid token to sessionStorage for future navigation
      sessionStorage.setItem('rsvp_token', code);
      hide('rsvp-code-screen');
      show('rsvp-loading');
      renderForm(data);
      wireSubmitHandler(code, data);
    }, { once: true });
  }

  // ── Wire the RSVP submit handler (called after form is rendered) ──
  function wireSubmitHandler(token, data) {
    const form      = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('rsvp-submit');
    const statusEl  = document.getElementById('rsvp-status');

    function setStatus(msg, type) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = `rsvp-status visible ${type}`;
    }
    function clearStatus() {
      if (!statusEl) return;
      statusEl.className = 'rsvp-status';
      statusEl.textContent = '';
    }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    const { responses, unanswered, email, emailValid, note } = collectResponses();

    if (unanswered.length > 0) {
      unanswered.forEach(row => {
        const card = row.closest('.guest-card');
        if (card) { card.style.outline = '2px solid var(--color-error)'; card.style.borderRadius = 'var(--radius-lg)'; }
      });
      setStatus('Please select attending or declining for every event row.', 'error');
      unanswered[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!emailValid) {
      const emailInput = document.getElementById('household-email');
      if (emailInput) {
        emailInput.style.outline = '2px solid var(--color-error)';
        emailInput.style.borderRadius = '6px';
        emailInput.focus();
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setStatus(email ? 'Please enter a valid email address.' : 'Please enter your email address.', 'error');
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

    try {
      const res = await fetch(`${API_BASE}/api/rsvp?t=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, email, note }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error ?? 'Unknown error');

      hide('rsvp-form-wrap');
      show('rsvp-success-screen');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Show events the household is invited to (union across all guests)
      const householdEvents = new Set((data.guests ?? []).flatMap(g => g.events));
      renderSuccessEvents(householdEvents);

      const attendingNames = [...new Set(
        responses.filter(r => r.attending)
          .map(r => (data.guests ?? []).find(g => g.id === r.guest_id)?.full_name)
          .filter(Boolean)
      )];
      const msgEl = document.getElementById('rsvp-success-msg');
      if (msgEl) {
        msgEl.textContent = attendingNames.length > 0
          ? `We're so excited to celebrate with ${attendingNames.join(' and ')}!`
          : "We'll miss you, but thank you for letting us know.";
      }

      if (typeof gsap !== 'undefined' && !prefersReduced) {
        gsap.from('#rsvp-success-screen', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' });
      }

    } catch (err) {
      console.error('Submit failed:', err);
      setStatus('Something went wrong. Please try again.', 'error');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit RSVP'; }
    }
  });
  } // end wireSubmitHandler

  // ── Entry point: always show code screen (pre-filled if token available) ──
  showCodeEntry();
}

// ── Init ─────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRsvp);
} else {
  initRsvp();
}

