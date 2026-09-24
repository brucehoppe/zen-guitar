// site/app.js
import { stages, lessons, exercises, maxims, glossary } from "./content/index.js";
import { parseHash, buildHash, normalize, nextStage, prevStage, canonicalHash, homeHref } from "./router.js";
import { buildRing } from "./belt.js";
import { createKoan } from "./koan.js";
import { renderStage } from "./render/panel.js";
import { renderGlossary } from "./render/glossary.js";
import { renderPractice } from "./render/practice.js";
import { el } from "./render/dom.js";

const $ = (id) => document.getElementById(id);
const ringEl = $("ring"), panelEl = $("panel"), viewEl = $("view"), koanEl = $("koan"), announceEl = $("announce"), stageEl = document.querySelector(".stage");
const navLinks = [...document.querySelectorAll(".top-nav a")];
const homeLink = document.querySelector(".top-home");

// location.hash updates as soon as it is set, before hashchange fires, so read it for the live route
const current = () => normalize(parseHash(location.hash), stages);
let route = current();
let lastStage = null;   // stage id shown last, or null on the landing
let lastPlace = null;   // "landing", a stage id, or a view name; null before the first render
let keepFocus = false;  // true while a marker picked the stage, so focus stays on it
let lastStageRoute = null; // hash of the stage last shown this visit (memory only, never stored)

const ring = buildRing(ringEl, {
  stages,
  onSelect: (n) => { keepFocus = true; go({ view: "stage", stage: n, section: null, tab: null, again: current().again }); },
});

const koan = createKoan(koanEl);

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
    el("p", { class: "hint" }, [el("button", { class: "begin", onclick: () => go({ view: "stage", stage: 1, section: null, tab: null, again }) }, [again ? "Begin again" : "Begin"]), el("span", { class: "needs-keys" }, [", or use the arrow keys."])]),
    el("figure", { class: "hero-fig" }, [
      el("img", { class: "hero", src: "./assets/hero.jpg", alt: "Rats of Chaos of Gridlock. A quiet porch with a guitar, a cushion and a cup of tea facing pine, mountains and a red sun; the CN Tower, a highway of traffic and amplifiers on the other side.", width: "640", height: "426", decoding: "async" }),
      el("figcaption", {}, ["Poster: Rats of Chaos of Gridlock. Practice, listen, tune, play, repeat."]),
    ]),
  ]);
}

function render() {
  route = current();
  // unknown stages, sections or views: fix the address bar in place (no new history entry, no hashchange)
  const canonical = canonicalHash(location.hash, stages);
  if (canonical) history.replaceState(null, "", canonical);
  navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#/${route.view}` ? "page" : "false"));
  if (route.view === "stage" && !route.landing) lastStageRoute = buildHash(route);
  // On a view, "again" rides on the stage route we came from, so links back keep the worn belt.
  ctx.again = route.view === "stage" ? route.again : Boolean(lastStageRoute && parseHash(lastStageRoute).again);
  homeLink.setAttribute("href", homeHref(route.view, lastStageRoute, ctx.again));
  const lastStageDef = lastStageRoute ? stages.find((s) => s.id === parseHash(lastStageRoute).stage) : null;
  ctx.lastStage = lastStageDef ? { title: lastStageDef.title, href: lastStageRoute } : null;

  if (route.view !== "stage") {
    stageEl.hidden = true; viewEl.hidden = false;
    viewEl.replaceChildren((VIEWS[route.view] ?? (() => el("p", {}, ["Coming soon."])))(ctx));
    window.scrollTo(0, 0);
    viewEl.querySelector("h2")?.focus({ preventScroll: true });
    koan.clear();
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
  ring.highlight(null); // a maxim's trace highlight must not outlive the panel that set it
  ring.setStage(route.stage);
  panelEl.replaceChildren(atLanding ? renderLanding() : renderStage(stage, ctx));

  // Every arrival at a stage, including the first one, gets its koan; moving between
  // sections of the same stage does not. The koan is read once, with the title, through
  // #announce (the only live region), so screen readers hear one sentence, not two.
  const newKoan = !atLanding && lastStage !== stage.id;
  if (moved) announceEl.textContent = atLanding ? "Zen Guitar" : newKoan ? `${stage.title}. ${stage.koan}` : stage.title;
  if (atLanding) koan.clear();
  else if (newKoan) koan.show(stage.koan);
  lastStage = atLanding ? null : stage.id;
  lastPlace = place;

  if (route.section) {
    // A lesson link lands on its section: open its tab if it names one, scroll there and put focus on the heading.
    if (route.tab) document.getElementById(`tab-${route.tab}`)?.click();
    const h = document.getElementById(`sec-${route.section}`);
    if (h) { h.setAttribute("tabindex", "-1"); h.scrollIntoView({ block: "start" }); h.focus({ preventScroll: true }); }
  }
  else if (moved) {
    window.scrollTo(0, 0);
    if (!keepFocus) panelEl.querySelector(atLanding ? "h1" : "h2")?.focus({ preventScroll: true });
  }
  keepFocus = false;
}

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (e) => {
  const route = current();
  // Shift+Arrow extends a text selection and a held key auto-repeats; neither should walk the ring.
  if (route.view !== "stage" || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat || e.defaultPrevented) return;
  if (e.target.closest?.("input, textarea")) return;
  if (e.key === "ArrowRight") {
    if (route.landing) { go({ view: "stage", stage: 1, section: null, tab: null, again: route.again }); return; }
    const n = nextStage(route.stage);
    if (n.again) go({ view: "stage", stage: 1, section: null, tab: null, again: true, landing: true });
    else go({ view: "stage", stage: n.stage, section: null, tab: null, again: route.again });
  }
  if (e.key === "ArrowLeft") { const n = prevStage(route.stage); go({ view: "stage", stage: n.stage, section: null, tab: null, again: route.again }); }
});
render();
