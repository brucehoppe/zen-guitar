// site/render/maxims.js
import { el, heading } from "./dom.js";

export function renderMaxims(section, ctx) {
  const trace = el("p", { class: "trace", "aria-live": "polite" }, ["Hover or focus a line to trace it back to its stage."]);
  const items = ctx.maxims.map((m) => {
    const lesson = m.lesson ? ctx.lessons[m.lesson] : null;
    const li = el("li", { class: "maxim", tabindex: lesson ? "0" : null, "data-lesson": m.lesson ?? null }, [m.text]);
    if (lesson) {
      const on = () => { ctx.highlightStage(lesson.stage); trace.textContent = `Stage ${lesson.stage}: ${lesson.label}`; };
      const off = () => { ctx.highlightStage(null); };
      li.addEventListener("mouseenter", on); li.addEventListener("focus", on);
      li.addEventListener("mouseleave", off); li.addEventListener("blur", off);
    }
    return li;
  });
  return el("section", { class: "sec sec-maxims", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted small" }, ["The last chapter is a list of one-line maxims with no commentary. Each line is meant to be recognised, not learned."]),
    el("ul", { class: "maxims" }, items),
    trace,
  ]);
}
