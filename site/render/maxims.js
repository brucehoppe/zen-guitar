// site/render/maxims.js
import { el, heading } from "./dom.js";

export function renderMaxims(section, ctx) {
  const hint = el("p", { class: "hint" }, ["Point at or focus a line to see its stage; open it to go there."]);
  const trace = el("p", { class: "trace", "aria-live": "polite" });
  const items = ctx.maxims.map((m) => {
    const lesson = m.lesson ? ctx.lessons[m.lesson] : null;
    if (!lesson) return el("li", { class: "maxim" }, [m.text]);
    const a = el("a", { href: `#/${lesson.stage}/${lesson.section}` }, [m.text]);
    const on = () => { ctx.highlightStage(lesson.stage); trace.textContent = `Stage ${lesson.stage}: ${lesson.label}`; };
    const off = () => { ctx.highlightStage(null); trace.textContent = `Last traced: Stage ${lesson.stage}: ${lesson.label}`; };
    a.addEventListener("mouseenter", on); a.addEventListener("focus", on);
    a.addEventListener("mouseleave", off); a.addEventListener("blur", off);
    return el("li", { class: "maxim", "data-lesson": m.lesson }, [a]);
  });
  return el("section", { class: "sec sec-maxims", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    hint,
    el("ul", { class: "maxims" }, items),
    trace,
  ]);
}
