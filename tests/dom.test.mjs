import { test } from "node:test";
import assert from "node:assert/strict";
import { install } from "./fake-dom.mjs";
install();
const { el } = await import("../site/render/dom.js");
const { renderTable } = await import("../site/render/table.js");
const { renderList } = await import("../site/render/list.js");
const { renderRecall } = await import("../site/render/recall.js");

const ctx = { lessons: {}, highlightStage() {}, exercisesFor: () => [] };

test("el builds attributes, text and listeners", () => {
  let clicked = 0;
  const b = el("button", { class: "x", "aria-label": "Go", onclick: () => clicked++ }, ["Go"]);
  assert.equal(b.tagName, "button");
  assert.equal(b.getAttribute("aria-label"), "Go");
  assert.equal(b.textContent, "Go");
  b.dispatch("click");
  assert.equal(clicked, 1);
});

test("renderTable puts every cell in and tags lesson rows", () => {
  const t = renderTable({ type: "table", id: "ideas", heading: "Key ideas", columns: ["A", "B"], rows: [{ lesson: "empty-cup", cells: ["Empty cup", "Pour it out"] }] }, ctx);
  assert.equal(t.querySelectorAll("th").length, 2);
  assert.equal(t.querySelectorAll("td").length, 2);
  assert.equal(t.querySelector("tr[data-lesson]").getAttribute("data-lesson"), "empty-cup");
  assert.match(t.textContent, /Pour it out/);
});

test("renderList handles steps (ordered) and terms (with kanji)", () => {
  const s = renderList({ type: "steps", id: "steps", heading: "Steps", items: [{ title: "Tune", text: "Get in tune." }] }, ctx);
  assert.equal(s.querySelector("ol").children.length, 1);
  const t = renderList({ type: "terms", id: "terms", heading: "Terms", items: [{ term: "Katsu", kanji: "喝", text: "A shout." }] }, ctx);
  assert.match(t.textContent, /喝/);
  assert.equal(t.querySelector("span[lang=\"ja\"]").textContent, "喝");
});

test("renderRecall reveals answers on click and never shows them by default", () => {
  const r = renderRecall({ recall: [{ q: "Why?", a: "Because." }], reflection: ["Who are you?"] });
  const details = r.querySelector("details");
  assert.ok(details, "uses details/summary so keyboard works for free");
  assert.equal(details.getAttribute("open"), null);
  assert.match(r.textContent, /Who are you\?/);
});
