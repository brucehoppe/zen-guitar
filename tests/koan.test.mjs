import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { install, document } from "./fake-dom.mjs";
install();
const { createKoan, KOAN_TIMING } = await import("../site/koan.js");

// A fake clock: timers run in order when time is advanced.
function clock() {
  let now = 0, id = 0;
  const timers = new Map();
  return {
    setTimer: (f, ms) => { timers.set(++id, { f, at: now + ms }); return id; },
    clearTimer: (t) => timers.delete(t),
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        timers.delete(next[0]); now = next[1].at; next[1].f();
      }
      now = end;
    },
    get pending() { return timers.size; },
  };
}

function setup(reduced = false) {
  const el = document.createElement("p");
  const c = clock();
  const koan = createKoan(el, { reduced: () => reduced, setTimer: c.setTimer, clearTimer: c.clearTimer });
  const on = () => el.classList.contains("is-on");
  return { el, c, koan, on };
}

test("the koan waits for the ring to stop turning before it appears", () => {
  const { el, c, koan, on } = setup();
  koan.show("Not yet.");
  assert.equal(el.textContent, "");
  c.advance(KOAN_TIMING.afterTurn - 1);
  assert.ok(!on());
  c.advance(1);
  assert.ok(on());
  assert.equal(el.textContent, "Not yet.");
});

test("the koan stays fully visible for at least 3000ms before it starts to fade", () => {
  const { el, c, koan, on } = setup();
  koan.show("Mountain is mountain.");
  c.advance(KOAN_TIMING.afterTurn);             // appears, starts fading in
  c.advance(KOAN_TIMING.fadeIn);                 // fully visible from here
  c.advance(3000);
  assert.ok(on(), "still on 3000ms after reaching full opacity");
  assert.ok(KOAN_TIMING.hold >= 3500);
  c.advance(KOAN_TIMING.hold - 3000);
  assert.ok(!on(), "fading out after the hold");
  assert.equal(el.textContent, "Mountain is mountain.", "text stays while it fades");
  c.advance(KOAN_TIMING.fadeOut);
  assert.equal(el.textContent, "");
  assert.equal(c.pending, 0);
});

test("a new move replaces a koan still on screen", () => {
  const { el, c, koan } = setup();
  koan.show("First.");
  c.advance(1000);
  koan.show("Second.");
  assert.equal(el.textContent, "", "the old koan leaves at once");
  c.advance(KOAN_TIMING.afterTurn);
  assert.equal(el.textContent, "Second.");
  koan.clear();
  assert.equal(el.textContent, "");
  assert.equal(c.pending, 0);
});

test("under reduced motion the koan shows at once, without fading, and stays", () => {
  const { el, c, koan, on } = setup(true);
  koan.show("Then wash your bowl.");
  assert.ok(on());
  assert.equal(el.textContent, "Then wash your bowl.");
  assert.equal(c.pending, 0, "no timers: nothing fades");
});

test("koan timings match app.css: the turn (--ease) and the .koan fades", async () => {
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  assert.equal(Number(css.match(/--ease:\s*(\d+)ms/)[1]), KOAN_TIMING.afterTurn);
  const base = css.match(/\.koan \{[^}]*transition: opacity (\d+)ms/);
  const on = css.match(/\.koan\.is-on \{[^}]*transition-duration: (\d+)ms/);
  assert.equal(Number(base[1]), KOAN_TIMING.fadeOut);
  assert.equal(Number(on[1]), KOAN_TIMING.fadeIn);
});
