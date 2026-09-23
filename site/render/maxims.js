// site/render/maxims.js
import { el, heading } from "./dom.js";

function traceLink(lesson) {
  return el("a", { href: `#/${lesson.stage}/${lesson.section}` }, [`Stage ${lesson.stage}: ${lesson.label}`]);
}

export function renderMaxims(section, ctx) {
  const hint = el("p", { class: "hint" }, ["Hover or focus a line to trace it back to its stage."]);
  const trace = el("p", { class: "trace", "aria-live": "polite" });
  const items = ctx.maxims.map((m) => {
    const lesson = m.lesson ? ctx.lessons[m.lesson] : null;
    const li = el("li", { class: "maxim", tabindex: lesson ? "0" : null, "data-lesson": m.lesson ?? null }, [m.text]);
    if (lesson) {
      const on = () => { ctx.highlightStage(lesson.stage); trace.replaceChildren(traceLink(lesson)); };
      const off = () => { ctx.highlightStage(null); trace.replaceChildren("Last traced: ", traceLink(lesson)); };
      li.addEventListener("mouseenter", on); li.addEventListener("focus", on);
      li.addEventListener("mouseleave", off); li.addEventListener("blur", off);
    }
    return li;
  });
  return el("section", { class: "sec sec-maxims", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    hint,
    el("ul", { class: "maxims" }, items),
    trace,
  ]);
}
