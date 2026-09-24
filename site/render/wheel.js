import { el, svg, heading } from "./dom.js";
import { spokes, splitLabel, WHEEL } from "./wheel-geometry.js";

const { cx: CX, cy: CY, inner: INNER, outer: OUTER, view: VIEW } = WHEEL;

export function renderWheel(section, ctx) {
  const detail = el("div", { class: "wheel-detail", "aria-live": "polite" }, [el("p", { class: "muted" }, ["Choose a spoke."])]);
  const geo = spokes(section.items.length, INNER, OUTER, CX, CY);
  const root = svg("svg", { viewBox: `${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`, class: "wheel", role: "group", "aria-label": section.heading });
  root.append(
    svg("circle", { cx: CX, cy: CY, r: OUTER, class: "wheel-rim" }),
    svg("circle", { cx: CX, cy: CY, r: INNER, class: "wheel-hub" }),
    svg("text", { x: CX, y: CY + 4, class: "wheel-hub-t", "text-anchor": "middle" }, [section.hub.term]),
  );
  const groups = [];
  const selectors = [];
  section.items.forEach((item, i) => {
    const g = geo[i];
    const grp = svg("g", { class: "spoke", role: "button", tabindex: "0", "aria-pressed": "false", "aria-label": `${i + 1}. ${item.name}` }, [
      svg("line", { x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, class: "spoke-line" }),
      svg("line", { x1: g.hx1, y1: g.hy1, x2: g.x2, y2: g.y2, class: "spoke-hit" }),
      svg("circle", { cx: g.x2, cy: g.y2, r: 3, class: "spoke-dot" }),
      svg("text", { x: g.lx, y: g.ly, "text-anchor": g.anchor, class: "spoke-label" },
        splitLabel(item.name).map((line, li) => svg("tspan", { x: g.lx, dy: li ? "1.1em" : null }, [line]))),
      svg("text", { x: g.lx, y: g.ly, "text-anchor": g.anchor, class: "spoke-index" }, [String(i + 1)]),
    ]);
    const select = () => {
      groups.forEach((o) => { o.classList.remove("is-selected"); o.setAttribute("aria-pressed", "false"); });
      grp.classList.add("is-selected");
      grp.setAttribute("aria-pressed", "true");
      const ex = ctx.exercisesFor(item.lesson);
      const children = [
        el("h4", { class: "detail-name" }, [item.name]),
        el("p", {}, [item.core]),
        el("p", { class: "image" }, [el("span", { class: "eyebrow-inline" }, ["Image "]), item.image]),
        ex.length ? el("p", { class: "trains" }, [el("span", { class: "eyebrow-inline" }, ["Trains with "]), ...ex.flatMap((e, k) => [k ? " · " : "", el("strong", {}, [e.name]), ": ", e.text])]) : null,
      ].filter(Boolean);
      detail.replaceChildren(...children);
    };
    selectors.push(select);
    grp.addEventListener("click", () => {
      select();
      if (typeof detail.scrollIntoView === "function") detail.scrollIntoView({ block: "nearest" });
    });
    grp.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } });
    groups.push(grp);
    root.append(grp);
  });
  // On phones the rim shows only numbers, so the names are listed under the wheel,
  // numbered to match. (Hidden by CSS from 481px, where the rim carries the names.)
  const legend = el("ol", { class: "wheel-legend" }, section.items.map((item, i) =>
    el("li", {}, [el("button", { type: "button", class: "wheel-legend-b", onclick: () => {
      selectors[i]();
      if (typeof detail.scrollIntoView === "function") detail.scrollIntoView({ block: "nearest" });
    } }, [item.name])])));
  return el("section", { class: "sec sec-wheel", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("div", { class: "wheel-wrap" }, [el("div", { class: "wheel-fig" }, [root, legend]), detail]),
  ]);
}
