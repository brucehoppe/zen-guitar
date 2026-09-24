// site/belt.js
import { svg } from "./render/dom.js";
import { markerPositions, rotationFor, wornStops, beltPath } from "./ring.js";

// WIDTH leaves room for the marker dots (r 17 to 21 units) to sit inside the belt.
const CX = 200, CY = 200, R = 142, WIDTH = 44, SEAM = 3;

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
      svg("circle", { r: 40, fill: "transparent", class: "marker-hit" }), // touch target; the dot sits above it
      svg("circle", { r: 25, class: "marker-focus" }), // solid ring, shown only on keyboard focus
      svg("circle", { r: 17, class: "marker-dot" }),
      svg("text", { class: "marker-n", "text-anchor": "middle" }, [String(stage.id)]),
    ]);
    const go = () => onSelect(stage.id);
    g.addEventListener("click", go);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    markers.set(stage.id, g);
    rotor.append(g);
  });

  // Hairline edges on both sides of the belt, so its white end never dissolves into the
  // paper. They are circles, so they need not turn with the rotor.
  const edges = svg("g", { class: "belt-edges", "aria-hidden": "true" }, [
    svg("circle", { cx: CX, cy: CY, r: R + WIDTH / 2, class: "belt-edge" }),
    svg("circle", { cx: CX, cy: CY, r: R - WIDTH / 2, class: "belt-edge" }),
  ]);

  svgEl.append(defs, edges, rotor);

  let angle = null; // running total, so the ring always turns the short way
  return {
    setStage(n) {
      const target = rotationFor(n, stages.length);
      angle = angle === null ? target : angle + shortestTurn(angle, target);
      rotor.setAttribute("transform", `rotate(${angle})`);
      for (const [id, g] of markers) {
        g.classList.toggle("is-current", id === n);
        g.setAttribute("aria-current", id === n ? "step" : "false");
        // Counter-rotate the number so it stays upright. app.css transitions this with the
        // same timing as the rotor, so the two cancel out and the number never tilts mid-turn.
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
  };
}
