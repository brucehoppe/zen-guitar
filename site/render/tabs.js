// site/render/tabs.js
import { el, heading } from "./dom.js";
import { renderTable } from "./table.js";

export function renderTabs(section, ctx) {
  const tabs = [], panels = [];
  const select = (i) => {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.setAttribute("tabindex", k === i ? "0" : "-1"); });
    panels.forEach((p, k) => { p.hidden = k !== i; });
  };
  section.tabs.forEach((t, i) => {
    const tab = el("button", { type: "button", role: "tab", id: `tab-${t.id}`, "aria-controls": `panel-${t.id}`, "aria-selected": "false", tabindex: "-1" }, [t.label]);
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (e) => {
      const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : null;
      if (n !== null) { e.preventDefault(); select(n); tabs[n].focus(); }
    });
    const panel = el("div", { role: "tabpanel", id: `panel-${t.id}`, "aria-labelledby": `tab-${t.id}` }, [
      el("p", { class: "muted small" }, [t.intro]),
      renderTable(t.section, ctx),
    ]);
    tabs.push(tab); panels.push(panel);
  });
  select(0);
  return el("section", { class: "sec sec-tabs", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("div", { role: "tablist", class: "tablist", "aria-label": section.heading }, tabs),
    ...panels,
  ]);
}
