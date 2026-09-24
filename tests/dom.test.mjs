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
  assert.equal(s.querySelector("strong.item-title").textContent, "Tune", "step title is its own block line");
  assert.equal(s.querySelector("li").textContent, "TuneGet in tune.");
  const t = renderList({ type: "terms", id: "terms", heading: "Terms", items: [{ term: "Katsu", kanji: "喝", text: "A shout." }] }, ctx);
  assert.match(t.textContent, /喝/);
  assert.equal(t.querySelector("span[lang=\"ja\"]").textContent, "喝");
});

test("renderList handles plain list type as a ul", () => {
  const l = renderList({ type: "list", id: "rules", heading: "Rules", items: [{ title: "Rule", text: "Follow it." }] }, ctx);
  assert.ok(l.querySelector("ul"), "plain list renders as a ul");
  assert.equal(l.querySelector("li").textContent, "Rule. Follow it.", "title and text read as two sentences");
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
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  assert.equal(spokesEls.length, 12);
  spokesEls.forEach((g) => assert.equal(g.getAttribute("tabindex"), "0"));
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  assert.match(w.querySelector(".wheel-detail").textContent, /Core 8/);
  assert.match(w.querySelector(".wheel-detail").textContent, /Sixteen minutes/);
  assert.ok(spokesEls[7].classList.contains("is-selected"));
});

test("renderWheel marks the activated spoke aria-pressed, starting false", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  spokesEls.forEach((g) => assert.equal(g.getAttribute("aria-pressed"), "false"));
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  assert.equal(spokesEls[7].getAttribute("aria-pressed"), "true");
});

test("renderWheel shows no literal \"null\" when a spoke has no exercises", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  spokesEls[0].dispatch("keydown", { key: "Enter" });
  assert.doesNotMatch(w.querySelector(".wheel-detail").textContent, /null/);
});

test("renderWheel selecting a second spoke clears the first", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  spokesEls[2].dispatch("keydown", { key: "Enter" });
  assert.equal(spokesEls[7].classList.contains("is-selected"), false);
  assert.equal(spokesEls[7].getAttribute("aria-pressed"), "false");
  assert.ok(spokesEls[2].classList.contains("is-selected"));
  assert.equal(spokesEls[2].getAttribute("aria-pressed"), "true");
});

test("renderWheel activates on Space and prevents its default", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo" }, items: wheelItems }, wheelCtx);
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  const event = spokesEls[3].dispatch("keydown", { key: " " });
  assert.equal(event.defaultPrevented, true);
  assert.ok(spokesEls[3].classList.contains("is-selected"));
});

const { renderBalance } = await import("../site/render/balance.js");
test("renderBalance shows three pairs, six others, and detail on click", () => {
  const m = (lesson, name) => ({ lesson, name, trap: `${name} trap`, correction: `${name} fix` });
  const b = renderBalance({ type: "balance", id: "missteps", heading: "Missteps", caption: "Return to centre.",
    pairs: [[m("a", "A"), m("b", "B")], [m("c", "C"), m("d", "D")], [m("e", "E"), m("f", "F")]],
    others: ["G", "H", "I", "J", "K", "L"].map((n) => m(n.toLowerCase(), n)) }, ctx);
  assert.equal(b.querySelectorAll("button.pan").length, 6);
  assert.equal(b.querySelectorAll("button.misstep").length, 6);
  b.querySelectorAll("button.pan").forEach((p) => assert.equal(p.getAttribute("aria-pressed"), "false"));
  b.querySelectorAll("button.misstep").forEach((p) => assert.equal(p.getAttribute("aria-pressed"), "false"));
  const groups = b.querySelectorAll(".balance");
  assert.equal(groups[0].getAttribute("role"), "group");
  assert.equal(groups[0].getAttribute("aria-label"), "Opposite pair: A and B");
  b.querySelectorAll("button.pan")[1].dispatch("click");
  assert.match(b.querySelector(".balance-detail").textContent, /B trap/);
  assert.match(b.querySelector(".balance-detail").textContent, /B fix/);
  assert.match(b.querySelector(".balance-detail").textContent, /Its opposite: A/);
  assert.equal(b.querySelectorAll("button.pan")[1].getAttribute("aria-pressed"), "true");
  assert.equal(b.querySelectorAll("button.pan")[0].getAttribute("aria-pressed"), "false");
  b.querySelectorAll("button.misstep")[2].dispatch("click");
  assert.match(b.querySelector(".balance-detail").textContent, /I trap/);
  assert.equal(b.querySelectorAll("button.misstep")[2].getAttribute("aria-pressed"), "true");
  assert.equal(b.querySelectorAll("button.pan")[1].getAttribute("aria-pressed"), "false");
  assert.match(b.textContent, /Return to centre/);
  assert.match(b.textContent, /Standing alone/);
});

test("renderBalance tilts the beam toward the selected pan and levels for an other", () => {
  const m = (lesson, name) => ({ lesson, name, trap: `${name} trap`, correction: `${name} fix` });
  const b = renderBalance({ type: "balance", id: "missteps", heading: "Missteps", caption: "Return to centre.",
    pairs: [[m("a", "A"), m("b", "B")], [m("c", "C"), m("d", "D")], [m("e", "E"), m("f", "F")]],
    others: ["G", "H", "I", "J", "K", "L"].map((n) => m(n.toLowerCase(), n)) }, ctx);
  const balances = b.querySelectorAll(".balance");
  b.querySelectorAll("button.pan")[1].dispatch("click"); // right pan of the first pair
  assert.ok(balances[0].classList.contains("is-tilt-right"));
  b.querySelectorAll("button.misstep")[0].dispatch("click");
  assert.equal(balances[0].classList.contains("is-tilt-right"), false);
  assert.equal(balances[0].classList.contains("is-tilt-left"), false);
});

const { renderTabs } = await import("../site/render/tabs.js");
const { renderCards } = await import("../site/render/cards.js");
const { renderMountains } = await import("../site/render/mountains.js");

test("renderTabs exposes tabs, shows one panel, and switches on click", () => {
  const tab = (id, n) => ({ id, label: id, intro: "x", section: { type: "table", id, heading: id, columns: ["L", "C"], rows: Array.from({ length: n }, (_, i) => ({ cells: [`${id}${i}`, "c"] })) } });
  const t = renderTabs({ type: "tabs", id: "hhh", heading: "HHH", tabs: [tab("head", 2), tab("hand", 1), tab("heart", 1)] }, ctx);
  const tabs = t.querySelectorAll("button[role=\"tab\"]");
  assert.equal(tabs.length, 3);
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  const panels = t.querySelectorAll("div[role=\"tabpanel\"]");
  assert.equal(panels.filter((p) => !p.hidden).length, 1);
  tabs[1].dispatch("click");
  assert.equal(tabs[1].getAttribute("aria-selected"), "true");
  assert.ok(panels[0].hidden && !panels[1].hidden);
});

test("renderTabs moves aria-selected and focus with ArrowRight", () => {
  const tab = (id, n) => ({ id, label: id, intro: "x", section: { type: "table", id, heading: id, columns: ["L", "C"], rows: Array.from({ length: n }, (_, i) => ({ cells: [`${id}${i}`, "c"] })) } });
  const t = renderTabs({ type: "tabs", id: "hhh", heading: "HHH", tabs: [tab("head", 2), tab("hand", 1), tab("heart", 1)] }, ctx);
  const tabs = t.querySelectorAll("button[role=\"tab\"]");
  tabs[0].dispatch("keydown", { key: "ArrowRight" });
  assert.equal(tabs[1].getAttribute("aria-selected"), "true");
  assert.equal(tabs[0].getAttribute("aria-selected"), "false");
  assert.equal(document.activeElement, tabs[1]);
});

test("renderCards flips on click, reports aria-pressed, and hides the inactive face", () => {
  const c = renderCards({ type: "cards", id: "dualities", heading: "Six", items: [{ lesson: "silence", front: "Sound and silence", back: "Every silence equals every sound." }] }, ctx);
  const card = c.querySelector("button.card");
  const front = card.querySelector(".card-front");
  const back = card.querySelector(".card-back");
  assert.equal(card.getAttribute("aria-pressed"), "false");
  assert.equal(front.getAttribute("aria-hidden"), "false");
  assert.equal(back.getAttribute("aria-hidden"), "true");
  card.dispatch("click");
  assert.equal(card.getAttribute("aria-pressed"), "true");
  assert.ok(card.classList.contains("is-flipped"));
  assert.equal(front.getAttribute("aria-hidden"), "true");
  assert.equal(back.getAttribute("aria-hidden"), "false");
  assert.match(c.textContent, /Every silence/);
});

test("renderMountains draws three captioned figures", () => {
  const m = renderMountains({ type: "mountains", id: "mountains", heading: "Mountain", items: [1, 2, 3].map((i) => ({ caption: `M${i}`, text: `T${i}` })) }, ctx);
  assert.equal(m.querySelectorAll("figure").length, 3);
  assert.match(m.textContent, /M3/);
});

const { renderMaxims } = await import("../site/render/maxims.js");
const { renderGlossary } = await import("../site/render/glossary.js");
const { renderPractice } = await import("../site/render/practice.js");

test("maxims trace back to their stage on focus and clear on blur", () => {
  const calls = [];
  const c = { ...ctx, lessons: { speed: { stage: 2, section: "missteps", label: "Speed" } }, maxims: [{ text: "Be quick, not hasty.", lesson: "speed" }, { text: "Keep going." }], highlightStage: (n) => calls.push(n) };
  const m = renderMaxims({ type: "maxims", id: "maxims", heading: "The Way" }, c);
  const items = m.querySelectorAll("li.maxim");
  assert.equal(items.length, 2);
  const link = items[0].querySelector("a");
  assert.equal(link.getAttribute("href"), "#/2/missteps");
  link.dispatch("focus");
  assert.deepEqual(calls, [2]);
  assert.match(m.querySelector(".trace").textContent, /Speed/);
  link.dispatch("blur");
  assert.deepEqual(calls, [2, null]);
  assert.match(m.querySelector(".trace").textContent, /Last traced:.*Speed/);
  assert.equal(m.querySelector(".trace").querySelector("a"), null, "the trace line is text only, not a link");
  assert.equal(items[1].querySelector("a"), null, "untraceable maxims are not links");
});

test("maxims trace back to their stage on mouseenter and clear on mouseleave", () => {
  const calls = [];
  const c = { ...ctx, lessons: { speed: { stage: 2, section: "missteps", label: "Speed" } }, maxims: [{ text: "Be quick, not hasty.", lesson: "speed" }], highlightStage: (n) => calls.push(n) };
  const m = renderMaxims({ type: "maxims", id: "maxims", heading: "The Way" }, c);
  const link = m.querySelector("a");
  link.dispatch("mouseenter");
  assert.deepEqual(calls, [2]);
  assert.match(m.querySelector(".trace").textContent, /Speed/);
  link.dispatch("mouseleave");
  assert.deepEqual(calls, [2, null]);
  assert.match(m.querySelector(".trace").textContent, /Last traced:.*Speed/);
});

test("glossary filters as you type and reports a status line", () => {
  const c = { ...ctx, glossary: [{ term: "Chudan", literal: "Middle ground", usage: "Centre of balance." }, { term: "Mu", literal: "No-thing", usage: "The void." }] };
  const g = renderGlossary(c);
  const input = g.querySelector("input");
  const status = g.querySelector("[role=\"status\"]");
  assert.equal(status.textContent, "2 terms");
  input.value = "void"; input.dispatch("input");
  const rows = g.querySelectorAll("tr[data-term]");
  assert.equal(rows.filter((r) => !r.hidden).length, 1);
  assert.equal(status.textContent, "1 term");
  input.value = "nothing matches this"; input.dispatch("input");
  assert.equal(status.textContent, "No terms match");
});

test("practice groups exercises by belt in order and links each trains-tag to its lesson", () => {
  const c = { ...ctx, lessons: { play: { stage: 1, section: "steps", label: "Play" } }, exercises: [
    { belt: "black", name: "Frame one note", text: "…", lessons: ["play"] },
    { belt: "white", name: "One-note practice", text: "…", lessons: ["play"] } ] };
  const p = renderPractice(c);
  const hs = p.querySelectorAll("h3").map((h) => h.textContent);
  assert.deepEqual(hs, ["White belt", "Black belt"]);
  assert.match(p.textContent, /Play/);
  const tag = p.querySelector("a.trains-tag");
  assert.equal(tag.getAttribute("href"), "#/1/steps");
});

const { renderMatch } = await import("../site/render/match.js");
test("match locks correct pairs into an answer key, removes the lesson choice, and clears wrong ones", () => {
  const c = { ...ctx, lessons: { a: { stage: 1, section: "s", label: "Alpha" }, b: { stage: 2, section: "s", label: "Beta" } }, shuffle: (x) => x };
  const m = renderMatch({ type: "match", id: "match", heading: "Match", items: [{ image: "Teacup", lesson: "a" }, { image: "Bulb", lesson: "b" }] }, c);
  const imgs = m.querySelectorAll("button.match-img"), les = m.querySelectorAll("button.match-lesson");
  assert.equal(les[0].hasAttribute("aria-pressed"), false, "lesson buttons carry no aria-pressed");
  imgs[0].dispatch("click"); les[1].dispatch("click");           // wrong
  assert.ok(les[1].classList.contains("is-wrong"));
  assert.ok(!imgs[0].classList.contains("is-selected"));
  imgs[0].dispatch("click"); les[0].dispatch("click");           // right
  assert.ok(imgs[0].classList.contains("is-matched"));
  assert.equal(imgs[0].getAttribute("disabled"), "");
  assert.equal(imgs[0].textContent, "Teacup → Alpha");
  assert.equal(m.querySelectorAll("button.match-lesson").length, 1, "the matched lesson button is removed");
  assert.match(m.querySelector(".match-status").textContent, /1 of 2/);
});

test("match reports choosing a lesson before an image", () => {
  const c = { ...ctx, lessons: { a: { stage: 1, section: "s", label: "Alpha" } }, shuffle: (x) => x };
  const m = renderMatch({ type: "match", id: "match", heading: "Match", items: [{ image: "Teacup", lesson: "a" }] }, c);
  m.querySelector("button.match-lesson").dispatch("click");
  assert.equal(m.querySelector(".match-status").textContent, "Choose an image first.");
});

test("match's completion text is hard-coded and the grid marks itself complete", () => {
  const items = Array.from({ length: 10 }, (_, i) => ({ image: `Item ${i}`, lesson: `l${i}` }));
  const lessons = Object.fromEntries(items.map((it, i) => [it.lesson, { stage: 1, section: "s", label: `Lesson ${i}` }]));
  const c = { ...ctx, lessons, shuffle: (x) => x };
  const m = renderMatch({ type: "match", id: "match", heading: "Match", items }, c);
  const grid = m.querySelector(".match");
  const imgs = m.querySelectorAll("button.match-img");
  for (let i = 0; i < 10; i++) {
    imgs[i].dispatch("click");
    m.querySelectorAll("button.match-lesson")[0].dispatch("click");
  }
  assert.equal(m.querySelector(".match-status").textContent, "All ten. Now go play.");
  assert.ok(grid.classList.contains("is-complete"));
});

test("renderWheel lists the point names, numbered, and a name selects its spoke", () => {
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo" }, items: wheelItems }, wheelCtx);
  const legend = w.querySelector("ol.wheel-legend");
  assert.equal(legend.children.length, 12);
  assert.equal(legend.children[3].textContent, "Point 4");
  legend.children[7].querySelector("button").dispatch("click");
  assert.match(w.querySelector(".wheel-detail").textContent, /Core 8/);
  assert.equal(w.querySelectorAll("g[role=\"button\"]")[7].getAttribute("aria-pressed"), "true");
});

test("Glossary and Practice show a back link to the last stage only when one was visited", () => {
  const base = { ...ctx, glossary: [{ term: "Mu", literal: "No-thing", usage: "The void." }], exercises: [] };
  for (const render of [renderGlossary, renderPractice]) {
    const withStage = render({ ...base, lastStage: { title: "Black Belt", href: "#/3/key-ideas" } });
    const back = withStage.querySelector("a.back-link");
    assert.ok(back, render.name);
    assert.equal(back.textContent, "← Back to Black Belt");
    assert.equal(back.getAttribute("href"), "#/3/key-ideas");
    assert.equal(withStage.children[0], back, "the link sits above the title");
    assert.equal(render({ ...base, lastStage: null }).querySelector("a.back-link"), null, `${render.name} without a stage`);
  }
});
