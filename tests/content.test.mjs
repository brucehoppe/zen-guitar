import { test } from "node:test";
import assert from "node:assert/strict";
import { stages, lessons, glossary, exercises, maxims } from "../site/content/index.js";

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

test("lessons point at real stages and sections", () => {
  for (const [id, l] of Object.entries(lessons)) {
    const s = stages.find((x) => x.id === l.stage);
    assert.ok(s, `${id}: stage ${l.stage}`);
    if (s) assert.ok(s.sections.some((sec) => sec.id === l.section), `${id}: section ${l.section}`);
    assert.ok(l.label, `${id}: label`);
  }
});


const byId = (n) => stages.find((s) => s.id === n);
const section = (n, id) => byId(n).sections.find((s) => s.id === id);

test("five stages in order with emblem and koan", () => {
  assert.deepEqual(stages.map((s) => s.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(stages.map((s) => s.emblem), ["teacup", "fist", "hand", "mountain", "enso"]);
  for (const s of stages) assert.ok(s.koan && s.intro && s.slug);
});

test("the book's counts hold", () => {
  assert.equal(section(2, "points").items.length, 12);
  const b = section(2, "missteps");
  assert.equal(b.pairs.length, 3);
  assert.equal(b.pairs.flat().length + b.others.length, 12);
  assert.equal(section(3, "responsibilities").items.length, 5);
  const tabs = section(3, "hhh").tabs;
  assert.deepEqual(tabs.map((t) => t.section.rows.length), [11, 8, 7]);
  assert.equal(section(4, "mountains").items.length, 3);
  assert.equal(section(4, "dualities").items.length, 6);
  assert.equal(section(5, "match").items.length, 10);
  assert.equal(glossary.length, 20);
  assert.ok(exercises.length >= 20);
  assert.ok(maxims.length >= 10);
});

test("every lesson reference resolves", () => {
  const refs = [];
  for (const s of stages) for (const sec of s.sections) {
    for (const it of sec.items ?? []) if (it.lesson) refs.push([`${s.id}/${sec.id}`, it.lesson]);
    for (const r of sec.rows ?? []) if (r.lesson) refs.push([`${s.id}/${sec.id}`, r.lesson]);
    for (const pair of sec.pairs ?? []) for (const it of pair) refs.push([`${s.id}/${sec.id}`, it.lesson]);
    for (const it of sec.others ?? []) refs.push([`${s.id}/${sec.id}`, it.lesson]);
    for (const t of sec.tabs ?? []) for (const r of t.section.rows) if (r.lesson) refs.push([`${s.id}/${t.id}`, r.lesson]);
  }
  for (const e of exercises) for (const l of e.lessons) refs.push([`exercise ${e.name}`, l]);
  for (const m of maxims) if (m.lesson) refs.push([`maxim ${m.text}`, m.lesson]);
  for (const [where, id] of refs) assert.ok(lessons[id], `${where} -> unknown lesson "${id}"`);
});

test("wheel and balance items each carry a distinct lesson id", () => {
  const ids = [...section(2, "points").items, ...section(2, "missteps").pairs.flat(), ...section(2, "missteps").others].map((i) => i.lesson);
  assert.equal(new Set(ids).size, 24);
});

test("exercises use only the four belts", () => {
  for (const e of exercises) assert.ok(["white", "practice", "black", "barrier"].includes(e.belt), e.name);
});

function* strings(value) {
  if (typeof value === "string") yield value;
  else if (Array.isArray(value)) for (const v of value) yield* strings(v);
  else if (value && typeof value === "object") for (const v of Object.values(value)) yield* strings(v);
}

test("copy uses Canadian spelling and no exclamation marks", () => {
  for (const str of strings([stages, glossary, exercises, maxims])) {
    assert.doesNotMatch(str, /\b(color|center|armor|traveling)\b/, str);
    assert.ok(!str.includes("!"), `exclamation mark: ${str}`);
  }
});

const hhhRows = () => section(3, "hhh").tabs.flatMap((t) => t.section.rows);
const labelled = () => [
  ...section(2, "points").items,
  ...section(2, "missteps").pairs.flat(),
  ...section(2, "missteps").others,
  ...section(4, "dualities").items,
  ...hhhRows(),
];

test("every wheel item, balance item, card, row and responsibility carries a lesson", () => {
  for (const x of [...labelled(), ...section(3, "responsibilities").items]) assert.ok(x.lesson, JSON.stringify(x).slice(0, 60));
});

test("lesson labels match the names shown on screen", () => {
  for (const x of labelled()) assert.equal(lessons[x.lesson].label, x.name ?? x.front ?? x.cells[0]);
});

test("exact counts for exercises, maxims, rules, steps and recall", () => {
  assert.equal(exercises.length, 22);
  const perBelt = ["white", "practice", "black", "barrier"].map((b) => exercises.filter((e) => e.belt === b).length);
  assert.deepEqual(perBelt, [3, 8, 7, 4]);
  assert.equal(maxims.length, 12);
  assert.equal(section(2, "collaboration").items.length, 4);
  assert.equal(section(1, "steps").items.length, 4);
  assert.deepEqual(stages.map((s) => s.recall.length), [2, 4, 3, 3, 0]);
});

test("structural rulings hold", () => {
  assert.deepEqual(byId(2).sections.map((s) => s.id), ["points", "missteps", "collaboration"]);
  assert.deepEqual(byId(5).sections.map((s) => s.id), ["maxims", "match"]);
  assert.deepEqual(byId(5).recall, []);
  for (const s of stages) assert.ok(s.reflection.length >= 1, `stage ${s.id} reflection`);
  for (const t of section(3, "hhh").tabs) assert.equal(t.id, t.section.id);
  for (const m of section(4, "mountains").items) assert.equal(m.lesson, undefined);
  for (const r of section(3, "responsibilities").items) assert.equal(r.lesson, "responsibilities");
});
