/**
 * home.js — Landing page animations & countdown
 * ─────────────────────────────────────────────
 * Uses GSAP 3 (loaded via CDN) for stagger entry animations,
 * photo tilt on mousemove, and countdown timer.
 *
 * Graceful degradation:
 *  - GSAP unavailable → elements are visible (no opacity:0 applied)
 *  - prefers-reduced-motion → simple instant fade only
 */

// ── Config ────────────────────────────────────────────────────────
// IMPORTANT: Update this to your actual wedding date (YYYY, MM-1, DD)
const WEDDING_DATE = new Date(2026, 8, 12); // Sep 12, 2026 (month is 0-indexed)

// ── Reduced motion check ──────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Countdown ─────────────────────────────────────────────────────
(function initCountdown() {
  const el = document.getElementById('countdown-days');
  if (!el) return;

  function update() {
    const now = new Date();
    const diff = WEDDING_DATE - now;
    if (diff <= 0) {
      el.textContent = '🎉';
      el.closest('.hero-countdown')?.querySelector('span:last-child')
        && (el.closest('.hero-countdown').lastElementChild.textContent = 'Today!');
      return;
    }
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    el.textContent = days.toLocaleString();
  }

  update();
  // Refresh at midnight
  const msToMidnight = new Date().setHours(24, 0, 0, 0) - Date.now();
  setTimeout(() => { update(); setInterval(update, 86400000); }, msToMidnight);
})();

// ── GSAP Animations ───────────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;

  // Mark body so CSS initial-opacity states activate
  document.body.classList.add('gsap-ready');

  // Temporarily make elements invisible while GSAP loads
  // (the .gsap-ready class in CSS handles this)

  if (prefersReduced) {
    // Reduced motion: just snap to visible immediately
    gsap.to([
      '.hero-floral', '.hero-names', '.hero-tagline',
      '.hero-countdown', '#main-nav', '.main-left', '.main-right'
    ], { opacity: 1, duration: 0.01, overwrite: true });
    return;
  }

  // ── Hero stagger entrance
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-floral', {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.9,
    from: { opacity: 0, y: -18, scale: 0.97 },
  })
  .from('.hero-names', {
    opacity: 0,
    y: 22,
    duration: 0.85,
  }, '-=0.45')
  .from('.hero-tagline', {
    opacity: 0,
    y: 14,
    duration: 0.6,
  }, '-=0.4')
  .from('.hero-countdown', {
    opacity: 0,
    y: 10,
    duration: 0.55,
  }, '-=0.35')
  .from('#main-nav', {
    opacity: 0,
    duration: 0.5,
  }, '-=0.3')
  .from('.main-left', {
    opacity: 0,
    x: -30,
    duration: 0.75,
  }, '-=0.2')
  .from('.main-right', {
    opacity: 0,
    x: 30,
    duration: 0.75,
  }, '<');

  // After timeline resolves, set explicit opacity:1 to avoid GSAP conflicts
  tl.then(() => {
    document.body.classList.remove('gsap-ready');
  });
});

// ── Photo tilt on mousemove (desktop only) ─────────────────────────
(function initPhotoTilt() {
  if (prefersReduced) return;
  // Only on devices with fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const photoWraps = document.querySelectorAll('.photo-main-wrap, .photo-small-wrap');
  const MAX_TILT = 6; // degrees

  photoWraps.forEach(wrap => {
    let rafId = null;

    wrap.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = (-dy * MAX_TILT).toFixed(2);
        const rotY = (dx * MAX_TILT).toFixed(2);
        wrap.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        wrap.style.transition = 'transform 0.1s linear';
      });
    });

    wrap.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      wrap.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
      wrap.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });
})();

// ── Nav active indicator ───────────────────────────────────────────
(function initNav() {
  // Already set in HTML via .active class;
  // This handles smooth hover underline — purely CSS via ::after,
  // but we add hover highlight to non-active items here if desired.
})();
