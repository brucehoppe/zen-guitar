// site/render/glossary.js
import { el, kanji, backLink } from "./dom.js";

export function renderGlossary(ctx) {
  const rows = ctx.glossary.map((g) => el("tr", { "data-term": g.term.toLowerCase() }, [
    el("th", { scope: "row" }, [g.term, kanji(g.kanji)]), el("td", {}, [g.literal]), el("td", {}, [g.usage])]));
  const searchText = ctx.glossary.map((g) => [g.term, g.kanji, g.literal, g.usage].filter(Boolean).join(" ").toLowerCase());
  const input = el("input", { type: "search", id: "glossary-filter", class: "filter" });
  const status = el("p", { class: "muted small", role: "status" }, [`${rows.length} terms`]);
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    rows.forEach((r, i) => {
      const show = q === "" || searchText[i].includes(q);
      r.hidden = !show;
      if (show) visible++;
    });
    status.textContent = visible === 0 ? "No terms match" : `${visible} term${visible === 1 ? "" : "s"}`;
  });
  return el("article", { class: "view-inner" }, [
    backLink(ctx.lastStage),
    el("h2", { class: "stage-title", tabindex: "-1" }, ["Glossary"]),
    el("p", { class: "stage-sub" }, ["The Japanese and Chinese terms the book leans on."]),
    el("label", { class: "filter-label", for: "glossary-filter" }, ["Filter terms"]),
    input,
    status,
    el("table", { class: "tbl" }, [
      el("thead", {}, [el("tr", {}, ["Term", "Literal meaning", "How the book uses it"].map((h) => el("th", { scope: "col" }, [h])))]),
      el("tbody", {}, rows)]),
  ]);
}
