// site/render/match.js
import { el, heading } from "./dom.js";

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function scrollStatusIntoView(status) {
  if (typeof status.scrollIntoView === "function") status.scrollIntoView({ block: "nearest" });
}

export function renderMatch(section, ctx) {
  const shuffle = ctx.shuffle ?? fisherYates;
  const items = section.items;
  const total = items.length;
  let matched = 0, picked = null, pickedItem = null, wrongToggle = false;

  const status = el("p", { class: "match-status", role: "status", tabindex: "-1" }, [`0 of ${total} matched`]);
  const announce = (text) => { status.textContent = text; scrollStatusIntoView(status); };

  const imgButtons = items.map((it) => el("button", { type: "button", class: "match-img", "data-lesson": it.lesson, "aria-pressed": "false" }, [it.image]));
  const shuffled = shuffle(items);
  const lessonButtons = shuffled.map((it) => el("button", { type: "button", class: "match-lesson", "data-lesson": it.lesson }, [ctx.lessons[it.lesson]?.label ?? it.lesson]));

  const focusNextUnmatched = (fromIndex) => {
    if (matched === total) { status.focus(); return; }
    for (let step = 1; step <= imgButtons.length; step++) {
      const i = (fromIndex + step) % imgButtons.length;
      if (!imgButtons[i].classList.contains("is-matched")) { imgButtons[i].focus(); return; }
    }
  };

  imgButtons.forEach((b, i) => b.addEventListener("click", () => {
    if (b.classList.contains("is-matched")) return;
    imgButtons.forEach((o) => { o.classList.remove("is-selected"); if (!o.classList.contains("is-matched")) o.setAttribute("aria-pressed", "false"); });
    picked = b; pickedItem = items[i];
    b.classList.add("is-selected"); b.setAttribute("aria-pressed", "true");
  }));

  lessonButtons.forEach((b, i) => {
    const it = shuffled[i];
    b.addEventListener("click", () => {
      if (!picked) { announce("Choose an image first."); return; }
      if (it.lesson === pickedItem.lesson) {
        const idx = imgButtons.indexOf(picked);
        const label = ctx.lessons[it.lesson]?.label ?? it.lesson;
        picked.textContent = `${pickedItem.image} → ${label}`;
        picked.classList.add("is-matched");
        picked.classList.remove("is-selected");
        picked.setAttribute("disabled", "");
        picked.setAttribute("aria-pressed", "true");
        b.remove();
        matched++;
        wrongToggle = false;
        announce(matched === total ? "All ten. Now go play." : `${matched} of ${total} matched`);
        picked = null; pickedItem = null;
        focusNextUnmatched(idx);
      } else {
        b.classList.add("is-wrong");
        setTimeout(() => b.classList.remove("is-wrong"), 400);
        picked.classList.remove("is-selected");
        picked.setAttribute("aria-pressed", "false");
        picked = null; pickedItem = null;
        announce(wrongToggle ? "Not that one either." : "Not that one.");
        wrongToggle = !wrongToggle;
      }
    });
  });

  const body = el("details", { class: "test-yourself" }, [
    el("summary", {}, ["Test yourself"]),
    el("p", { class: "muted small" }, ["Choose an image, then the lesson it belongs to. Nothing is saved; a reload empties the cup."]),
    el("div", { class: "match" }, [el("div", { class: "match-col" }, imgButtons), el("div", { class: "match-col" }, lessonButtons)]),
    status,
  ]);

  return el("section", { class: "sec sec-match", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    body,
  ]);
}
