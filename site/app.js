// site/app.js
import { stages, lessons, exercises } from "./content/index.js";
import { parseHash, buildHash, normalize, nextStage, prevStage } from "./router.js";
import { buildRing } from "./belt.js";
import { renderStage } from "./render/panel.js";
import { el } from "./render/dom.js";

const $ = (id) => document.getElementById(id);
const ringEl = $("ring"), panelEl = $("panel"), viewEl = $("view"), stageEl = document.querySelector(".stage");
const navLinks = [...document.querySelectorAll(".top-nav a")];

let route = normalize(parseHash(location.hash), stages);
let lastStage = null;

const ring = buildRing(ringEl, { stages, onSelect: (n) => go({ view: "stage", stage: n, section: null, again: route.again }) });

const ctx = {
  lessons,
  highlightStage: (n) => ring.highlight(n),
  exercisesFor: (lessonId) => exercises.filter((e) => e.lessons.includes(lessonId)),
};

const VIEWS = {}; // glossary and practice arrive in Task 11

function go(next) {
  const target = buildHash(normalize(next, stages));
  if (target === location.hash) render(); else location.hash = target;
}

function renderLanding() {
  const again = route.again;
  return el("article", { class: "stage-panel landing" }, [
    el("h1", { class: "stage-title" }, ["Zen Guitar"]),
    el("p", { class: "stage-sub" }, ["A visual tour of the book by Philip Toshio Sudo"]),
    el("p", { class: "intro" }, [again
      ? "You have walked the ring once. The belt is a little softer now; that is all that changes. Tie it on again and empty your cup."
      : "Everyone in this dojo starts at white belt. The belt is never awarded; it turns black through years of use, then wears back to white. Walk the ring. Nothing is saved between visits: empty your cup each visit."]),
    el("p", { class: "hint" }, [el("button", { class: "begin", onclick: () => go({ view: "stage", stage: 1, section: null, again }) }, [again ? "Begin again" : "Begin"]), " or press → to move around the belt."]),
  ]);
}

function render() {
  route = normalize(parseHash(location.hash), stages);
  navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#/${route.view}` ? "page" : "false"));

  if (route.view !== "stage") {
    stageEl.hidden = true; viewEl.hidden = false;
    viewEl.replaceChildren((VIEWS[route.view] ?? (() => el("p", {}, ["Coming soon."])))(ctx));
    return;
  }
  stageEl.hidden = false; viewEl.hidden = true;
  const stage = stages.find((s) => s.id === route.stage);
  ring.setWorn(route.again);
  ring.setStage(route.stage);
  const atLanding = location.hash === "" || location.hash === "#/" || location.hash === "#" ;
  panelEl.replaceChildren(atLanding ? renderLanding() : renderStage(stage, ctx));
  panelEl.setAttribute("data-emblem", atLanding ? "" : stage.emblem);
  if (!atLanding && lastStage !== null && lastStage !== stage.id) ring.showKoan(stage.koan);
  lastStage = atLanding ? null : stage.id;
  if (route.section) document.getElementById(`sec-${route.section}`)?.scrollIntoView({ block: "start" });
}

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (e) => {
  if (route.view !== "stage" || e.target.closest?.("input, textarea")) return;
  if (e.key === "ArrowRight") { const n = nextStage(route.stage); go({ view: "stage", stage: n.stage, section: null, again: route.again || n.again }); }
  if (e.key === "ArrowLeft") { const n = prevStage(route.stage); go({ view: "stage", stage: n.stage, section: null, again: route.again }); }
});
render();
