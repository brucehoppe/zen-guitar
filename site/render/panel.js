// site/render/panel.js
import { el, heading } from "./dom.js";
import { renderTable } from "./table.js";
import { renderList } from "./list.js";
import { renderRecall } from "./recall.js";
import { renderWheel } from "./wheel.js";
import { renderBalance } from "./balance.js";
import { renderTabs } from "./tabs.js";
import { renderMountains } from "./mountains.js";
import { renderCards } from "./cards.js";
import { renderMaxims } from "./maxims.js";
import { renderMatch } from "./match.js";
import { EMBLEMS } from "../emblems.js";
import { companions } from "../content/companions.js";

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
  maxims: renderMaxims,
  match: renderMatch,
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
  const sections = stage.sections.map((s) => {
    const section = (RENDERERS[s.type] ?? fallback)(s, ctx);
    const note = companions[`${stage.id}/${s.id}`];
    if (note) section.append(el("details", { class: "teaching companion" }, [
      el("summary", {}, [note[0]]),
      el("p", {}, [note[1]]),
      el("p", {}, [note[2]]),
      el("p", { class: "small muted" }, ["An original companion example, offered for your own exploration."]),
    ]));
    return section;
  });
  const emblem = stage.emblem && EMBLEMS[stage.emblem]
    ? el("span", { class: "emblem", lang: "ja", "aria-hidden": "true" }, [EMBLEMS[stage.emblem]])
    : null;
  return el("article", { class: "stage-panel", "data-stage": stage.id }, [emblem, head, ...sections, renderRecall(stage)]);
}
