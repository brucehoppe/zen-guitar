// site/belt.js
import { svg } from "./render/dom.js";
import { markerPositions, rotationFor, wornStops, beltPath } from "./ring.js";

const CX = 200, CY = 200, R = 142, WIDTH = 34, SEAM = 3;

// Each stop carries a belt-stop-N class naming its place in wornStops (0 light, 2 dark),
// so CSS can recolour the belt for dark mode.
function gradient(id, stops, x1, y1, x2, y2, classFor) {
  return svg("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1, y1, x2, y2 },
    stops.map((s, i) => svg("stop", { offset: s.offset, "stop-color": s.color, class: `belt-stop-${classFor(i)}` })));
}

// Shortest signed turn from one angle to another, in (-180, 180].
function shortestTurn(from, to) {
  const d = (((to - from) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

export function buildRing(svgEl, { stages, onSelect }) {
  const defs = svg("defs");
  const rightStops = wornStops(false);
  const last = rightStops.length - 1;
  const leftStops = [...rightStops].reverse().map((s, i) => ({ offset: i / last, color: s.color }));
  const gRight = gradient("belt-right", rightStops, CX, CY - R, CX, CY + R, (i) => i);
  const gLeft = gradient("belt-left", leftStops, CX, CY + R, CX, CY - R, (i) => last - i);
  const fray = svg("filter", { id: "fray", filterUnits: "userSpaceOnUse", x: "0", y: "0", width: "400", height: "400" }, [
    svg("feTurbulence", { baseFrequency: "0.9", numOctaves: "2", seed: "3", result: "n" }),
    svg("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: "2.5" }),
  ]);
  defs.append(gRight, gLeft, fray);

  const rotor = svg("g", { class: "rotor" });
  rotor.append(
    svg("path", { d: beltPath(R, CX, CY, "right", SEAM), fill: "none", stroke: "url(#belt-right)", "stroke-width": WIDTH, filter: "url(#fray)" }),
    svg("path", { d: beltPath(R, CX, CY, "left", SEAM), fill: "none", stroke: "url(#belt-left)", "stroke-width": WIDTH, filter: "url(#fray)" }),
  );

  const markers = new Map();
  markerPositions(stages.length, R, CX, CY).forEach((p, i) => {
    const stage = stages[i];
    const g = svg("g", { class: "marker", role: "button", tabindex: "0", "aria-label": `Stage ${stage.id}: ${stage.title}`, "data-stage": stage.id, transform: `translate(${p.x} ${p.y})` }, [
      svg("circle", { r: 9, class: "marker-dot" }),
      svg("text", { class: "marker-n", "text-anchor": "middle" }, [String(stage.id)]),
    ]);
    const go = () => onSelect(stage.id);
    g.addEventListener("click", go);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    markers.set(stage.id, g);
    rotor.append(g);
  });

  const centre = svg("g", { class: "centre" });
  const koanText = svg("text", { x: CX, y: CY + 4, class: "koan-svg", "text-anchor": "middle" });
  centre.append(koanText);

  svgEl.append(defs, rotor, centre);

  let koanTimer = null;
  let angle = null; // running total, so the ring always turns the short way
  return {
    setStage(n) {
      const target = rotationFor(n, stages.length);
      angle = angle === null ? target : angle + shortestTurn(angle, target);
      rotor.setAttribute("transform", `rotate(${angle})`);
      for (const [id, g] of markers) {
        g.classList.toggle("is-current", id === n);
        g.setAttribute("aria-current", id === n ? "step" : "false");
        // counter-rotate the number so it stays upright
        g.querySelector("text").setAttribute("transform", `rotate(${-angle})`);
      }
    },
    setWorn(again) {
      const stops = wornStops(again);
      gRight.querySelectorAll("stop").forEach((s, i) => s.setAttribute("stop-color", stops[i].color));
      const rev = [...stops].reverse();
      gLeft.querySelectorAll("stop").forEach((s, i) => s.setAttribute("stop-color", rev[i].color));
      svgEl.classList.toggle("is-worn", again);
    },
    highlight(n) {
      for (const [id, g] of markers) g.classList.toggle("is-hot", n !== null && id === n);
    },
    // Returns true when the koan is shown, so callers can mirror it for screen readers.
    showKoan(text, ms = 1200) {
      const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !text) return false;
      clearTimeout(koanTimer);
      koanText.textContent = text;
      svgEl.classList.add("koan-on");
      koanTimer = setTimeout(() => {
        svgEl.classList.remove("koan-on");
        koanTimer = setTimeout(() => { koanText.textContent = ""; }, 400); // after the fade
      }, ms);
      return true;
    },
  };
}
