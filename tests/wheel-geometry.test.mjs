import { test } from "node:test";
import assert from "node:assert/strict";
import { spokes } from "../site/render/wheel-geometry.js";

test("twelve spokes, first at 12 o'clock, labels anchored by side", () => {
  const s = spokes(12, 34, 120, 170, 170);
  assert.equal(s.length, 12);
  assert.ok(Math.abs(s[0].x1 - 170) < 1e-9 && s[0].y1 < 170 && s[0].y2 < s[0].y1);
  assert.equal(s[0].anchor, "middle");
  assert.equal(s[3].anchor, "start");   // 3 o'clock
  assert.equal(s[9].anchor, "end");     // 9 o'clock
  assert.ok(s[3].lx > s[3].x2, "label sits outside the rim");
});

// Estimated label box (6 units per character, anchored by side) must stay inside
// the wheel's viewBox ("-60 0 460 340"), for the real stage-2 point names — this
// is what catches "Follow-through" clipping past the left edge at 9 o'clock.
test("every spoke label's estimated box stays inside the wheel viewBox", () => {
  const viewBox = { x: -60, y: 0, w: 460, h: 340 };
  const labels = [
    "Spirit", "Rhythm", "Technique", "Feel", "Perfection", "Mistakes",
    "Stages and plateaus", "Discipline", "Limits", "Follow-through", "Taste", "Collaboration",
  ];
  const s = spokes(12, 34, 120, 170, 170);
  s.forEach((sp, i) => {
    const width = labels[i].length * 6;
    const left = sp.anchor === "end" ? sp.lx - width : sp.anchor === "middle" ? sp.lx - width / 2 : sp.lx;
    const right = sp.anchor === "end" ? sp.lx : sp.anchor === "middle" ? sp.lx + width / 2 : sp.lx + width;
    assert.ok(left >= viewBox.x - 1e-9, `spoke ${i} ("${labels[i]}") box left ${left} left of viewBox`);
    assert.ok(right <= viewBox.x + viewBox.w + 1e-9, `spoke ${i} ("${labels[i]}") box right ${right} past viewBox`);
    assert.ok(sp.ly >= viewBox.y - 1e-9 && sp.ly <= viewBox.y + viewBox.h + 1e-9, `spoke ${i} ("${labels[i]}") ly out of viewBox`);
  });
});
