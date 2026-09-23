import { test } from "node:test";
import assert from "node:assert/strict";
import { install } from "./fake-dom.mjs";
install();
const { el, svg, heading, kanji } = await import("../site/render/dom.js");
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

test("el applies attribute rules: true becomes empty string, false/null/undefined are skipped", () => {
  const b = el("input", { disabled: true, hidden: false, "data-x": null, "data-y": undefined, type: "text" });
  assert.equal(b.getAttribute("disabled"), "");
  assert.equal(b.hasAttribute("hidden"), false);
  assert.equal(b.hasAttribute("data-x"), false);
  assert.equal(b.hasAttribute("data-y"), false);
  assert.equal(b.getAttribute("type"), "text");
});

test("svg builds an element in the SVG namespace", () => {
  const s = svg("circle", { r: "4" });
  assert.equal(s.tagName, "circle");
  assert.equal(s.namespaceURI, "http://www.w3.org/2000/svg");
});

test("heading builds an id from the section id", () => {
  const h = heading({ id: "ideas", heading: "Key ideas" });
  assert.equal(h.getAttribute("id"), "sec-ideas");
  assert.equal(h.textContent, "Key ideas");
});

test("kanji returns null without text and a lang=ja span with it", () => {
  assert.equal(kanji(null), null);
  assert.equal(kanji(""), null);
  const k = kanji("喝");
  assert.equal(k.getAttribute("lang"), "ja");
  assert.equal(k.textContent, "喝");
});

test("renderTable puts every cell in and tags lesson rows", () => {
  const t = renderTable({ type: "table", id: "ideas", heading: "Key ideas", columns: ["A", "B"], rows: [{ lesson: "empty-cup", cells: ["Empty cup", "Pour it out"] }] }, ctx);
  assert.equal(t.querySelectorAll("th").length, 3);
  assert.equal(t.querySelectorAll("td").length, 1);
  assert.equal(t.querySelectorAll("th")[2].getAttribute("scope"), "row");
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

test("renderList handles plain list type as a ul", () => {
  const l = renderList({ type: "list", id: "rules", heading: "Rules", items: [{ title: "Rule", text: "Follow it." }] }, ctx);
  assert.ok(l.querySelector("ul"), "plain list renders as a ul");
});

test("renderRecall keeps answers inside details", () => {
  const r = renderRecall({ recall: [{ q: "Why?", a: "Because." }], reflection: ["Who are you?"] });
  const details = r.querySelector("details");
  assert.ok(details, "uses details/summary so keyboard works for free");
  assert.equal(details.getAttribute("open"), null);
  assert.match(details.querySelector("p").textContent, /Because\./);
  assert.match(r.textContent, /Who are you\?/);
});

const { renderStage } = await import("../site/render/panel.js");
test("renderStage falls back to a heading paragraph for an unknown section type", () => {
  const out = renderStage({ id: 9, title: "T", subtitle: "S", intro: "I", sections: [{ type: "nope", id: "x", heading: "Mystery" }], recall: [], reflection: [] }, ctx);
  assert.match(out.textContent, /Mystery/);
  assert.ok(out.querySelector("section.sec-fallback"));
});
