// site/render/mountains.js
import { el, svg, heading } from "./dom.js";

const SILHOUETTE = "M12 104 L70 40 L92 62 L118 28 L188 104";

const silhouette = () => svg("path", { d: SILHOUETTE, class: "brush" });

const FIGURES = [
  () => [silhouette()],
  () => [
    silhouette(),
    svg("rect", { x: 0, y: 48, width: 200, height: 22, rx: 11, fill: "var(--paper)" }),
    svg("rect", { x: 0, y: 62, width: 200, height: 12, rx: 11, fill: "var(--paper)", opacity: ".8" }),
    svg("path", { d: "M20 60 Q60 52 100 60 T180 60", class: "cloud-line" }),
  ],
  () => [
    svg("circle", { cx: 150, cy: 30, r: 9, fill: "var(--accent)", "fill-opacity": ".7", stroke: "none" }),
    silhouette(),
  ],
];

export function renderMountains(section) {
  const figs = section.items.map((it, i) => el("figure", { class: "mountain" }, [
    svg("svg", { viewBox: "0 0 200 120", class: "mountain-svg", "aria-hidden": "true" }, FIGURES[i % FIGURES.length]()),
    el("figcaption", {}, [el("strong", {}, [it.caption]), el("br"), it.text]),
  ]));
  return el("section", { class: "sec sec-mountains", "aria-labelledby": `sec-${section.id}` }, [heading(section), el("div", { class: "mountains" }, figs)]);
}
