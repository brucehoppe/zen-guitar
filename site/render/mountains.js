// site/render/mountains.js
import { el, svg, heading } from "./dom.js";
import { MOUNTAINS } from "../emblems.js";

export function renderMountains(section) {
  const figs = section.items.map((it, i) => el("figure", { class: "mountain" }, [
    svg("svg", { viewBox: "0 0 200 160", class: "mountain-svg", "aria-hidden": "true" }, [svg("path", { d: MOUNTAINS[i % MOUNTAINS.length], class: "brush" })]),
    el("figcaption", {}, [el("strong", {}, [it.caption]), el("br"), it.text]),
  ]));
  return el("section", { class: "sec sec-mountains", "aria-labelledby": `sec-${section.id}` }, [heading(section), el("div", { class: "mountains" }, figs)]);
}
