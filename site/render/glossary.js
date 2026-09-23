// site/render/glossary.js
import { el, kanji } from "./dom.js";

export function renderGlossary(ctx) {
  const rows = ctx.glossary.map((g) => el("tr", { "data-term": g.term.toLowerCase() }, [
    el("th", { scope: "row" }, [g.term, kanji(g.kanji)]), el("td", {}, [g.literal]), el("td", {}, [g.usage])]));
  const input = el("input", { type: "search", id: "glossary-filter", class: "filter", placeholder: "Filter terms", "aria-label": "Filter glossary" });
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    rows.forEach((r) => { r.hidden = q !== "" && !r.textContent.toLowerCase().includes(q); });
  });
  return el("article", { class: "view-inner" }, [
    el("h2", { class: "stage-title" }, ["Glossary"]),
    el("p", { class: "stage-sub" }, ["The Japanese and Chinese terms the book leans on."]),
    el("label", { class: "filter-label", for: "glossary-filter" }, ["Filter"]),
    input,
    el("table", { class: "tbl" }, [
      el("thead", {}, [el("tr", {}, ["Term", "Literal meaning", "How the book uses it"].map((h) => el("th", { scope: "col" }, [h])))]),
      el("tbody", {}, rows)]),
  ]);
}
