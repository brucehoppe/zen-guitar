import { el, heading } from "./dom.js";
export function renderCards(section) {
  return el("section", { class: "sec sec-cards", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted" }, ["Each pair is two that are one. Open a teaching and stay with it as long as you like."]),
    ...section.items.map((item) => el("details", { class: "teaching", "data-lesson": item.lesson }, [
      el("summary", {}, [item.front]), el("p", {}, [item.back]),
    ])),
  ]);
}
