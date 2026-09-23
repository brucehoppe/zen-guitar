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
