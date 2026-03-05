/**
 * schedule.js — Schedule page scroll-reveal animations
 * ─────────────────────────────────────────────────────
 * Uses GSAP ScrollTrigger to stagger-reveal schedule blocks as the
 * user scrolls. Respects prefers-reduced-motion.
 */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;

  // ── Hero compact fade-in (shared) ──────────────────────────────
  if (!prefersReduced) {
    // Set initial states via GSAP (overrides any CSS opacity immediately)
    gsap.set('.hero-floral',  { opacity: 0, y: -14, scale: 0.97 });
    gsap.set('.hero-names',   { opacity: 0, y: 18 });
    gsap.set('.hero-tagline', { opacity: 0, y: 12 });
    gsap.set('#main-nav',     { opacity: 0 });
    document.body.classList.remove('gsap-ready');

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to('.hero-floral',  { opacity: 1, y: 0, scale: 1,  duration: 0.8 })
      .to('.hero-names',   { opacity: 1, y: 0,            duration: 0.7 }, '-=0.4')
      .to('.hero-tagline', { opacity: 1, y: 0,            duration: 0.55 }, '-=0.3')
      .to('#main-nav',     { opacity: 1,                  duration: 0.45 }, '-=0.25');
  }

  // ── Schedule blocks ────────────────────────────────────────────
  if (typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const blocks = gsap.utils.toArray('.schedule-block');

  if (prefersReduced) {
    // No animation; just make sure they're visible
    gsap.set(blocks, { opacity: 1, y: 0 });
    return;
  }

  blocks.forEach((block, i) => {
    gsap.from(block, {
      opacity: 0,
      y: 28,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: block,
        start: 'top 88%',
        once: true,
      },
      delay: i * 0.04, // subtle cumulative stagger
    });
  });
});
