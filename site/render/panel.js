// site/render/panel.js
import { el, heading } from "./dom.js";
import { renderTable } from "./table.js";
import { renderList } from "./list.js";
import { renderRecall } from "./recall.js";
import { renderWheel } from "./wheel.js";

export const RENDERERS = {
  table: renderTable,
  steps: renderList,
  terms: renderList,
  list: renderList,
  wheel: renderWheel,
};

function fallback(section) {
  return el("section", { class: "sec sec-fallback" }, [heading(section), el("p", { class: "muted" }, ["This section is on its way."])]);
}

export function renderStage(stage, ctx) {
  const head = el("header", { class: "stage-head" }, [
    el("h2", { class: "stage-title", tabindex: "-1" }, [stage.title]),
    el("p", { class: "stage-sub" }, [stage.subtitle]),
    el("p", { class: "intro" }, [stage.intro]),
  ]);
  const sections = stage.sections.map((s) => (RENDERERS[s.type] ?? fallback)(s, ctx));
  return el("article", { class: "stage-panel", "data-stage": stage.id }, [head, ...sections, renderRecall(stage)]);
}
