import { test } from "node:test";
import assert from "node:assert/strict";
import { spokes, splitLabel } from "../site/render/wheel-geometry.js";
import { stage2 } from "../site/content/stage2.js";

test("twelve spokes, first at 12 o'clock, labels anchored by side", () => {
  const s = spokes(12, 34, 120, 170, 170);
  assert.equal(s.length, 12);
  assert.ok(Math.abs(s[0].x1 - 170) < 1e-9 && s[0].y1 < 170 && s[0].y2 < s[0].y1);
  assert.equal(s[0].anchor, "middle");
  assert.equal(s[3].anchor, "start");   // 3 o'clock
  assert.equal(s[9].anchor, "end");     // 9 o'clock
  assert.ok(s[3].lx > s[3].x2, "label sits outside the rim");
});

// Estimated label box (5 units per character, anchored by side; a wrapped label's
// second line drops 12 units for its 1.1em dy) must stay inside the wheel's
// viewBox ("0 0 340 340"), for the real stage-2 point names pulled straight from
// site/content/stage2.js — this is what would catch "Follow-through" (wraps at its
// hyphen) or "Stages and plateaus" (wraps at its last space) running past the edge.
test("every spoke label's estimated tspan lines stay inside the wheel viewBox", () => {
  const viewBox = { x: 0, y: 0, w: 340, h: 340 };
  const CHAR_W = 5;
  const LINE_H = 12;
  const points = stage2.sections.find((sec) => sec.type === "wheel").items;
  const labels = points.map((p) => p.name);
  const s = spokes(labels.length, 34, 120, 170, 170);
  s.forEach((sp, i) => {
    splitLabel(labels[i]).forEach((line, li) => {
      const width = line.length * CHAR_W;
      const left = sp.anchor === "end" ? sp.lx - width : sp.anchor === "middle" ? sp.lx - width / 2 : sp.lx;
      const right = sp.anchor === "end" ? sp.lx : sp.anchor === "middle" ? sp.lx + width / 2 : sp.lx + width;
      const ly = sp.ly + li * LINE_H;
      assert.ok(left >= viewBox.x - 1e-9, `spoke ${i} ("${line}") box left ${left} left of viewBox`);
      assert.ok(right <= viewBox.x + viewBox.w + 1e-9, `spoke ${i} ("${line}") box right ${right} past viewBox`);
      assert.ok(ly >= viewBox.y - 1e-9 && ly <= viewBox.y + viewBox.h + 1e-9, `spoke ${i} ("${line}") ly out of viewBox`);
    });
  });
});

test("splitLabel wraps long names at the hyphen or last space, leaves short ones alone", () => {
  assert.deepEqual(splitLabel("Follow-through"), ["Follow-", "through"]);
  assert.deepEqual(splitLabel("Stages and plateaus"), ["Stages and", "plateaus"]);
  assert.deepEqual(splitLabel("Collaboration"), ["Collaboration"]); // no hyphen/space to split on
  assert.deepEqual(splitLabel("Discipline"), ["Discipline"]); // 10 chars, at the 11-char threshold
});
