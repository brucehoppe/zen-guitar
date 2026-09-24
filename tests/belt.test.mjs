import { test } from "node:test";
import assert from "node:assert/strict";
import { install, document } from "./fake-dom.mjs";
install();
const { buildRing } = await import("../site/belt.js");

const stages = [1, 2, 3, 4, 5].map((id) => ({ id, title: `T${id}` }));

function setup() {
  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const picked = [];
  const ring = buildRing(svgEl, { stages, onSelect: (n) => picked.push(n) });
  const rotor = svgEl.querySelector("g.rotor");
  const marker = (n) => svgEl.querySelector(`g[data-stage="${n}"]`);
  const angle = () => Number(rotor.getAttribute("transform").match(/rotate\((-?[\d.]+)/)[1]);
  return { svgEl, ring, picked, rotor, marker, angle };
}

test("setStage marks the current marker and turns the rotor", () => {
  const { ring, rotor, marker } = setup();
  ring.setStage(2);
  assert.ok(marker(2).classList.contains("is-current"));
  assert.equal(marker(2).getAttribute("aria-current"), "step");
  assert.equal(marker(1).getAttribute("aria-current"), "false");
  assert.match(rotor.getAttribute("transform"), /rotate\(-72/);
});

test("each marker has an invisible hit circle drawn beneath its dot", () => {
  const { marker } = setup();
  for (const n of [1, 2, 3, 4, 5]) {
    const hit = marker(n).querySelector("circle.marker-hit");
    assert.ok(hit, `marker ${n}`);
    assert.equal(marker(n).children[0], hit);
    assert.equal(hit.getAttribute("r"), "40");
  }
});

test("stage 5 to stage 1 turns one step forward, not back around the ring", () => {
  const { ring, angle } = setup();
  ring.setStage(5);
  const at5 = angle();
  ring.setStage(1);
  assert.equal(angle() - at5, -72);
  ring.setStage(5);
  assert.equal(angle(), at5);
});

test("setWorn recolours the stops and marks the ring worn", () => {
  const { svgEl, ring } = setup();
  ring.setWorn(true);
  const stops = svgEl.querySelector('linearGradient[id="belt-right"]').querySelectorAll("stop");
  assert.equal(stops[2].getAttribute("stop-color"), "#2a2825");
  assert.ok(svgEl.classList.contains("is-worn"));
});

test("Enter and Space on a marker select its stage", () => {
  const { marker, picked } = setup();
  marker(3).dispatch("keydown", { key: "Enter" });
  const space = marker(4).dispatch("keydown", { key: " " });
  assert.deepEqual(picked, [3, 4]);
  assert.equal(space.defaultPrevented, true);
});

test("the ring carries no koan of its own; the HTML #koan line is the only one", () => {
  const { svgEl, ring } = setup();
  assert.equal(ring.showKoan, undefined);
  assert.equal(svgEl.querySelector("text.koan-svg"), null);
  assert.deepEqual(svgEl.querySelectorAll("text").map((t) => t.getAttribute("class")), Array(5).fill("marker-n"));
});

test("markers are sized to read: dot r 17 inside a belt wide enough to hold it, with a focus ring", () => {
  const { svgEl, marker } = setup();
  const edges = svgEl.querySelectorAll("circle.belt-edge").map((c) => Number(c.getAttribute("r"))).sort((a, b) => a - b);
  assert.equal(edges.length, 2, "hairline edges on both sides of the belt");
  const [inner, outer] = edges;
  for (const n of [1, 2, 3, 4, 5]) {
    const dot = Number(marker(n).querySelector("circle.marker-dot").getAttribute("r"));
    assert.equal(dot, 17);
    assert.ok(142 - dot >= inner && 142 + 21 <= outer, "dots up to r 21 (phones) stay inside the belt");
    assert.ok(marker(n).querySelector("circle.marker-focus"), `marker ${n} focus ring`);
  }
});
