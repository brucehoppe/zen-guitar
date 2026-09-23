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

test("showKoan does nothing under reduced motion", () => {
  const saved = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: true });
  try {
    const { svgEl, ring } = setup();
    ring.showKoan("Not yet.");
    assert.equal(svgEl.querySelector("text.koan-svg").textContent, "");
    assert.ok(!svgEl.classList.contains("koan-on"));
  } finally {
    globalThis.matchMedia = saved;
  }
});
