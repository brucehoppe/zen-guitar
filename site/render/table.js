import { el, heading } from "./dom.js";
export function renderTable(section, ctx, opts = {}) {
  const thead = el("thead", {}, [el("tr", {}, section.columns.map((c) => el("th", { scope: "col" }, [c])))]);
  const tbody = el("tbody", {}, section.rows.map((r) =>
    el("tr", { "data-lesson": r.lesson ?? null }, r.cells.map((c, i) => el(i === 0 ? "th" : "td", i === 0 ? { scope: "row" } : {}, [c])))));
  const table = el("table", { class: "tbl" }, [thead, tbody]);
  if (opts.noHeading) return table; // inside a tab panel: no section wrapper, so no section margins
  return el("section", { class: "sec sec-table", "aria-labelledby": `sec-${section.id}` }, [heading(section), table]);
}
