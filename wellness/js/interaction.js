/* ═══════════════════════════════════════════════════════
   interaction.js — haptics + tap ripple for a tactile feel.
   Vibration only fires where the browser actually supports it
   (Android Chrome; iOS Safari has no navigator.vibrate at all —
   the ripple/press-scale is what carries the feedback there).
   ═══════════════════════════════════════════════════════ */

export function buzz(ms = 10) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported — ripple still shows */ }
}

const RIPPLE_SELECTOR = [
  '.btn', '.chip', '.card', '.quick-action', '.option', '.nav-item', '.tab',
  '.icon-btn', '.stat', '.list-item', '.exercise-head', '.plan-day-head',
  '.grocery-item', '.achievement', '.mood-btn', '.set-check', '.stepper-btn',
  '.avatar-btn', '.food-search-result', '.thumb'
].join(', ');

const STRONG_TAP = '.btn-primary, .set-check, .mood-btn, .option, .quick-action';

export function initInteractions() {
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target.closest(RIPPLE_SELECTOR);
    if (!target || target.disabled) return;
    spawnRipple(target, e);
    buzz(target.matches(STRONG_TAP) ? 14 : 7);
  }, { passive: true });
}

function spawnRipple(el, e) {
  el.classList.add('rip-host');
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.7;
  const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = span.style.height = `${size}px`;
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;
  el.appendChild(span);
  span.addEventListener('animationend', () => span.remove());

  // Belt-and-suspenders cleanup in case animationend never fires (e.g. element removed mid-animation).
  setTimeout(() => span.remove(), 700);
}
