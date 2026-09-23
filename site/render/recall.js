import { el } from "./dom.js";
export function renderRecall(stage) {
  const recall = stage.recall.length === 0 ? null : el("section", { class: "sec sec-recall", "aria-labelledby": "sec-recall" }, [
    el("h3", { class: "sec-h", id: "sec-recall" }, ["Recall"]),
    ...stage.recall.map((r) => el("details", { class: "recall" }, [el("summary", {}, [r.q]), el("p", {}, [r.a])])),
  ]);
  const reflect = el("section", { class: "sec sec-reflect", "aria-labelledby": "sec-reflection" }, [
    el("h3", { class: "sec-h", id: "sec-reflection" }, ["Reflection"]),
    el("p", { class: "muted" }, ["No answers here. Pour in your own hot water."]),
    el("ul", { class: "plain" }, stage.reflection.map((t) => el("li", {}, [t]))),
  ]);
  return el("div", { class: "recall-wrap" }, [recall, reflect]);
}
