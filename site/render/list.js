import { el, heading, kanji } from "./dom.js";
export function renderList(section) {
  let list;
  if (section.type === "steps") {
    list = el("ol", { class: "steps" }, section.items.map((it) =>
      el("li", { "data-lesson": it.lesson ?? null }, [el("strong", {}, [it.title]), " ", it.text])));
  } else if (section.type === "terms") {
    list = el("dl", { class: "terms" }, section.items.flatMap((it) => [
      el("dt", {}, [it.term, kanji(it.kanji)]), el("dd", {}, [it.text])]));
  } else {
    list = el("ul", { class: "plain" }, section.items.map((it) =>
      el("li", {}, it.title ? [el("strong", {}, [it.title]), " ", it.text] : [it.text])));
  }
  return el("section", { class: "sec sec-list", "aria-labelledby": `sec-${section.id}` }, [heading(section), list]);
}
