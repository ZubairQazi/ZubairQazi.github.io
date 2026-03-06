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
  mehndi: { label: 'Mehndi',  day: 'Thursday, June 11', time: '6:00 PM' },
  shaadi: { label: 'Shaadi',  day: 'Friday, June 12',   time: '5:00 PM' },
  walima: { label: 'Walima',  day: 'Saturday, June 13', time: '6:00 PM' },
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
    return `<div class="success-event-block success-event-block--${evt}">
  <span class="success-event-name">${m.label}</span>
  <span class="success-event-detail">${m.day} &middot; ${m.time}</span>
</div>`;
  }).join('');
}

// ── Helpers ─────────────────────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getToken() {
  return new URLSearchParams(window.location.search).get('t') ?? null;
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
    const dietaryNotes = existing?.dietary_notes ?? '';

    const yesActive = attending === true  ? 'active yes-active' : '';
    const noActive  = attending === false ? 'active no-active'  : '';
    const detailHidden = attending === true ? '' : 'hidden';

    const mealHtml = `
      <div class="event-meal-details" id="meal-detail-${guest.id}-${evt}" ${detailHidden}>
        <div class="field-group">
          <label for="dietary-${guest.id}-${evt}">Dietary Notes</label>
          <input type="text" id="dietary-${guest.id}-${evt}"
            placeholder="Allergies, restrictions…" maxlength="500"
            value="${escapeHtml(dietaryNotes)}">
        </div>
      </div>`;

    return `
      <div class="event-rsvp-row" data-guest-id="${guest.id}" data-event="${evt}">
        <div class="event-row-top">
          <span class="event-chip event-chip--${evt}">${escapeHtml(meta.label)}</span>
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
        ${mealHtml}
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
    const guestId = row.dataset.guestId;
    const evt     = row.dataset.event;
    const meta    = EVENT_META[evt];

    row.querySelectorAll('.attend-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;

        row.querySelectorAll('.attend-btn').forEach(b => {
          b.classList.remove('active', 'yes-active', 'no-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active', val === 'yes' ? 'yes-active' : 'no-active');
        btn.setAttribute('aria-pressed', 'true');

        const detail = document.getElementById(`meal-detail-${guestId}-${evt}`);
        if (detail) {
          if (val === 'yes') {
            detail.removeAttribute('hidden');
          } else {
            detail.setAttribute('hidden', '');
            const dtInp = document.getElementById(`dietary-${guestId}-${evt}`);
            if (dtInp) dtInp.value = '';
          }
        }

        // Clear any validation highlight on parent card
        row.closest('.guest-card')?.style.removeProperty('outline');
      });
    });
  });
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
    const meta    = EVENT_META[evt];
    const active  = row.querySelector('.attend-btn.active');

    if (!active) { unanswered.push(row); return; }

    const attending    = active.dataset.val === 'yes';
    const dietaryNotes = attending
      ? (document.getElementById(`dietary-${guestId}-${evt}`)?.value?.trim() || null) : null;

    responses.push({ guest_id: guestId, event: evt, attending, dietary_notes: dietaryNotes });
  });

  return { responses, unanswered };
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
        const { unanswered } = collectResponses();
        if (unanswered.length > 0) {
          unanswered.forEach(row => {
            const card = row.closest('.guest-card');
            if (card) { card.style.outline = '2px solid var(--color-error)'; card.style.borderRadius = 'var(--radius-lg)'; }
          });
          if (statusEl) { statusEl.textContent = 'Please answer every event row.'; statusEl.className = 'rsvp-status visible error'; }
          unanswered[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        hide('rsvp-form-wrap');
        show('rsvp-success-screen');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Collect max union of events this household is invited to
        const householdEvents = new Set((DEMO_DATA.guests ?? []).flatMap(g => g.events));
        renderSuccessEvents(householdEvents);
      });
    }
    return;
  }

  // ── Code-entry helper ──
  function showCodeEntry(errorMsg = '') {
    hide('rsvp-loading');
    const errEl = document.getElementById('rsvp-code-error');
    if (errEl) errEl.textContent = errorMsg;
    show('rsvp-code-screen');
    const codeForm = document.getElementById('rsvp-code-form');
    if (codeForm) {
      codeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('rsvp-code-input');
        const code = input?.value?.trim() ?? '';
        if (!code) {
          if (errEl) errEl.textContent = 'Please enter your RSVP code.';
          input?.focus();
          return;
        }
        if (code.toLowerCase() === 'demo') {
          window.location.href = `${window.location.pathname}?demo=1`;
          return;
        }
        window.location.href = `${window.location.pathname}?t=${encodeURIComponent(code)}`;
      }, { once: true });
    }
  }

  // ── Real token flow ──
  const token = getToken();
  if (!token || !/^[A-Za-z0-9_\-]{20,64}$/.test(token)) {
    showCodeEntry();
    return;
  }

  let data;
  try {
    const res = await fetch(`${API_BASE}/api/invite?t=${encodeURIComponent(token)}`, {
      method: 'GET', headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('Failed to load invite:', err);
    showCodeEntry('Code not found. Please double-check and try again.');
    return;
  }

  renderForm(data);

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

    const { responses, unanswered } = collectResponses();

    if (unanswered.length > 0) {
      unanswered.forEach(row => {
        const card = row.closest('.guest-card');
        if (card) { card.style.outline = '2px solid var(--color-error)'; card.style.borderRadius = 'var(--radius-lg)'; }
      });
      setStatus('Please select attending or declining for every event row.', 'error');
      unanswered[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

    try {
      const res = await fetch(`${API_BASE}/api/rsvp?t=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
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
}

// ── Init ─────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRsvp);
} else {
  initRsvp();
}

