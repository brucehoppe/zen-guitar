// site/render/match.js
import { el, heading } from "./dom.js";

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function renderMatch(section, ctx) {
  const shuffle = ctx.shuffle ?? fisherYates;
  const total = section.items.length;
  let matched = 0, picked = null;
  const status = el("p", { class: "match-status", role: "status" }, [`0 of ${total} matched`]);
  const imgButtons = section.items.map((it) => el("button", { type: "button", class: "match-img", "data-lesson": it.lesson, "aria-pressed": "false" }, [it.image]));
  const lessonButtons = shuffle(section.items).map((it) => el("button", { type: "button", class: "match-lesson", "data-lesson": it.lesson, "aria-pressed": "false" }, [ctx.lessons[it.lesson]?.label ?? it.lesson]));

  imgButtons.forEach((b) => b.addEventListener("click", () => {
    imgButtons.forEach((o) => { o.classList.remove("is-selected"); if (!o.classList.contains("is-matched")) o.setAttribute("aria-pressed", "false"); });
    picked = b; b.classList.add("is-selected"); b.setAttribute("aria-pressed", "true");
  }));
  lessonButtons.forEach((b) => b.addEventListener("click", () => {
    if (!picked) { status.textContent = "Choose an image first."; return; }
    if (b.getAttribute("data-lesson") === picked.getAttribute("data-lesson")) {
      for (const x of [picked, b]) { x.classList.add("is-matched"); x.classList.remove("is-selected"); x.setAttribute("disabled", ""); x.setAttribute("aria-pressed", "true"); }
      matched++;
      status.textContent = matched === total ? `All ${total}. Now go play.` : `${matched} of ${total} matched`;
    } else {
      b.classList.add("is-wrong");
      setTimeout(() => b.classList.remove("is-wrong"), 400);
      picked.classList.remove("is-selected");
      picked.setAttribute("aria-pressed", "false");
      status.textContent = "Not that one. Return to centre and try again.";
    }
    picked = null;
  }));

  return el("section", { class: "sec sec-match", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted small" }, ["Click an image, then the lesson it belongs to. Nothing is scored, and a reload empties the cup."]),
    el("div", { class: "match" }, [el("div", { class: "match-col" }, imgButtons), el("div", { class: "match-col" }, lessonButtons)]),
    status,
  ]);
}
