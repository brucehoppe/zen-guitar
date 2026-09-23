// site/render/cards.js
import { el, heading } from "./dom.js";

export function renderCards(section) {
  const cards = section.items.map((it) => {
    const front = el("span", { class: "card-front", "aria-hidden": "false" }, [
      it.front,
      el("span", { class: "card-turn", "aria-hidden": "true" }, ["↻"]),
    ]);
    const back = el("span", { class: "card-back", "aria-hidden": "true" }, [it.back]);
    const b = el("button", { type: "button", class: "card", "aria-pressed": "false", "data-lesson": it.lesson ?? null }, [front, back]);
    b.addEventListener("click", () => {
      const on = b.classList.toggle("is-flipped");
      b.setAttribute("aria-pressed", on ? "true" : "false");
      front.setAttribute("aria-hidden", on ? "true" : "false");
      back.setAttribute("aria-hidden", on ? "false" : "true");
    });
    return b;
  });
  return el("section", { class: "sec sec-cards", "aria-labelledby": `sec-${section.id}` }, [
    heading(section), el("p", { class: "muted small" }, ["Turn a card. Each pair is two that are one."]), el("div", { class: "cards" }, cards)]);
}
