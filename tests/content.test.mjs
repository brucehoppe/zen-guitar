import { test } from "node:test";
import assert from "node:assert/strict";
import { stages, lessons } from "../site/content/index.js";

const KNOWN_TYPES = new Set(["table", "steps", "terms", "wheel", "balance", "tabs", "mountains", "cards", "maxims", "match", "list"]);

test("stage 1 is complete", () => {
  const s = stages.find((x) => x.id === 1);
  assert.ok(s, "stage 1 exists");
  for (const key of ["slug", "title", "subtitle", "emblem", "koan", "intro"]) assert.ok(s[key], key);
  assert.ok(s.sections.length >= 3);
  assert.ok(s.recall.length >= 2);
  assert.ok(s.reflection.length >= 1);
});

test("every section has a known type, a unique id and a heading", () => {
  for (const s of stages) {
    const ids = new Set();
    for (const sec of s.sections) {
      assert.ok(KNOWN_TYPES.has(sec.type), `${s.id}/${sec.id}: type ${sec.type}`);
      assert.ok(sec.id && !ids.has(sec.id), `${s.id}: duplicate or missing id ${sec.id}`);
      ids.add(sec.id);
      assert.ok(sec.heading, `${s.id}/${sec.id}: heading`);
    }
  }
});

test.todo("lessons point at real stages and sections", () => {
  for (const [id, l] of Object.entries(lessons)) {
    const s = stages.find((x) => x.id === l.stage);
    assert.ok(s, `${id}: stage ${l.stage}`);
    if (s) assert.ok(s.sections.some((sec) => sec.id === l.section), `${id}: section ${l.section}`);
    assert.ok(l.label, `${id}: label`);
  }
});
