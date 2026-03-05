/**
 * rsvp.js — RSVP page: load invite data, render guest form, submit
 * ─────────────────────────────────────────────────────────────────
 * Flow:
 *  1. Read ?t=TOKEN from URL
 *  2. Fetch GET /api/invite?t=TOKEN
 *  3. Render guest cards with pre-filled RSVP data
 *  4. On submit: POST /api/rsvp?t=TOKEN
 *  5. Show success / error state
 *
 * Security: token stays in URL param only; never stored in localStorage.
 */

// ── Config ─────────────────────────────────────────────────────────
// IMPORTANT: Replace with your deployed Cloudflare Worker URL.
const API_BASE = 'https://wedding-rsvp-worker.zubair-qazi-5b.workers.dev';

const MEAL_OPTIONS = [
  { value: 'chicken',     label: 'Chicken' },
  { value: 'fish',        label: 'Fish' },
  { value: 'vegetarian',  label: 'Vegetarian' },
  { value: 'vegan',       label: 'Vegan' },
];

// ── Helpers ─────────────────────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getToken() {
  return new URLSearchParams(window.location.search).get('t') ?? null;
}

function show(id)  { const el = document.getElementById(id); if (el) { el.style.display = '';   el.classList.add('visible');    } }
function hide(id)  { const el = document.getElementById(id); if (el) { el.style.display = 'none'; el.classList.remove('visible'); } }
function showClass(id, cls) { document.getElementById(id)?.classList.add(cls); }

// ── Guest card builder ───────────────────────────────────────────────
function buildGuestCard(guest, existingRsvp) {
  const attending = existingRsvp?.attending;
  const mealChoice = existingRsvp?.meal_choice ?? '';
  const dietaryNotes = existingRsvp?.dietary_notes ?? '';
  const yesChecked = attending === true  ? 'checked' : '';
  const noChecked  = attending === false ? 'checked' : '';
  const detailsClass = attending === true ? 'guest-details visible' : 'guest-details';

  // Build meal options
  const mealOptionsHtml = MEAL_OPTIONS.map(opt =>
    `<option value="${opt.value}"${mealChoice === opt.value ? ' selected' : ''}>${opt.label}</option>`
  ).join('');

  return `
    <div class="guest-card" data-guest-id="${guest.id}">
      <div class="guest-card-header">
        <h3 class="guest-name">${escapeHtml(guest.full_name)}</h3>
        <div class="attending-toggle" role="group" aria-label="Will ${escapeHtml(guest.full_name)} attend?">
          <label>
            <input type="radio" name="attending-${guest.id}" value="yes" ${yesChecked} required>
            <span>Attending</span>
          </label>
          <label>
            <input type="radio" name="attending-${guest.id}" value="no"  ${noChecked}>
            <span>Not Attending</span>
          </label>
        </div>
      </div>
      <div class="${detailsClass}" id="details-${guest.id}">
        <div class="field-group">
          <label for="meal-${guest.id}">Meal Choice</label>
          <select id="meal-${guest.id}" name="meal-${guest.id}">
            <option value="" ${!mealChoice ? 'selected' : ''}>Select…</option>
            ${mealOptionsHtml}
          </select>
        </div>
        <div class="field-group dietary-group">
          <label for="dietary-${guest.id}">Dietary Notes</label>
          <input
            type="text"
            id="dietary-${guest.id}"
            name="dietary-${guest.id}"
            placeholder="Allergies, restrictions…"
            maxlength="500"
            value="${escapeHtml(dietaryNotes)}"
          >
        </div>
      </div>
    </div>
  `.trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Bind attending toggle → show/hide meal details ──────────────────
function bindToggleListeners() {
  document.querySelectorAll('.attending-toggle input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      const guestId = input.closest('.guest-card').dataset.guestId;
      const detailsEl = document.getElementById(`details-${guestId}`);
      if (!detailsEl) return;

      if (input.value === 'yes') {
        detailsEl.classList.add('visible');
      } else {
        detailsEl.classList.remove('visible');
        // Clear meal selection when not attending
        const mealSel = document.getElementById(`meal-${guestId}`);
        if (mealSel) mealSel.value = '';
        const dietaryInp = document.getElementById(`dietary-${guestId}`);
        if (dietaryInp) dietaryInp.value = '';
      }
    });
  });
}

// ── Animate guest cards in with GSAP (or instant if no GSAP) ────────
function animateCardsIn(cards) {
  if (typeof gsap === 'undefined' || prefersReduced) {
    cards.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
    return;
  }
  gsap.from(cards, {
    opacity: 0,
    y: 20,
    duration: 0.55,
    ease: 'power3.out',
    stagger: 0.1,
  });
}

// ── Main ─────────────────────────────────────────────────────────────
async function initRsvp() {
  const token = getToken();

  // No token in URL
  if (!token || !/^[A-Za-z0-9_\-]{20,64}$/.test(token)) {
    hide('rsvp-loading');
    show('rsvp-error-screen');
    return;
  }

  // ── Fetch invite data ──
  let data;
  try {
    const res = await fetch(`${API_BASE}/api/invite?t=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    data = await res.json();
  } catch (err) {
    console.error('Failed to load invite:', err);
    hide('rsvp-loading');
    show('rsvp-error-screen');
    return;
  }

  // ── Render form ──
  const householdLabel = document.getElementById('rsvp-household-label');
  if (householdLabel) householdLabel.textContent = data.household_label;

  const guestList = document.getElementById('guest-list');
  if (!guestList) return;

  // Build a map of existing RSVPs keyed by guest_id
  const rsvpMap = {};
  (data.rsvps ?? []).forEach(r => {
    rsvpMap[r.guest_id] = r;
  });

  // Render guest cards
  guestList.innerHTML = (data.guests ?? [])
    .map(g => buildGuestCard(g, rsvpMap[g.id]))
    .join('');

  bindToggleListeners();

  // Animate in
  const cards = guestList.querySelectorAll('.guest-card');
  animateCardsIn(Array.from(cards));

  hide('rsvp-loading');
  show('rsvp-form-wrap');

  // ── Form submit ──
  const form = document.getElementById('rsvp-form');
  const submitBtn = document.getElementById('rsvp-submit');
  const statusEl = document.getElementById('rsvp-status');

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

    // Collect guest responses
    const responses = [];
    let hasError = false;

    document.querySelectorAll('.guest-card').forEach(card => {
      const guestId = parseInt(card.dataset.guestId, 10);
      const attendingInput = card.querySelector(`input[name="attending-${guestId}"]:checked`);

      if (!attendingInput) {
        // Mark unanswered
        card.style.outline = '2px solid var(--color-error)';
        card.style.borderRadius = 'var(--radius-lg)';
        hasError = true;
        return;
      }
      card.style.outline = '';

      const attending = attendingInput.value === 'yes';
      const mealChoice = attending
        ? (document.getElementById(`meal-${guestId}`)?.value || null)
        : null;
      const dietaryNotes = attending
        ? (document.getElementById(`dietary-${guestId}`)?.value?.trim() || null)
        : null;

      responses.push({ guest_id: guestId, attending, meal_choice: mealChoice, dietary_notes: dietaryNotes });
    });

    if (hasError) {
      setStatus('Please select attending or not attending for every guest.', 'error');
      const firstUnset = document.querySelector('.guest-card[style*="outline"]');
      firstUnset?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Disable submit while sending
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

    try {
      const res = await fetch(`${API_BASE}/api/rsvp?t=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error ?? 'Unknown error');
      }

      // Success!
      hide('rsvp-form-wrap');
      show('rsvp-success-screen');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Customize success message
      const attending = responses.filter(r => r.attending).map(r => {
        const g = (data.guests ?? []).find(x => x.id === r.guest_id);
        return g?.full_name ?? '';
      }).filter(Boolean);
      const notAttending = responses.filter(r => !r.attending).length;

      const msgEl = document.getElementById('rsvp-success-msg');
      if (msgEl) {
        if (attending.length > 0 && notAttending === 0) {
          msgEl.textContent = `We're so excited to celebrate with ${attending.join(' and ')}!`;
        } else if (attending.length > 0) {
          msgEl.textContent = `We look forward to celebrating with ${attending.join(' and ')}!`;
        } else {
          msgEl.textContent = 'We\'ll miss you, but thank you for letting us know.';
        }
      }

      // Animate success screen
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
// Wait for DOM + deferred scripts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRsvp);
} else {
  initRsvp();
}
