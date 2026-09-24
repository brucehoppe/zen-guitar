// site/koan.js
// The koan is one line of HTML under the ring (#koan; app.js announces it through #announce). It waits for
// the ring to finish turning, fades in, holds long enough to read, then fades out.
// afterTurn matches --ease in app.css; fadeIn and fadeOut match the .koan transitions.
export const KOAN_TIMING = { afterTurn: 400, fadeIn: 400, hold: 3500, fadeOut: 600 };

const prefersReducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function createKoan(el, {
  timing = KOAN_TIMING,
  reduced = prefersReducedMotion,
  setTimer = (f, ms) => setTimeout(f, ms),
  clearTimer = (t) => clearTimeout(t),
} = {}) {
  let timers = [];
  const cancel = () => { timers.forEach(clearTimer); timers = []; };
  const at = (ms, f) => timers.push(setTimer(f, ms));

  function clear() {
    cancel();
    el.classList.remove("is-on");
    el.textContent = "";
  }

  function show(text) {
    clear();
    if (!text) return;
    // Reduced motion: nothing turns and nothing fades, so the koan simply stands there
    // until the next move.
    if (reduced()) { el.textContent = text; el.classList.add("is-on"); return; }
    const { afterTurn, fadeIn, hold, fadeOut } = timing;
    at(afterTurn, () => { el.textContent = text; el.classList.add("is-on"); });
    at(afterTurn + fadeIn + hold, () => el.classList.remove("is-on"));
    at(afterTurn + fadeIn + hold + fadeOut, () => { el.textContent = ""; });
  }

  return { show, clear };
}
