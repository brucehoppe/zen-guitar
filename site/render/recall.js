import { el } from "./dom.js";
export function renderRecall(stage) {
  const recall = el("section", { class: "sec sec-recall" }, [
    el("h3", { class: "sec-h" }, ["Recall"]),
    ...stage.recall.map((r) => el("details", { class: "recall" }, [el("summary", {}, [r.q]), el("p", {}, [r.a])])),
  ]);
  const reflect = el("section", { class: "sec sec-reflect" }, [
    el("h3", { class: "sec-h" }, ["Reflection"]),
    el("p", { class: "muted" }, ["No answers here. Pour in your own hot water."]),
    el("ul", { class: "plain" }, stage.reflection.map((t) => el("li", {}, [t]))),
  ]);
  return el("div", { class: "recall-wrap" }, [recall, reflect]);
}
