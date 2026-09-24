const VIEWS = new Set(["glossary", "practice"]);
const STAGES = 5;

// Hashes: #/ (landing), #/3 (stage), #/3/hhh (section), #/3/hhh/heart (a tab inside
// a tabbed section), #/glossary, #/practice. "?again" marks a second walk of the ring.
export function parseHash(hash) {
  const raw = String(hash || "").replace(/^#\/?/, "");
  const [pathPart, query = ""] = raw.split("?");
  const again = query.split("&").includes("again");
  const parts = pathPart.split("/").filter(Boolean);
  if (VIEWS.has(parts[0])) return { view: parts[0], stage: 1, section: null, tab: null, again: false };
  const n = Number.parseInt(parts[0], 10);
  const stage = Number.isInteger(n) && n >= 1 && n <= STAGES ? n : 1;
  const section = parts.length >= 2 && parts[1] ? parts[1] : null;
  const tab = section && parts.length === 3 && parts[2] ? parts[2] : null;
  return { view: "stage", stage, section, tab, again, landing: parts.length === 0 };
}

export function buildHash(route) {
  if (route.view !== "stage") return `#/${route.view}`;
  if (route.landing) return route.again ? "#/?again" : "#/";
  let h = `#/${route.stage}`;
  if (route.section) h += `/${route.section}`;
  if (route.section && route.tab) h += `/${route.tab}`;
  if (route.again) h += "?again";
  return h;
}

export function normalize(route, stages) {
  if (route.view !== "stage") return { ...route, stage: 1, section: null, tab: null, again: false };
  const stage = stages.find((s) => s.id === route.stage) ? route.stage : 1;
  const def = stages.find((s) => s.id === stage);
  const secDef = def ? def.sections.find((s) => s.id === route.section) : null;
  const section = secDef ? secDef.id : null;
  // a tab is kept only when the section is tabbed and the tab exists in it
  const tab = secDef && secDef.tabs && secDef.tabs.some((t) => t.id === route.tab) ? route.tab : null;
  if (route.landing) return { view: "stage", stage: 1, section: null, tab: null, again: Boolean(route.again), landing: true };
  return { view: "stage", stage, section, tab, again: Boolean(route.again), landing: false };
}

// The hash to rewrite the address bar to, or null when it is already canonical.
// "", "#" and "#/" are all the landing and are left as typed.
export function canonicalHash(hash, stages) {
  const h = String(hash || "");
  if (h === "" || h === "#" || h === "#/") return null;
  const canonical = buildHash(normalize(parseHash(h), stages));
  return canonical === h ? null : canonical;
}

export function nextStage(n) {
  return n >= STAGES ? { stage: 1, again: true } : { stage: n + 1, again: false };
}

export function prevStage(n) {
  return n <= 1 ? { stage: STAGES, again: false } : { stage: n - 1, again: false };
}

// Where the "Zen Guitar" home link points. On the landing and on stages it is the
// landing (keeping ?again, so a second walk stays a second walk); from Glossary or
// Practice it returns to the stage last visited (held in memory only, for this
// visit), or the landing if no stage was visited yet.
export function homeHref(view, lastStageRoute, again = false) {
  if (view !== "stage") return lastStageRoute ?? "#/";
  return again ? "#/?again" : "#/";
}

// The hash that opens a lesson: its stage and section, the tab that holds it when
// the section is tabbed, and ?again when the visitor is on a second walk.
export function lessonHref(lesson, again = false) {
  let h = `#/${lesson.stage}/${lesson.section}`;
  if (lesson.tab) h += `/${lesson.tab}`;
  if (again) h += "?again";
  return h;
}
