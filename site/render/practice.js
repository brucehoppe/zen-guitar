// site/render/practice.js
import { el } from "./dom.js";

const BELTS = [["white", "White belt"], ["practice", "Practice stage"], ["black", "Black belt"], ["barrier", "Barrier"]];

export function renderPractice(ctx) {
  const groups = BELTS.map(([belt, label]) => {
    const items = ctx.exercises.filter((e) => e.belt === belt);
    if (!items.length) return null;
    return el("section", { class: "sec" }, [
      el("h3", { class: "sec-h" }, [label]),
      el("ul", { class: "practice" }, items.map((e) => el("li", {}, [
        el("strong", {}, [e.name]), ": ", e.text, " ",
        el("span", { class: "trains-tag" }, [e.lessons.map((l) => ctx.lessons[l]?.label ?? l).join(", ")]),
      ]))),
    ]);
  }).filter(Boolean);
  return el("article", { class: "view-inner" }, [
    el("h2", { class: "stage-title" }, ["Practice"]),
    el("p", { class: "stage-sub" }, ["The book gives almost no explicit exercises, but many of its images convert directly into practice. A rotating menu, not a checklist."]),
    ...groups,
  ]);
}
