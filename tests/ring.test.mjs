import { test } from "node:test";
import assert from "node:assert/strict";
import { markerPositions, rotationFor, wornStops, beltPath } from "../site/ring.js";

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test("five markers sit evenly, first at 12 o'clock, clockwise", () => {
  const m = markerPositions(5, 100);
  assert.equal(m.length, 5);
  assert.ok(near(m[0].x, 200) && near(m[0].y, 100), "marker 0 at top");
  assert.deepEqual(m.map((p) => p.angle), [0, 72, 144, 216, 288]);
  assert.ok(m[1].x > 200 && m[1].y < 200, "marker 1 is upper-right (clockwise)");
});

test("rotationFor brings the stage to the top", () => {
  assert.equal(rotationFor(1), 0);
  assert.equal(rotationFor(2), -72);
  assert.equal(rotationFor(5), -288);
});

test("worn stops are lighter than fresh stops", () => {
  const fresh = wornStops(false), worn = wornStops(true);
  assert.equal(fresh.length, worn.length);
  assert.equal(fresh[0].color, "#f6f1e7");
  assert.notEqual(fresh.at(-1).color, worn.at(-1).color);
  assert.equal(worn.at(-1).color, "#2a2825");
});

test("beltPath draws a half circle arc", () => {
  const p = beltPath(142, 200, 200, "right");
  assert.match(p, /^M200 58 A142 142 0 0 1 200 342$/);
  assert.match(beltPath(142, 200, 200, "left"), /^M200 342 A142 142 0 0 1 200 58$/);
});
