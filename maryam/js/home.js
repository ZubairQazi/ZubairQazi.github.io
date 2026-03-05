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
const WEDDING_DATE = new Date(2026, 5, 11); // Jun 11, 2026 (month is 0-indexed)

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

// ── Split hero names into individual .hero-letter spans ──────────
function splitHeroNames() {
  const el = document.querySelector('.hero-names');
  if (!el || prefersReduced) return;
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach(char => {
        if (char.trim() === '') {
          el.appendChild(document.createTextNode(char));
        } else {
          const s = document.createElement('span');
          s.className = 'hero-letter';
          s.textContent = char;
          el.appendChild(s);
        }
      });
    } else {
      // .ampersand span — preserve element, wrap its chars too
      const clone = node.cloneNode(false);
      [...node.textContent].forEach(char => {
        const s = document.createElement('span');
        s.className = 'hero-letter';
        s.textContent = char;
        clone.appendChild(s);
      });
      el.appendChild(clone);
    }
  });
}

// ── Generate falling petals (GSAP-driven) ────────────────────────
function initPetals() {
  if (prefersReduced) return;
  if (typeof gsap === 'undefined') return;
  const layer = document.getElementById('petals-layer');
  if (!layer) return;

  for (let i = 0; i < 16; i++) {
    const p    = document.createElement('div');
    p.className = 'petal';
    const size = Math.random() * 10 + 7;
    const r    = Math.random() > 0.5 ? '50% 0 50% 0' : '50% 50% 0 50%';
    p.style.cssText = `width:${size}px;height:${size*1.65}px;border-radius:${r};left:${(Math.random()*96+2).toFixed(1)}%;`;
    layer.appendChild(p);
    animatePetal(p, Math.random() * 8 + 12, Math.random() * 22);
  }

  function animatePetal(el, dur, delay) {
    const dx = (Math.random() - 0.5) * 180;
    const dr = Math.random() * 420 + 180;
    gsap.set(el, { y: -30, x: 0, rotation: 0, opacity: 0 });
    const tl = gsap.timeline({
      delay,
      onComplete() {
        el.style.left = (Math.random() * 96 + 2).toFixed(1) + '%';
        animatePetal(el, Math.random() * 8 + 12, Math.random() * 4);
      }
    });
    tl.to(el, { opacity: 0.52, duration: dur * 0.10, ease: 'power1.in' })
      .to(el, { y: window.innerHeight + 50, x: dx, rotation: dr,
                duration: dur, ease: 'none' }, 0)
      .to(el, { opacity: 0, duration: dur * 0.14, ease: 'power1.in' }, `-=${dur * 0.14}`);
  }
}

// ── GSAP Animations ───────────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;

  splitHeroNames(); // Must run before gsap.set so .hero-letter spans exist
  initPetals();

  document.body.classList.add('gsap-ready');

  if (prefersReduced) {
    document.body.classList.remove('gsap-ready');
    gsap.set([
      '.hero-floral', '.hero-names', '.hero-tagline',
      '.hero-countdown', '#main-nav', '.main-left', '.main-right'
    ], { opacity: 1, clearProps: 'all' });
    return;
  }

  // ── Initial states
  gsap.set('.hero-floral',    { opacity: 0, y: -24, scale: 0.95 });
  gsap.set('.hero-letter',    { opacity: 0, y: 38, rotateY: 80, transformOrigin: '50% 100%' });
  gsap.set('.hero-tagline',   { opacity: 0, y: 16 });
  gsap.set('.hero-countdown', { opacity: 0, y: 12, scale: 0.88 });
  gsap.set('#main-nav',       { opacity: 0 });
  gsap.set('.main-left',      { opacity: 0, x: -40 });
  gsap.set('.main-right',     { opacity: 0, x: 40 });

  document.body.classList.remove('gsap-ready');

  // ── Entrance timeline
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
  });

  tl
    .to('.hero-floral', {
      opacity: 1, y: 0, scale: 1, duration: 1.1,
    })
    .to('.hero-letter', {
      opacity: 1, y: 0, rotateY: 0,
      duration: 0.72,
      ease: 'back.out(2)',
      stagger: { each: 0.038, ease: 'power2.inOut' },
    }, '-=0.5')
    .to('.hero-tagline', {
      opacity: 1, y: 0, duration: 0.65,
    }, '-=0.3')
    .to('.hero-countdown', {
      opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)',
    }, '-=0.4')
    .to('#main-nav', {
      opacity: 1, duration: 0.5,
    }, '-=0.25')
    .to('.main-left', {
      opacity: 1, x: 0, duration: 0.85, ease: 'power2.out',
    }, '-=0.2')
    .to('.main-right', {
      opacity: 1, x: 0, duration: 0.85, ease: 'power2.out',
    }, '<');

  // ── Scroll-driven parallax on floral illustration
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate(self) {
        gsap.set('.hero-floral', { yPercent: self.progress * -20 });
      }
    });
  }
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
