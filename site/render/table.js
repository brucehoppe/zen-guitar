import { el, heading } from "./dom.js";
export function renderTable(section) {
  const thead = el("thead", {}, [el("tr", {}, section.columns.map((c) => el("th", { scope: "col" }, [c])))]);
  const tbody = el("tbody", {}, section.rows.map((r) =>
    el("tr", { "data-lesson": r.lesson ?? null }, r.cells.map((c) => el("td", {}, [c])))));
  return el("section", { class: "sec sec-table", "aria-labelledby": `sec-${section.id}` }, [heading(section), el("table", { class: "tbl" }, [thead, tbody])]);
}
