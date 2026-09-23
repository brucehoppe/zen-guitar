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

test("renderRecall leaves out the Recall section when there is nothing to recall", () => {
  const r = renderRecall({ recall: [], reflection: ["Who are you?"] });
  assert.equal(r.querySelector("section.sec-recall"), null);
  assert.ok(r.querySelector("section.sec-reflect"));
});

test("renderStage has no stage counter and a focusable title", () => {
  const out = renderStage({ id: 2, title: "T", subtitle: "S", intro: "I", sections: [], recall: [], reflection: [] }, ctx);
  assert.equal(out.querySelector("p.eyebrow"), null);
  assert.equal(out.querySelector("h2").getAttribute("tabindex"), "-1");
});

const { renderWheel } = await import("../site/render/wheel.js");
const wheelItems = Array.from({ length: 12 }, (_, i) => ({ lesson: `l${i}`, name: `Point ${i + 1}`, core: `Core ${i + 1}`, image: `Image ${i + 1}` }));
const wheelCtx = { ...ctx, exercisesFor: (l) => (l === "l7" ? [{ name: "Sixteen minutes", text: "One more minute a day." }] : []) };

test("renderWheel makes 12 keyboard-reachable spokes and shows detail on activation", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo", kanji: "修行", gloss: "training" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  assert.equal(spokesEls.length, 12);
  spokesEls.forEach((g) => assert.equal(g.getAttribute("tabindex"), "0"));
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  assert.match(w.querySelector(".wheel-detail").textContent, /Core 8/);
  assert.match(w.querySelector(".wheel-detail").textContent, /Sixteen minutes/);
  assert.ok(spokesEls[7].classList.contains("is-selected"));
});

test("renderWheel marks the activated spoke aria-pressed, starting false", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo", kanji: "修行", gloss: "training" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  spokesEls.forEach((g) => assert.equal(g.getAttribute("aria-pressed"), "false"));
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  assert.equal(spokesEls[7].getAttribute("aria-pressed"), "true");
});

test("renderWheel shows no literal \"null\" when a spoke has no exercises", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo", kanji: "修行", gloss: "training" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  spokesEls[0].dispatch("keydown", { key: "Enter" });
  assert.doesNotMatch(w.querySelector(".wheel-detail").textContent, /null/);
});

test("renderWheel selecting a second spoke clears the first", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo", kanji: "修行", gloss: "training" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  spokesEls[2].dispatch("keydown", { key: "Enter" });
  assert.equal(spokesEls[7].classList.contains("is-selected"), false);
  assert.equal(spokesEls[7].getAttribute("aria-pressed"), "false");
  assert.ok(spokesEls[2].classList.contains("is-selected"));
  assert.equal(spokesEls[2].getAttribute("aria-pressed"), "true");
});

test("renderWheel activates on Space and prevents its default", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo", kanji: "修行", gloss: "training" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  const event = spokesEls[3].dispatch("keydown", { key: " " });
  assert.equal(event.defaultPrevented, true);
  assert.ok(spokesEls[3].classList.contains("is-selected"));
});
