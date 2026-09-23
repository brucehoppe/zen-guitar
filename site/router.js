const VIEWS = new Set(["glossary", "practice"]);
const STAGES = 5;

export function parseHash(hash) {
  const raw = String(hash || "").replace(/^#\/?/, "");
  const [pathPart, query = ""] = raw.split("?");
  const again = query.split("&").includes("again");
  const parts = pathPart.split("/").filter(Boolean);
  if (VIEWS.has(parts[0])) return { view: parts[0], stage: 1, section: null, again: false };
  const n = Number.parseInt(parts[0], 10);
  const stage = Number.isInteger(n) && n >= 1 && n <= STAGES ? n : 1;
  const section = parts.length === 2 && parts[1] ? parts[1] : null;
  return { view: "stage", stage, section, again, landing: parts.length === 0 };
}

export function buildHash(route) {
  if (route.view !== "stage") return `#/${route.view}`;
  if (route.landing) return route.again ? "#/?again" : "#/";
  let h = `#/${route.stage}`;
  if (route.section) h += `/${route.section}`;
  if (route.again) h += "?again";
  return h;
}

export function normalize(route, stages) {
  if (route.view !== "stage") return { ...route, stage: 1, section: null, again: false };
  const stage = stages.find((s) => s.id === route.stage) ? route.stage : 1;
  const def = stages.find((s) => s.id === stage);
  const section = def && def.sections.some((s) => s.id === route.section) ? route.section : null;
  if (route.landing) return { view: "stage", stage: 1, section: null, again: Boolean(route.again), landing: true };
  return { view: "stage", stage, section, again: Boolean(route.again), landing: false };
}

export function nextStage(n) {
  return n >= STAGES ? { stage: 1, again: true } : { stage: n + 1, again: false };
}

export function prevStage(n) {
  return n <= 1 ? { stage: STAGES, again: false } : { stage: n - 1, again: false };
}
