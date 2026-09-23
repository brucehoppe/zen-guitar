// site/belt.js
import { svg } from "./render/dom.js";
import { markerPositions, rotationFor, wornStops, beltPath } from "./ring.js";

const CX = 200, CY = 200, R = 142, WIDTH = 34;

function gradient(id, stops, x1, y1, x2, y2) {
  return svg("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1, y1, x2, y2 },
    stops.map((s) => svg("stop", { offset: s.offset, "stop-color": s.color })));
}

export function buildRing(svgEl, { stages, onSelect }) {
  const defs = svg("defs");
  const rightStops = wornStops(false);
  const leftStops = [...rightStops].reverse().map((s, i) => ({ offset: i / (rightStops.length - 1), color: s.color }));
  const gRight = gradient("belt-right", rightStops, CX, CY - R, CX, CY + R);
  const gLeft = gradient("belt-left", leftStops, CX, CY + R, CX, CY - R);
  const fray = svg("filter", { id: "fray", x: "-5%", y: "-5%", width: "110%", height: "110%" }, [
    svg("feTurbulence", { baseFrequency: "0.9", numOctaves: "2", seed: "3", result: "n" }),
    svg("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: "2.5" }),
  ]);
  defs.append(gRight, gLeft, fray);

  const rotor = svg("g", { class: "rotor" });
  rotor.append(
    svg("path", { d: beltPath(R, CX, CY, "right"), fill: "none", stroke: "url(#belt-right)", "stroke-width": WIDTH, filter: "url(#fray)" }),
    svg("path", { d: beltPath(R, CX, CY, "left"), fill: "none", stroke: "url(#belt-left)", "stroke-width": WIDTH, filter: "url(#fray)" }),
    svg("circle", { cx: CX, cy: CY, r: R + 10, class: "stitch" }),
    svg("circle", { cx: CX, cy: CY, r: R - 10, class: "stitch" }),
  );

  const markers = new Map();
  markerPositions(stages.length, R, CX, CY).forEach((p, i) => {
    const stage = stages[i];
    const g = svg("g", { class: "marker", role: "button", tabindex: "0", "aria-label": `Stage ${stage.id}: ${stage.title}`, "data-stage": stage.id, transform: `translate(${p.x} ${p.y})` }, [
      svg("circle", { r: 9, class: "marker-dot" }),
      svg("text", { y: 3, class: "marker-n", "text-anchor": "middle" }, [String(stage.id)]),
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
  return {
    setStage(n) {
      rotor.setAttribute("transform", `rotate(${rotationFor(n, stages.length)} ${CX} ${CY})`);
      for (const [id, g] of markers) {
        g.classList.toggle("is-current", id === n);
        g.setAttribute("aria-current", id === n ? "step" : "false");
        // counter-rotate the number so it stays upright
        g.querySelector("text").setAttribute("transform", `rotate(${-rotationFor(n, stages.length)})`);
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
    showKoan(text, ms = 1200) {
      const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !text) return;
      clearTimeout(koanTimer);
      koanText.textContent = text;
      svgEl.classList.add("koan-on");
      koanTimer = setTimeout(() => { svgEl.classList.remove("koan-on"); }, ms);
    },
  };
}
