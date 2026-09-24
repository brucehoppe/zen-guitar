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
// inside the wheel's viewBox with no slack. The label font is 12.5 units (.spoke-label
// in app.css); Source Sans 3 averages about 0.57em per character, so 7.15 units, and a
// wrapped label's second line drops 1.1em = 13.75 units. This catches "Follow-through"
// or "Stages and plateaus" running past the edge if the rim or font grows again.
test("every spoke label's estimated tspan lines stay inside the wheel viewBox", async () => {
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  const FONT = Number(css.match(/\.spoke-label \{ font: ([\d.]+)px/)[1]);
  assert.equal(FONT, 12.5);
  const CHAR_W = FONT * 0.572;
  const LINE_H = FONT * 1.1;
  const { size, cx, cy, inner, outer } = WHEEL;
  const points = stage2.sections.find((sec) => sec.type === "wheel").items;
  const labels = points.map((p) => p.name);
  const s = spokes(labels.length, inner, outer, cx, cy);
  s.forEach((sp, i) => {
    splitLabel(labels[i]).forEach((line, li) => {
      const width = line.length * CHAR_W;
      const left = sp.anchor === "end" ? sp.lx - width : sp.anchor === "middle" ? sp.lx - width / 2 : sp.lx;
      const right = left + width;
      const ly = sp.ly + li * LINE_H;
      assert.ok(left >= 0, `spoke ${i} ("${line}") box left ${left} left of viewBox`);
      assert.ok(right <= size, `spoke ${i} ("${line}") box right ${right} past viewBox`);
      assert.ok(ly - FONT >= 0 && ly <= size, `spoke ${i} ("${line}") line ${ly} out of viewBox`);
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
