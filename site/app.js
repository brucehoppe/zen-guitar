// site/app.js
import { stages, lessons, exercises, maxims, glossary } from "./content/index.js";
import { parseHash, buildHash, normalize, nextStage, prevStage, canonicalHash } from "./router.js";
import { buildRing } from "./belt.js";
import { renderStage } from "./render/panel.js";
import { renderGlossary } from "./render/glossary.js";
import { renderPractice } from "./render/practice.js";
import { el } from "./render/dom.js";

const $ = (id) => document.getElementById(id);
const ringEl = $("ring"), panelEl = $("panel"), viewEl = $("view"), koanEl = $("koan"), announceEl = $("announce"), stageEl = document.querySelector(".stage");
const navLinks = [...document.querySelectorAll(".top-nav a")];
const KOAN_MS = 1200;
// From 820px the ring shows the koan itself, so the HTML koan only speaks to screen readers.
const wide = window.matchMedia("(min-width: 820px)");
const syncKoan = () => koanEl.classList.toggle("visually-hidden", wide.matches);
wide.addEventListener("change", syncKoan);
syncKoan();

// location.hash updates as soon as it is set, before hashchange fires, so read it for the live route
const current = () => normalize(parseHash(location.hash), stages);
let route = current();
let lastStage = null;   // stage id shown last, or null on the landing
let lastPlace = null;   // "landing", a stage id, or a view name; null before the first render
let keepFocus = false;  // true while a marker picked the stage, so focus stays on it
let koanTimer = null;

const ring = buildRing(ringEl, {
  stages,
  onSelect: (n) => { keepFocus = true; go({ view: "stage", stage: n, section: null, again: current().again }); },
});

const ctx = {
  lessons,
  highlightStage: (n) => ring.highlight(n),
  exercisesFor: (lessonId) => exercises.filter((e) => e.lessons.includes(lessonId)),
  maxims,
  glossary,
  exercises,
};

const VIEWS = { glossary: renderGlossary, practice: renderPractice };

function go(next) {
  const target = buildHash(normalize(next, stages));
  if (target === buildHash(current())) { keepFocus = false; return; } // nothing changed: no re-render
  location.hash = target;
}

function renderLanding() {
  const again = route.again;
  return el("article", { class: "stage-panel landing" }, [
    el("h1", { class: "stage-title", tabindex: "-1" }, ["Zen Guitar"]),
    el("p", { class: "stage-sub" }, ["A visual tour of the book by Philip Toshio Sudo"]),
    el("p", { class: "intro" }, [again
      ? "You have walked the ring once. The belt is a little softer; that is all that changes. Empty your cup and begin again."
      : "Everyone in this dojo starts at white belt. Empty your cup each visit."]),
    el("p", { class: "hint" }, [el("button", { class: "begin", onclick: () => go({ view: "stage", stage: 1, section: null, again }) }, [again ? "Begin again" : "Begin"]), " or press → to move around the belt."]),
    el("figure", { class: "hero-fig" }, [
      el("img", { class: "hero", src: "./assets/hero.jpg", alt: "Rats of Chaos of Gridlock. A quiet porch with a guitar, a cushion and a cup of tea facing pine, mountains and a red sun; the CN Tower, a highway of traffic and amplifiers on the other side.", width: "640", height: "426", decoding: "async" }),
      el("figcaption", {}, ["Poster: Rats of Chaos of Gridlock. Practice, listen, tune, play, repeat."]),
    ]),
  ]);
}

function clearKoan() {
  clearTimeout(koanTimer);
  koanEl.textContent = "";
}

function render() {
  route = current();
  // unknown stages, sections or views: fix the address bar in place (no new history entry, no hashchange)
  const canonical = canonicalHash(location.hash, stages);
  if (canonical) history.replaceState(null, "", canonical);
  navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#/${route.view}` ? "page" : "false"));

  if (route.view !== "stage") {
    stageEl.hidden = true; viewEl.hidden = false;
    viewEl.replaceChildren((VIEWS[route.view] ?? (() => el("p", {}, ["Coming soon."])))(ctx));
    window.scrollTo(0, 0);
    viewEl.querySelector("h2")?.focus({ preventScroll: true });
    lastPlace = route.view; lastStage = null; keepFocus = false;
    return;
  }
  stageEl.hidden = false; viewEl.hidden = true;
  const atLanding = route.landing;
  const stage = stages.find((s) => s.id === route.stage);
  const place = atLanding ? "landing" : stage.id;
  const moved = lastPlace !== null && lastPlace !== place;

  stageEl.classList.toggle("in-stage", !atLanding);
  ring.setWorn(route.again);
  ring.setStage(route.stage);
  panelEl.replaceChildren(atLanding ? renderLanding() : renderStage(stage, ctx));

  if (moved) announceEl.textContent = atLanding ? "Zen Guitar" : stage.title;
  if (atLanding) clearKoan();
  else if (lastStage !== null && lastStage !== stage.id && ring.showKoan(stage.koan, KOAN_MS)) {
    clearKoan();
    koanEl.textContent = stage.koan;
    koanTimer = setTimeout(() => { koanEl.textContent = ""; }, KOAN_MS);
  }
  lastStage = atLanding ? null : stage.id;
  lastPlace = place;

  if (route.section) document.getElementById(`sec-${route.section}`)?.scrollIntoView({ block: "start" });
  else if (moved) {
    window.scrollTo(0, 0);
    if (!keepFocus) panelEl.querySelector(atLanding ? "h1" : "h2")?.focus({ preventScroll: true });
  }
  keepFocus = false;
}

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (e) => {
  const route = current();
  if (route.view !== "stage" || e.altKey || e.metaKey || e.ctrlKey || e.defaultPrevented) return;
  if (e.target.closest?.("input, textarea")) return;
  if (e.key === "ArrowRight") {
    if (route.landing) { go({ view: "stage", stage: 1, section: null, again: route.again }); return; }
    const n = nextStage(route.stage);
    if (n.again) go({ view: "stage", stage: 1, section: null, again: true, landing: true });
    else go({ view: "stage", stage: n.stage, section: null, again: route.again });
  }
  if (e.key === "ArrowLeft") { const n = prevStage(route.stage); go({ view: "stage", stage: n.stage, section: null, again: route.again }); }
});
render();
