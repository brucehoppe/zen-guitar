// site/render/cards.js
import { el, heading } from "./dom.js";

export function renderCards(section) {
  const cards = section.items.map((it) => {
    const b = el("button", { type: "button", class: "card", "aria-pressed": "false", "data-lesson": it.lesson ?? null }, [
      el("span", { class: "card-front" }, [it.front]),
      el("span", { class: "card-back" }, [it.back]),
    ]);
    b.addEventListener("click", () => {
      const on = b.classList.toggle("is-flipped");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    return b;
  });
  return el("section", { class: "sec sec-cards", "aria-labelledby": `sec-${section.id}` }, [
    heading(section), el("p", { class: "muted small" }, ["Turn a card. Each pair is two that are one."]), el("div", { class: "cards" }, cards)]);
}
