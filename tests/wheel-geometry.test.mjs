import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spokes, splitLabel, WHEEL } from "../site/render/wheel-geometry.js";
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

// Estimated label box for the real stage-2 point names, anchored by side, must stay
// inside the wheel's viewBox with no slack. The label size is read from .spoke-label in
// app.css; Source Sans 3 averages about 0.57em per character, a wrapped label's second
// line drops 1.1em, and each line is checked from its cap height (1em above the
// baseline) to its descender (0.25em below). This catches "Follow-through",
// "Collaboration" or "Stages and plateaus" running past the edge if the rim or font grows.
test("every spoke label's estimated tspan lines stay inside the wheel viewBox", async () => {
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  const FONT = Number(css.match(/\.spoke-label \{ font: ([\d.]+)px/)[1]);
  assert.ok(FONT >= 15, "labels are at least 15 units");
  const CHAR_W = FONT * 0.572;
  const LINE_H = FONT * 1.1;
  const { cx, cy, inner, outer, view } = WHEEL;
  assert.equal(view.x + view.w / 2, cx, "wheel centred horizontally");
  assert.equal(view.y + view.h / 2, cy, "wheel centred vertically");
  const points = stage2.sections.find((sec) => sec.type === "wheel").items;
  const labels = points.map((p) => p.name);
  const s = spokes(labels.length, inner, outer, cx, cy);
  s.forEach((sp, i) => {
    splitLabel(labels[i]).forEach((line, li) => {
      const width = line.length * CHAR_W;
      const left = sp.anchor === "end" ? sp.lx - width : sp.anchor === "middle" ? sp.lx - width / 2 : sp.lx;
      const right = left + width;
      const ly = sp.ly + li * LINE_H;
      assert.ok(left >= view.x, `spoke ${i} ("${line}") left ${left} past the viewBox`);
      assert.ok(right <= view.x + view.w, `spoke ${i} ("${line}") right ${right} past the viewBox`);
      assert.ok(ly - FONT >= view.y && ly + FONT * 0.25 <= view.y + view.h, `spoke ${i} ("${line}") line ${ly} out of the viewBox`);
    });
  });
});

test("splitLabel wraps long names at the hyphen or last space, leaves short ones alone", () => {
  assert.deepEqual(splitLabel("Follow-through"), ["Follow-", "through"]);
  assert.deepEqual(splitLabel("Stages and plateaus"), ["Stages and ", "plateaus"]);
  assert.equal(splitLabel("Stages and plateaus").join(""), "Stages and plateaus");
  assert.deepEqual(splitLabel("Collaboration"), ["Collaboration"]); // no hyphen/space to split on
  assert.deepEqual(splitLabel("Discipline"), ["Discipline"]); // 10 chars, at the 11-char threshold
});
