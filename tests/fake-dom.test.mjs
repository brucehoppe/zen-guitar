import { test } from "node:test";
import assert from "node:assert/strict";
import { install } from "./fake-dom.mjs";
install();
const { el } = await import("../site/render/dom.js");

test("querySelectorAll supports tag, .class, tag.class, tag[attr], tag[attr=\"v\"]", () => {
  const root = el("div", {}, [
    el("h3", { class: "sec-h" }, ["Heading"]),
    el("p", { class: "muted", "data-x": "1" }, ["Text"]),
    el("span", { "aria-hidden": "true" }, ["Hidden"]),
  ]);
  assert.equal(root.querySelectorAll("h3").length, 1);
  assert.equal(root.querySelectorAll(".muted").length, 1);
  assert.equal(root.querySelectorAll("p.muted").length, 1);
  assert.equal(root.querySelectorAll("p[data-x]").length, 1);
  assert.equal(root.querySelectorAll("p[data-x=\"1\"]").length, 1);
  assert.equal(root.querySelectorAll("p[data-x=\"2\"]").length, 0);
});

test("querySelectorAll throws on an unsupported selector", () => {
  const root = el("div");
  assert.throws(() => root.querySelectorAll("div > p"), /fake-dom: unsupported selector/);
  assert.throws(() => root.querySelectorAll("p, span"), /fake-dom: unsupported selector/);
});

test("hidden round-trips via the property and via el(..., { hidden: true })", () => {
  const a = el("div");
  assert.equal(a.hidden, false);
  a.hidden = true;
  assert.equal(a.hidden, true);
  assert.equal(a.getAttribute("hidden"), "");
  a.hidden = false;
  assert.equal(a.hidden, false);
  assert.equal(a.hasAttribute("hidden"), false);

  const b = el("div", { hidden: true });
  assert.equal(b.hidden, true);
});

test("innerHTML = \"\" clears children, and a non-empty value throws", () => {
  const div = el("div", {}, [el("span", {}, ["x"])]);
  assert.equal(div.children.length, 1);
  div.innerHTML = "";
  assert.equal(div.children.length, 0);
  assert.throws(() => { div.innerHTML = "<b>no</b>"; }, /fake-dom: innerHTML with content is not allowed/);
});

test("children excludes text nodes while textContent includes them", () => {
  const div = el("div", {}, ["some text", el("span", {}, ["child"])]);
  assert.equal(div.children.length, 1);
  assert.equal(div.children[0].tagName, "span");
  assert.equal(div.textContent, "some textchild");
});

test("classList.toggle honours an explicit force argument", () => {
  const div = el("div", { class: "a" });
  assert.equal(div.classList.toggle("a", true), true);
  assert.equal(div.classList.contains("a"), true);
  assert.equal(div.classList.toggle("a", false), false);
  assert.equal(div.classList.contains("a"), false);
  assert.equal(div.getAttribute("class"), null, "removing the last class drops the attribute");
});

test("dispatch returns an event whose defaultPrevented flips when a listener calls preventDefault", () => {
  const b = el("button", { onclick: (ev) => ev.preventDefault() });
  const ev = b.dispatch("click");
  assert.equal(ev.type, "click");
  assert.equal(ev.target, b);
  assert.equal(ev.defaultPrevented, true);
});
