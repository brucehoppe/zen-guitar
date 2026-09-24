import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHash, buildHash, normalize, nextStage, prevStage, canonicalHash } from "../site/router.js";

const stages = [1, 2, 3, 4, 5].map((id) => ({ id, sections: [{ id: "a" }, { id: "b" }] }));

test("parseHash reads stage, section and again", () => {
  assert.deepEqual(parseHash("#/2/b"), { view: "stage", stage: 2, section: "b", again: false, landing: false });
  assert.deepEqual(parseHash("#/1?again"), { view: "stage", stage: 1, section: null, again: true, landing: false });
  assert.deepEqual(parseHash("#/glossary"), { view: "glossary", stage: 1, section: null, again: false });
  assert.deepEqual(parseHash("#/practice"), { view: "practice", stage: 1, section: null, again: false });
});

test("parseHash treats garbage as stage 1", () => {
  for (const h of ["", "#", "#/", "#/9", "#/abc", "#/2/nothing/extra", "#//"]) {
    const r = parseHash(h);
    assert.equal(r.view, "stage", h);
    assert.ok(r.stage >= 1 && r.stage <= 5, h);
  }
  assert.equal(parseHash("#/9").stage, 1);
  assert.equal(parseHash("#/0").stage, 1);
});

test("normalize drops unknown sections and clamps stage", () => {
  assert.deepEqual(normalize({ view: "stage", stage: 2, section: "zzz", again: false }, stages),
    { view: "stage", stage: 2, section: null, again: false, landing: false });
  assert.equal(normalize({ view: "stage", stage: 7, section: null, again: false }, stages).stage, 1);
});

test("buildHash round-trips", () => {
  for (const h of ["#/", "#/?again", "#/1", "#/3/b", "#/1?again", "#/glossary", "#/practice"]) {
    assert.equal(buildHash(parseHash(h)), h);
  }
});

test("next and prev wrap the ring, and wrapping forward sets again", () => {
  assert.deepEqual(nextStage(1), { stage: 2, again: false });
  assert.deepEqual(nextStage(5), { stage: 1, again: true });
  assert.deepEqual(prevStage(1), { stage: 5, again: false });
});

test("an empty path is the landing, with or without again", () => {
  assert.deepEqual(parseHash("#/?again"), { view: "stage", stage: 1, section: null, again: true, landing: true });
  assert.equal(parseHash("#/").landing, true);
  assert.equal(parseHash("").landing, true);
  assert.equal(parseHash("#/1").landing, false);
  assert.equal(buildHash({ view: "stage", stage: 1, section: null, again: true, landing: true }), "#/?again");
  assert.deepEqual(normalize(parseHash("#/?again"), stages), { view: "stage", stage: 1, section: null, again: true, landing: true });
});

test("canonicalHash rewrites unknown stages, sections and views, and leaves canonical hashes alone", () => {
  assert.equal(canonicalHash("#/9/zzz", stages), "#/1");
  assert.equal(canonicalHash("#/2/nothing", stages), "#/2");
  assert.equal(canonicalHash("#/2/b?again&x", stages), "#/2/b?again");
  assert.equal(canonicalHash("#/glossary/extra", stages), "#/glossary");
  assert.equal(canonicalHash("#/zzz", stages), "#/1");
  for (const h of ["#/2", "#/2/b", "#/3?again", "#/glossary", "#/practice", "#/?again"]) {
    assert.equal(canonicalHash(h, stages), null, `${h} is already canonical`);
  }
  for (const h of ["", "#", "#/"]) assert.equal(canonicalHash(h, stages), null, `"${h}" is the landing and stays as typed`);
});
