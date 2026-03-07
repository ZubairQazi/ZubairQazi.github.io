/**
 * petals.js — Shared falling petals animation (GSAP-driven)
 * ──────────────────────────────────────────────────────────
 * Include on any page that has <div id="petals-layer"></div> and GSAP loaded.
 * Respects prefers-reduced-motion.
 */

(function initPetals() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  window.addEventListener('load', () => {
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
  });
})();
