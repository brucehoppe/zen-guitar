// site/render/panel.js
import { el, svg, heading } from "./dom.js";
import { renderTable } from "./table.js";
import { renderList } from "./list.js";
import { renderRecall } from "./recall.js";
import { renderWheel } from "./wheel.js";
import { renderBalance } from "./balance.js";
import { renderTabs } from "./tabs.js";
import { renderMountains } from "./mountains.js";
import { renderCards } from "./cards.js";
import { EMBLEMS } from "../emblems.js";

export const RENDERERS = {
  table: renderTable,
  steps: renderList,
  terms: renderList,
  list: renderList,
  wheel: renderWheel,
  balance: renderBalance,
  tabs: renderTabs,
  mountains: renderMountains,
  cards: renderCards,
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
  const emblem = stage.emblem && EMBLEMS[stage.emblem]
    ? svg("svg", { viewBox: "0 0 200 200", class: "emblem", "aria-hidden": "true" }, [svg("path", { d: EMBLEMS[stage.emblem], class: "brush" })])
    : null;
  return el("article", { class: "stage-panel", "data-stage": stage.id }, [emblem, head, ...sections, renderRecall(stage)]);
}
