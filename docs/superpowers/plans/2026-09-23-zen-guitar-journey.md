# Zen Guitar Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static GitHub Pages site that walks a visitor around the five belt stages of *Zen Guitar* by Philip Toshio Sudo, with a rotating belt ring, per-stage diagrams, a glossary and a practice menu, keeping no state between visits.

**Architecture:** Plain ES modules with no build step. Pure-function modules (`router.js`, `ring.js`, `wheel-geometry.js`) are unit tested under Node's built-in runner. Renderers are `(section, ctx) => HTMLElement` functions that build DOM with `createElement`; `app.js` wires the hash router, the ring SVG and the renderers together. All book text lives in `site/content/`, one file per stage.

**Tech Stack:** HTML, CSS, SVG, ES2022 modules, `node:test` (Node 20+), GitHub Actions for Pages. No dependencies.

**Spec:** `docs/superpowers/specs/2026-09-23-zen-guitar-journey-design.md` (read it first, including the addendum).

## Global Constraints

- No build step, no npm dependencies, no network calls after page load. Fonts are self-hosted woff2 with OFL text beside them.
- Every asset reference in `site/` is relative (`./app.css`, not `/app.css`) so the site works at `https://brucehoppe.github.io/zen-guitar/` and from `file://`.
- Palette tokens on `:root`: paper `#f6f1e7`, ink `#1b1a17`, accent `#c0392b`. Dark mode swaps paper and ink under `prefers-color-scheme: dark`.
- One shared transition: `--ease: 400ms cubic-bezier(.4,0,.2,1)`. Under `prefers-reduced-motion: reduce` all transitions are `0ms` and koan interludes are skipped.
- Renderers never use `innerHTML` with content strings. Text goes in through `textContent`. The only `innerHTML` allowed is for the static SVG emblem and mountain path strings in `emblems.js`, which contain no visitor-controlled text.
- Every interactive SVG element is a `<button>` in HTML or an SVG `<g role="button" tabindex="0" aria-label="…">` that also handles `Enter` and `Space`.
- Layout: ring left and panel right from 820 px; below that the ring becomes a badge above the panel. 16 px side gutters; no horizontal scroll at 375 px.
- The author is credited as Philip Toshio Sudo on the landing page and in the page `<title>`'s meta description.
- Quiet solitude (spec addendum 2): one stage on screen at a time, no counters or badges outside the match game's own status line, panel measure capped at `max-width: 65ch`, no looping or pulsing motion, hints one line long, no exclamation marks in copy.
- Commit after every task with the `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` trailer.

## Review Focus

1. **A hash the site never wrote** (`#/9`, `#/2/nothing`, `#/abc`, `#`): must land on stage 1 and rewrite the hash, never a blank panel. Pinned in Task 2.
2. **Keyboard-only navigation**: arrow keys move stages, Tab reaches every marker, spoke, pan, card and maxim, and Enter/Space activates them. Pinned in Tasks 7, 8, 9, 10, 11 by the browser checklist in Task 14 plus the `role`/`tabindex` assertions in the renderer smoke tests.
3. **Reduced motion**: with the OS setting on, stage changes must be instant and no koan line may block the panel. Pinned in Task 13.
4. **Narrow viewport (375 px)**: no horizontal scroll, ring badge visible, spoke labels legible or replaced by numbers. Pinned in Task 14.
5. **Content integrity**: every `lesson` id used by an exercise, maxim, wheel item, balance item or image-match answer must exist in `lessons`; counts must match the book (12, 12, 6, 3, 10, 5 responsibilities). Pinned in Task 5's integrity test, which is the thing that stops a typo from silently breaking trace-back.

---

## File structure

```
zen-guitar/
  package.json                     {"type":"module","scripts":{"test":"node --test tests/"}}
  site/
    index.html                     shell: top bar, ring slot, panel slot, koan slot
    app.css                        tokens, layout, components, dark mode, reduced motion
    app.js                         boot: router + ring + panel + views + keyboard
    router.js                      parseHash, buildHash, normalize        (pure)
    ring.js                        markerPositions, rotationFor, wornStops (pure)
    belt.js                        buildRing(svgEl, opts) -> { setStage, setWorn, highlight, showKoan }
    emblems.js                     SVG path strings: 5 stage emblems, 3 mountains, enso
    content/
      index.js                     re-exports everything below
      lessons.js stage1.js … stage5.js glossary.js exercises.js maxims.js
    render/
      dom.js                       el(tag, attrs, children) helper
      table.js list.js recall.js
      wheel.js wheel-geometry.js   (geometry is pure, tested)
      balance.js tabs.js mountains.js cards.js maxims.js match.js
      glossary.js practice.js
      panel.js                     renderStage(stage, ctx) -> element (composes the above)
    assets/fonts/                  *.woff2 + OFL-*.txt
  tests/
    router.test.mjs ring.test.mjs wheel-geometry.test.mjs content.test.mjs dom.test.mjs
  .github/workflows/pages.yml
  README.md (exists; update demo link and sections in Task 14)
```

`tests/dom.test.mjs` uses a 40-line fake `document` (see Task 6) so renderer output can be asserted in Node without a DOM library. It checks structure, roles and text, not layout.

---

### Task 1: Scaffold, tokens and the Pages workflow

**Files:**
- Create: `package.json`, `site/index.html`, `site/app.css`, `site/app.js`, `tests/smoke.test.mjs`, `.github/workflows/pages.yml`

**Interfaces:**
- Produces: `index.html` element ids used by every later task: `#top`, `#ring` (an `<svg>`), `#koan`, `#panel`, `#view`.

- [ ] **Step 1: Write the smoke test**

```js
// tests/smoke.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index.html references assets relatively and credits the author", async () => {
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /(href|src)="\//, "no root-absolute asset paths");
  assert.match(html, /Philip Toshio Sudo/);
  for (const id of ["top", "ring", "koan", "panel", "view"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/`
Expected: FAIL, `ENOENT` for `site/index.html`.

- [ ] **Step 3: Create package.json**

```json
{
  "name": "zen-guitar",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test tests/", "serve": "python3 -m http.server 8000 --directory site" }
}
```

- [ ] **Step 4: Create the HTML shell**

```html
<!-- site/index.html -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zen Guitar, a belt you walk around</title>
<meta name="description" content="A visual tour of Zen Guitar by Philip Toshio Sudo: five belt stages, twelve points of focus, twelve missteps, and the Way.">
<meta name="color-scheme" content="light dark">
<link rel="stylesheet" href="./app.css">
<link rel="icon" href="./assets/icon.svg" type="image/svg+xml">
</head>
<body>
<header id="top" class="top">
  <a href="#/" class="top-home">Zen Guitar</a>
  <nav class="top-nav" aria-label="Views">
    <a href="#/glossary">Glossary</a>
    <a href="#/practice">Practice</a>
  </nav>
</header>
<main class="stage">
  <div class="ring-wrap">
    <svg id="ring" viewBox="0 0 400 400" role="group" aria-label="Belt ring with five stages"></svg>
    <p id="koan" class="koan" aria-live="polite"></p>
  </div>
  <section id="panel" class="panel" aria-live="polite"></section>
</main>
<section id="view" class="view" hidden></section>
<footer class="foot">A study companion to <em>Zen Guitar</em> by Philip Toshio Sudo (Simon &amp; Schuster, 1997). Not affiliated with the author or publisher. Nothing is saved between visits.</footer>
<script type="module" src="./app.js"></script>
</body>
</html>
```

Also create `site/assets/icon.svg`: a 32×32 SVG with a ring, `<circle cx="16" cy="16" r="11" fill="none" stroke="#1b1a17" stroke-width="7"/>` and a vermilion dot at the top `<circle cx="16" cy="5" r="3" fill="#c0392b"/>`.

- [ ] **Step 5: Create app.css with tokens, layout and reduced motion**

```css
/* site/app.css */
:root {
  --paper: #f6f1e7; --ink: #1b1a17; --accent: #c0392b;
  --muted: color-mix(in srgb, var(--ink) 55%, var(--paper));
  --rule: color-mix(in srgb, var(--ink) 18%, var(--paper));
  --serif: "Source Serif 4", "Iowan Old Style", Georgia, serif;
  --sans: "Source Sans 3", system-ui, sans-serif;
  --ease: 400ms cubic-bezier(.4, 0, .2, 1);
  --gutter: 16px;
}
@media (prefers-color-scheme: dark) {
  :root { --paper: #161513; --ink: #ece6d8; }
}
@media (prefers-reduced-motion: reduce) {
  :root { --ease: 0ms; }
  *, *::before, *::after { transition-duration: 0ms !important; animation-duration: 0ms !important; }
}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.55 var(--serif); }
a { color: var(--accent); }
.top { display: flex; justify-content: space-between; align-items: baseline; padding: 14px var(--gutter); font-family: var(--sans); font-size: 14px; letter-spacing: .04em; }
.top-home { color: inherit; text-decoration: none; font-weight: 600; }
.top-nav a { color: inherit; text-decoration: none; margin-left: 18px; opacity: .7; }
.top-nav a[aria-current="page"] { opacity: 1; color: var(--accent); }
.stage { display: grid; grid-template-columns: minmax(280px, 420px) 1fr; gap: 32px; align-items: start; padding: 0 var(--gutter) 40px; max-width: 1100px; margin: 0 auto; }
.ring-wrap { position: sticky; top: 16px; }
#ring { width: 100%; height: auto; display: block; transition: transform var(--ease); }
.koan { text-align: center; font-style: italic; color: var(--muted); min-height: 1.6em; margin: 6px 0 0; }
.panel { min-width: 0; }
.view { padding: 0 var(--gutter) 40px; max-width: 760px; margin: 0 auto; }
.view[hidden], .stage[hidden] { display: none; }
.foot { padding: 24px var(--gutter); font-size: 13px; color: var(--muted); text-align: center; }
@media (max-width: 819px) {
  .stage { grid-template-columns: 1fr; gap: 12px; }
  .ring-wrap { position: static; width: 150px; margin: 0 auto; }
}
```

- [ ] **Step 6: Create a placeholder app.js**

```js
// site/app.js
console.log("zen guitar: boot");
```

- [ ] **Step 7: Create the Pages workflow**

```yaml
# .github/workflows/pages.yml
name: Live demo

on:
  push:
    branches: [main]
    paths: ["site/**", "tests/**", "package.json", ".github/workflows/pages.yml"]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: "24"
      - run: node --test tests/
  deploy:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6.0.0
      - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1
```

- [ ] **Step 8: Run the tests**

Run: `node --test tests/`
Expected: 1 pass.

- [ ] **Step 9: Commit**

```bash
git add package.json site tests .github
git commit -m "Scaffold the site shell, tokens and the Pages workflow"
```

---

### Task 2: Hash router (pure)

**Files:**
- Create: `site/router.js`, `tests/router.test.mjs`

**Interfaces:**
- Produces:
  - `parseHash(hash: string): Route` where `Route = { view: "stage"|"glossary"|"practice", stage: 1..5, section: string|null, again: boolean }`
  - `buildHash(route: Route): string` (always starts with `#/`)
  - `normalize(route, stages)`: clamps unknown stage to 1 and unknown section to null, given the `stages` array from content.
  - `nextStage(n)`, `prevStage(n)`: wrap 5→1 and 1→5; `nextStage(5)` returns `{ stage: 1, again: true }`, all others `{ stage, again: false }`.

- [ ] **Step 1: Write the failing tests**

```js
// tests/router.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHash, buildHash, normalize, nextStage, prevStage } from "../site/router.js";

const stages = [1, 2, 3, 4, 5].map((id) => ({ id, sections: [{ id: "a" }, { id: "b" }] }));

test("parseHash reads stage, section and again", () => {
  assert.deepEqual(parseHash("#/2/b"), { view: "stage", stage: 2, section: "b", again: false });
  assert.deepEqual(parseHash("#/1?again"), { view: "stage", stage: 1, section: null, again: true });
  assert.deepEqual(parseHash("#/glossary"), { view: "glossary", stage: 1, section: null, again: false });
  assert.deepEqual(parseHash("#/practice"), { view: "practice", stage: 1, section: null, again: false });
});

test("parseHash treats garbage as stage 1", () => {
  for (const h of ["", "#", "#/", "#/9", "#/abc", "#/2/nothing/extra", "#//"]) {
    const r = parseHash(h);
    assert.equal(r.view, "stage", h);
    assert.ok(r.stage >= 1 && r.stage <= 5, h);
  }
  assert.equal(parseHash("#/9").stage, 1);
  assert.equal(parseHash("#/0").stage, 1);
});

test("normalize drops unknown sections and clamps stage", () => {
  assert.deepEqual(normalize({ view: "stage", stage: 2, section: "zzz", again: false }, stages),
    { view: "stage", stage: 2, section: null, again: false });
  assert.equal(normalize({ view: "stage", stage: 7, section: null, again: false }, stages).stage, 1);
});

test("buildHash round-trips", () => {
  for (const h of ["#/1", "#/3/b", "#/1?again", "#/glossary", "#/practice"]) {
    assert.equal(buildHash(parseHash(h)), h);
  }
});

test("next and prev wrap the ring, and wrapping forward sets again", () => {
  assert.deepEqual(nextStage(1), { stage: 2, again: false });
  assert.deepEqual(nextStage(5), { stage: 1, again: true });
  assert.deepEqual(prevStage(1), { stage: 5, again: false });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/router.test.mjs`
Expected: FAIL, cannot find module `../site/router.js`.

- [ ] **Step 3: Implement router.js**

```js
// site/router.js
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
  return { view: "stage", stage, section, again };
}

export function buildHash(route) {
  if (route.view !== "stage") return `#/${route.view}`;
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
  return { view: "stage", stage, section, again: Boolean(route.again) };
}

export function nextStage(n) {
  return n >= STAGES ? { stage: 1, again: true } : { stage: n + 1, again: false };
}

export function prevStage(n) {
  return n <= 1 ? { stage: STAGES, again: false } : { stage: n - 1, again: false };
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add site/router.js tests/router.test.mjs
git commit -m "Route by hash: stage, section, again, and the two views"
```

---

### Task 3: Ring geometry (pure)

**Files:**
- Create: `site/ring.js`, `tests/ring.test.mjs`

**Interfaces:**
- Produces:
  - `markerPositions(count, radius, cx = 200, cy = 200): Array<{ x, y, angle }>`, marker 0 at 12 o'clock, clockwise, `angle` in degrees from 12 o'clock.
  - `rotationFor(stage, count = 5): number` degrees to rotate the whole ring so `stage` sits at 12 o'clock (negative of that marker's angle).
  - `wornStops(again: boolean): Array<{ offset, color }>` gradient stops for the right half (white → black). When `again` is true the darkest stop is `#2a2825` instead of `#151412` and the midpoint is lighter.
  - `beltPath(radius, cx, cy, side: "right"|"left"): string` SVG arc path.

- [ ] **Step 1: Write the failing tests**

```js
// tests/ring.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { markerPositions, rotationFor, wornStops, beltPath } from "../site/ring.js";

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test("five markers sit evenly, first at 12 o'clock, clockwise", () => {
  const m = markerPositions(5, 100);
  assert.equal(m.length, 5);
  assert.ok(near(m[0].x, 200) && near(m[0].y, 100), "marker 0 at top");
  assert.deepEqual(m.map((p) => p.angle), [0, 72, 144, 216, 288]);
  assert.ok(m[1].x > 200 && m[1].y < 200, "marker 1 is upper-right (clockwise)");
});

test("rotationFor brings the stage to the top", () => {
  assert.equal(rotationFor(1), 0);
  assert.equal(rotationFor(2), -72);
  assert.equal(rotationFor(5), -288);
});

test("worn stops are lighter than fresh stops", () => {
  const fresh = wornStops(false), worn = wornStops(true);
  assert.equal(fresh.length, worn.length);
  assert.equal(fresh[0].color, "#f6f1e7");
  assert.notEqual(fresh.at(-1).color, worn.at(-1).color);
  assert.equal(worn.at(-1).color, "#2a2825");
});

test("beltPath draws a half circle arc", () => {
  const p = beltPath(142, 200, 200, "right");
  assert.match(p, /^M200 58 A142 142 0 0 1 200 342$/);
  assert.match(beltPath(142, 200, 200, "left"), /^M200 342 A142 142 0 0 1 200 58$/);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/ring.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement ring.js**

```js
// site/ring.js
export function markerPositions(count, radius, cx = 200, cy = 200) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad), angle };
  });
}

export function rotationFor(stage, count = 5) {
  return -((360 / count) * (stage - 1));
}

export function wornStops(again) {
  return again
    ? [{ offset: 0, color: "#f6f1e7" }, { offset: 0.5, color: "#8d877a" }, { offset: 1, color: "#2a2825" }]
    : [{ offset: 0, color: "#f6f1e7" }, { offset: 0.5, color: "#6b665c" }, { offset: 1, color: "#151412" }];
}

export function beltPath(radius, cx, cy, side) {
  const top = `${cx} ${cy - radius}`, bottom = `${cx} ${cy + radius}`;
  return side === "right"
    ? `M${top} A${radius} ${radius} 0 0 1 ${bottom}`
    : `M${bottom} A${radius} ${radius} 0 0 1 ${top}`;
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add site/ring.js tests/ring.test.mjs
git commit -m "Compute belt ring geometry: markers, rotation, worn gradient"
```

---

### Task 4: Content, part 1: lessons, stage 1, and the integrity test skeleton

**Files:**
- Create: `site/content/lessons.js`, `site/content/stage1.js`, `site/content/index.js`, `tests/content.test.mjs`
- Read: `zen_guitar/Zen-Guitar-Study-Guide.md` (the only source of text)

**Interfaces:**
- Produces the shapes below. Later tasks import from `site/content/index.js` only.

```js
// lessons: id -> { stage, section, label }
// stage: { id, slug, title, subtitle, emblem, koan, intro, sections: Section[], recall: {q,a}[], reflection: string[] }
// Section: { type, id, heading, ...typeData }   (types listed in the spec table plus "match")
```

- [ ] **Step 1: Write the integrity test (it will grow in Task 5)**

```js
// tests/content.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { stages, lessons } from "../site/content/index.js";

const KNOWN_TYPES = new Set(["table", "steps", "terms", "wheel", "balance", "tabs", "mountains", "cards", "maxims", "match", "list"]);

test("stage 1 is complete", () => {
  const s = stages.find((x) => x.id === 1);
  assert.ok(s, "stage 1 exists");
  for (const key of ["slug", "title", "subtitle", "emblem", "koan", "intro"]) assert.ok(s[key], key);
  assert.ok(s.sections.length >= 3);
  assert.ok(s.recall.length >= 2);
  assert.ok(s.reflection.length >= 1);
});

test("every section has a known type, a unique id and a heading", () => {
  for (const s of stages) {
    const ids = new Set();
    for (const sec of s.sections) {
      assert.ok(KNOWN_TYPES.has(sec.type), `${s.id}/${sec.id}: type ${sec.type}`);
      assert.ok(sec.id && !ids.has(sec.id), `${s.id}: duplicate or missing id ${sec.id}`);
      ids.add(sec.id);
      assert.ok(sec.heading, `${s.id}/${sec.id}: heading`);
    }
  }
});

test("lessons point at real stages and sections", () => {
  for (const [id, l] of Object.entries(lessons)) {
    const s = stages.find((x) => x.id === l.stage);
    assert.ok(s, `${id}: stage ${l.stage}`);
    if (s) assert.ok(s.sections.some((sec) => sec.id === l.section), `${id}: section ${l.section}`);
    assert.ok(l.label, `${id}: label`);
  }
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Write lessons.js**

Every lesson id the site will ever reference. Ids are kebab-case. Stage 2 points and missteps, stage 3 head/hand/heart rows, stage 4 dualities, and the stage 1 steps all get one.

```js
// site/content/lessons.js
export const lessons = {
  // Stage 1
  "empty-cup":      { stage: 1, section: "ideas", label: "Empty cup" },
  "wear-the-belt":  { stage: 1, section: "steps", label: "Wear the white belt" },
  "pick-up":        { stage: 1, section: "steps", label: "Pick up your guitar" },
  "tune":           { stage: 1, section: "steps", label: "Tune" },
  "play":           { stage: 1, section: "steps", label: "Play" },
  // Stage 2, twelve points
  "spirit":         { stage: 2, section: "points", label: "Spirit" },
  "rhythm":         { stage: 2, section: "points", label: "Rhythm" },
  "technique":      { stage: 2, section: "points", label: "Technique" },
  "feel":           { stage: 2, section: "points", label: "Feel" },
  "perfection":     { stage: 2, section: "points", label: "Perfection" },
  "mistakes":       { stage: 2, section: "points", label: "Mistakes" },
  "plateaus":       { stage: 2, section: "points", label: "Stages and plateaus" },
  "discipline":     { stage: 2, section: "points", label: "Discipline" },
  "limits":         { stage: 2, section: "points", label: "Limits" },
  "follow-through": { stage: 2, section: "points", label: "Follow-through" },
  "taste":          { stage: 2, section: "points", label: "Taste" },
  "collaboration":  { stage: 2, section: "points", label: "Collaboration" },
  // Stage 2, twelve missteps
  "self-doubt":     { stage: 2, section: "missteps", label: "Self-doubt" },
  "instant-gratification": { stage: 2, section: "missteps", label: "Instant gratification" },
  "ego":            { stage: 2, section: "missteps", label: "Ego" },
  "halfheartedness":{ stage: 2, section: "missteps", label: "Halfheartedness" },
  "overearnestness":{ stage: 2, section: "missteps", label: "Overearnestness" },
  "speed":          { stage: 2, section: "missteps", label: "Speed" },
  "competition":    { stage: 2, section: "missteps", label: "Competition" },
  "obsession":      { stage: 2, section: "missteps", label: "Obsession" },
  "criticism":      { stage: 2, section: "missteps", label: "Mishandled criticism" },
  "adjust":         { stage: 2, section: "missteps", label: "Failure to adjust" },
  "focus":          { stage: 2, section: "missteps", label: "Loss of focus" },
  "overthinking":   { stage: 2, section: "missteps", label: "Overthinking" },
  // Stage 3
  "responsibilities": { stage: 3, section: "responsibilities", label: "The five responsibilities" },
  "know-one-thing": { stage: 3, section: "hhh", label: "Know one thing" },
  "statement":      { stage: 3, section: "hhh", label: "Make a statement" },
  "decide":         { stage: 3, section: "hhh", label: "Decide" },
  "prepare":        { stage: 3, section: "hhh", label: "Prepare the mind" },
  "context":        { stage: 3, section: "hhh", label: "Establish the context" },
  "changes":        { stage: 3, section: "hhh", label: "Play the changes" },
  "frame":          { stage: 3, section: "hhh", label: "Draw the frame" },
  "zoom":           { stage: 3, section: "hhh", label: "Zoom in, zoom out" },
  "trust-the-tale": { stage: 3, section: "hhh", label: "Trust the tale" },
  "detail":         { stage: 3, section: "hhh", label: "Attend to detail" },
  "process":        { stage: 3, section: "hhh", label: "Process, not product" },
  "carriage":       { stage: 3, section: "hhh", label: "Carriage" },
  "touch":          { stage: 3, section: "hhh", label: "Touch" },
  "tone":           { stage: 3, section: "hhh", label: "Tone" },
  "intuition":      { stage: 3, section: "hhh", label: "Intuition" },
  "energy":         { stage: 3, section: "hhh", label: "Energy" },
  "yin-yang":       { stage: 3, section: "hhh", label: "Yin-yang" },
  "two-hands":      { stage: 3, section: "hhh", label: "Two hands as one" },
  "balance":        { stage: 3, section: "hhh", label: "Balance" },
  "true-self":      { stage: 3, section: "hhh", label: "True self" },
  "conviction":     { stage: 3, section: "hhh", label: "Conviction" },
  "jamming":        { stage: 3, section: "hhh", label: "Jamming" },
  "recording":      { stage: 3, section: "hhh", label: "Recording" },
  "first-take":     { stage: 3, section: "hhh", label: "First take" },
  "virtuosity":     { stage: 3, section: "hhh", label: "Virtuosity" },
  "mastery":        { stage: 3, section: "hhh", label: "Mastery" },
  // Stage 4
  "mountain":       { stage: 4, section: "mountains", label: "Mountain is mountain" },
  "entrance-exit":  { stage: 4, section: "dualities", label: "Entrance and exit" },
  "imperfection":   { stage: 4, section: "dualities", label: "Perfection and imperfection" },
  "communion":      { stage: 4, section: "dualities", label: "Communion" },
  "letting-go":     { stage: 4, section: "dualities", label: "Holding on and letting go" },
  "silence":        { stage: 4, section: "dualities", label: "Sound and silence" },
  "teacher-student":{ stage: 4, section: "dualities", label: "Teacher and student" },
  // Stage 5
  "the-way":        { stage: 5, section: "maxims", label: "The Way" },
};
```

- [ ] **Step 4: Write stage1.js, transcribed from the study guide's Stage 1**

All text is paraphrase from `zen_guitar/Zen-Guitar-Study-Guide.md` § Stage 1. Keep sentences short; the panel is narrow.

```js
// site/content/stage1.js
export const stage1 = {
  id: 1,
  slug: "white-belt",
  title: "White Belt",
  subtitle: "Beginner's Mind",
  emblem: "teacup",
  koan: "What is the sound of one hand clapping?",
  intro:
    "Everyone in the dojo starts at white belt, whatever they already know. The belt is never awarded or upgraded; it turns black on its own through years of use. The question that opens this stage is simple: why are you here? The book's answer is that everyone comes to make a sound, and the sound is ultimately the same one.",
  sections: [
    {
      type: "table", id: "ideas", heading: "Key ideas",
      columns: ["Idea", "What it means", "Where it comes from"],
      rows: [
        { lesson: "empty-cup", cells: ["Empty cup", "Set aside what you already know so new learning can enter.", "Nan-in overfilling a professor's teacup."] },
        { cells: ["Sensei", "Not \"teacher\" but one who has gone before: a guide, not an authority.", "Japanese usage."] },
        { cells: ["Unsui", "The student: cloud and water, floating and flowing, without fixed form.", "Zen term for a travelling monk."] },
        { cells: ["Dojo", "Any place where body, mind and spirit train together. A bedroom or a street corner qualifies.", "\"Place of the Way.\""] },
        { cells: ["Wisdom vs. information", "Chords and theory are information, available anywhere. The dojo teaches only what must be learned through experience.", "The author's framing."] },
      ],
    },
    {
      type: "steps", id: "steps", heading: "The four steps",
      items: [
        { lesson: "wear-the-belt", title: "Wear the white belt", text: "Approach every session as if it were your first time holding a guitar. Each lesson is a teabag; you supply the hot water by relating it to your own life." },
        { lesson: "pick-up", title: "Pick up your guitar", text: "Find an instrument whose sound is beautiful to you. Quality matters, price does not; a broomstick with one string will do. Then take it in hand with intention, even if the intention is only to noodle." },
        { lesson: "tune", title: "Tune", text: "Three levels: tune the instrument to itself; tune yourself to the instrument; tune body, mind and spirit to each other so there is no internal static. Tuning is the common ground that lets people play together at all." },
        { lesson: "play", title: "Play", text: "Play one note and put everything you have into it. Then repeat. Technique serves expression, never the reverse. Style is inborn like a fingerprint and emerges from the inside out." },
      ],
    },
    {
      type: "terms", id: "terms", heading: "Terms to know",
      items: [
        { term: "Katsu", kanji: "喝", text: "The martial-arts shout that builds spirit. The strike and the shout are one thing." },
        { term: "Ch'iyun", kanji: "氣韻", text: "The sympathetic vibration between player and listener that lets a performance transcend separateness." },
      ],
    },
  ],
  recall: [
    { q: "What are the four steps of Zen Guitar, and what are the three levels of \"tune\"?", a: "Wear the white belt, pick up your guitar, tune, play. Tune the instrument to itself, yourself to the instrument, and body, mind and spirit to each other." },
    { q: "Why does the dojo award only one belt? How does it change colour?", a: "Because the belt is never awarded at all. It turns black through years of use, then wears back to white." },
  ],
  reflection: [
    "Why have you come to this place at this time? What sound are you trying to make?",
    "In what area of your life are you already a black belt? What from that area transfers to the guitar?",
  ],
};
```

- [ ] **Step 5: Write content/index.js (stages 2–5 arrive in Task 5; export what exists)**

```js
// site/content/index.js
import { stage1 } from "./stage1.js";
export { lessons } from "./lessons.js";
export const stages = [stage1];
export const glossary = [];
export const exercises = [];
export const maxims = [];
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/`
Expected: `lessons point at real stages` FAILS for stage 2–5 ids. That is expected until Task 5; mark the test `{ todo: true }` for now by changing `test(` to `test.todo(` on that one test only, and note it in the commit message. The other two pass.

- [ ] **Step 7: Commit**

```bash
git add site/content tests/content.test.mjs
git commit -m "Add the lesson index and stage 1 content; lesson test is todo until all stages exist"
```

---

### Task 5: Content, part 2: stages 2–5, glossary, exercises, maxims, and the full integrity test

**Files:**
- Create: `site/content/stage2.js` … `stage5.js`, `glossary.js`, `exercises.js`, `maxims.js`
- Modify: `site/content/index.js`, `tests/content.test.mjs`
- Read: `zen_guitar/Zen-Guitar-Study-Guide.md` §§ Stage 2 through Glossary, Practice exercises, Self-test

**Interfaces:**
- Produces the section shapes the renderers consume. Exact shapes:

```js
// stage2 sections
{ type: "wheel",   id: "points",   heading: "The twelve points of focus",
  hub: { term: "shugyo", kanji: "修行", gloss: "training without end" },
  items: [{ lesson: "spirit", name: "Spirit", core: "...", image: "..." }, /* 12 total, in book order */] }
{ type: "balance", id: "missteps", heading: "The twelve common missteps",
  caption: "Many missteps come in opposite pairs. The correction is a return to centre, chudan, not a swing to the other extreme.",
  pairs: [ [ {lesson:"self-doubt", name, trap, correction}, {lesson:"ego", ...} ],
           [ halfheartedness, overearnestness ], [ obsession, focus ] ],
  others: [ instant-gratification, speed, competition, criticism, adjust, overthinking ] }
{ type: "list", id: "collaboration", heading: "Collaboration decision rules", items: [{ title, text }] }   // four rules

// stage3 sections
{ type: "steps", id: "responsibilities", heading: "The five responsibilities", items: [{ lesson: "responsibilities", title: "To yourself", text }, ...5] }
{ type: "tabs", id: "hhh", heading: "Black-belt head, hand and heart",
  tabs: [ { id: "head", label: "Head", intro: "the thinking", section: { type: "table", id: "head", heading: "Head", columns: ["Lesson", "Core idea"], rows: [{ lesson: "know-one-thing", cells: ["Know one thing", "..."] }, ...11] } },
          { id: "hand", ... 8 rows }, { id: "heart", ... 7 rows } ] }

// stage4 sections
{ type: "mountains", id: "mountains", heading: "First, mountain is mountain",
  items: [ { caption: "Mountain is mountain", text: "Music is just music." },
           { caption: "Mountain is not mountain", text: "It becomes your passion and religion." },
           { caption: "Mountain is mountain again", text: "You see through to the source of all sound." } ] }
{ type: "cards", id: "dualities", heading: "The six dualities", items: [{ lesson: "entrance-exit", front: "Entrance and exit", back: "..." }, ...6] }

// stage5 sections
{ type: "maxims", id: "maxims", heading: "The Way of Zen Guitar" }   // reads the maxims export
{ type: "match", id: "match", heading: "Match the image to the lesson",
  items: [ { image: "An overflowing teacup", lesson: "empty-cup" },
           { image: "A light bulb replaced after class", lesson: "discipline" },
           { image: "An audience clapping in unison", lesson: "rhythm" },
           { image: "An umbrella left or right of the shoes", lesson: "detail" },
           { image: "Two hydrogen and one oxygen", lesson: "collaboration" },
           { image: "A book placed on the coals", lesson: "letting-go" },
           { image: "A man hanging from a branch by his teeth", lesson: "decide" },
           { image: "Hot sauce in jambalaya", lesson: "jamming" },
           { image: "Ninety miles of a hundred-mile march", lesson: "follow-through" },
           { image: "A single flute note for the emperor", lesson: "silence" } ] }

// glossary: [{ term: "Chudan", kanji: "中段", literal: "Middle ground", usage: "..." }]  (20 entries; kanji optional, omit when unsure)
// exercises: [{ belt: "white"|"practice"|"black"|"barrier", name: "One-note practice", text: "...", lessons: ["play"] }]
// maxims: [{ text: "Delete needless notes.", lesson: "statement" }, { text: "Be quick, not hasty.", lesson: "speed" }, ...]
```

Stage metadata: stage 2 `emblem: "fist"`, `koan: "Seven times down, eight times up."`; stage 3 `emblem: "hand"`, `koan: "Then wash your bowl."`; stage 4 `emblem: "mountain"`, `koan: "Mountain is mountain."`; stage 5 `emblem: "enso"`, `koan: "Not yet."`. Slugs: `white-to-black`, `black-belt`, `black-to-white`, `the-way`.

Transcribe every row from the study guide's tables. Paraphrase: shorten, do not copy the book's own sentences verbatim beyond the short maxims and Zen sayings. The maxims list in stage 5 is the study guide's eight paraphrased themes plus the four opening instructions (return to the beginning, clean your dojo, tie on the white belt, empty your cup), twelve lines total, each tagged with the lesson it traces to where one is obvious.

- [ ] **Step 1: Extend the integrity test with the counts and cross-references**

Replace `test.todo(` with `test(` on the lessons test and append:

```js
import { glossary, exercises, maxims } from "../site/content/index.js";

const byId = (n) => stages.find((s) => s.id === n);
const section = (n, id) => byId(n).sections.find((s) => s.id === id);

test("five stages in order with emblem and koan", () => {
  assert.deepEqual(stages.map((s) => s.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(stages.map((s) => s.emblem), ["teacup", "fist", "hand", "mountain", "enso"]);
  for (const s of stages) assert.ok(s.koan && s.intro && s.slug);
});

test("the book's counts hold", () => {
  assert.equal(section(2, "points").items.length, 12);
  const b = section(2, "missteps");
  assert.equal(b.pairs.length, 3);
  assert.equal(b.pairs.flat().length + b.others.length, 12);
  assert.equal(section(3, "responsibilities").items.length, 5);
  const tabs = section(3, "hhh").tabs;
  assert.deepEqual(tabs.map((t) => t.section.rows.length), [11, 8, 7]);
  assert.equal(section(4, "mountains").items.length, 3);
  assert.equal(section(4, "dualities").items.length, 6);
  assert.equal(section(5, "match").items.length, 10);
  assert.equal(glossary.length, 20);
  assert.ok(exercises.length >= 20);
  assert.ok(maxims.length >= 10);
});

test("every lesson reference resolves", () => {
  const refs = [];
  for (const s of stages) for (const sec of s.sections) {
    for (const it of sec.items ?? []) if (it.lesson) refs.push([`${s.id}/${sec.id}`, it.lesson]);
    for (const r of sec.rows ?? []) if (r.lesson) refs.push([`${s.id}/${sec.id}`, r.lesson]);
    for (const pair of sec.pairs ?? []) for (const it of pair) refs.push([`${s.id}/${sec.id}`, it.lesson]);
    for (const it of sec.others ?? []) refs.push([`${s.id}/${sec.id}`, it.lesson]);
    for (const t of sec.tabs ?? []) for (const r of t.section.rows) if (r.lesson) refs.push([`${s.id}/${t.id}`, r.lesson]);
  }
  for (const e of exercises) for (const l of e.lessons) refs.push([`exercise ${e.name}`, l]);
  for (const m of maxims) if (m.lesson) refs.push([`maxim ${m.text}`, m.lesson]);
  for (const [where, id] of refs) assert.ok(lessons[id], `${where} -> unknown lesson "${id}"`);
});

test("wheel and balance items each carry a distinct lesson id", () => {
  const ids = [...section(2, "points").items, ...section(2, "missteps").pairs.flat(), ...section(2, "missteps").others].map((i) => i.lesson);
  assert.equal(new Set(ids).size, 24);
});

test("exercises use only the four belts", () => {
  for (const e of exercises) assert.ok(["white", "practice", "black", "barrier"].includes(e.belt), e.name);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL on `five stages in order`.

- [ ] **Step 3: Write stage2.js through stage5.js, glossary.js, exercises.js, maxims.js**

Transcribe from the study guide following the shapes above. Read the guide section by section while writing each file. Use the lesson ids from `lessons.js` exactly.

- [ ] **Step 4: Update index.js**

```js
// site/content/index.js
import { stage1 } from "./stage1.js";
import { stage2 } from "./stage2.js";
import { stage3 } from "./stage3.js";
import { stage4 } from "./stage4.js";
import { stage5 } from "./stage5.js";
export { lessons } from "./lessons.js";
export { glossary } from "./glossary.js";
export { exercises } from "./exercises.js";
export { maxims } from "./maxims.js";
export const stages = [stage1, stage2, stage3, stage4, stage5];
```

- [ ] **Step 5: Run tests until every count and reference passes**

Run: `node --test tests/`
Expected: all pass. A failing reference names the exact place and id; fix the data, not the test.

- [ ] **Step 6: Commit**

```bash
git add site/content tests/content.test.mjs
git commit -m "Transcribe stages 2 to 5, the glossary, exercises and maxims from the study guide"
```

---

### Task 6: DOM helper, fake document, and the plain renderers (table, list, recall)

**Files:**
- Create: `site/render/dom.js`, `site/render/table.js`, `site/render/list.js`, `site/render/recall.js`, `tests/fake-dom.mjs`, `tests/dom.test.mjs`

**Interfaces:**
- Produces:
  - `el(tag, attrs = {}, children = []): Element`. `attrs` keys become attributes; `class` and `dataset`-style keys are plain attributes; `on*` keys become listeners via `addEventListener`. Children may be strings (become text nodes) or nodes. Uses `globalThis.document`.
  - `svg(tag, attrs, children)`: same, in the SVG namespace.
  - `renderTable(section, ctx)`, `renderList(section, ctx)` (handles `steps`, `terms`, `list`), `renderRecall(stage)`: each returns an Element.
  - `ctx = { lessons, highlightStage(n|null), exercisesFor(lessonId) }`.

- [ ] **Step 1: Write the fake DOM used by all renderer tests**

```js
// tests/fake-dom.mjs
class FakeNode {
  constructor(tag, ns) { this.tagName = tag; this.namespaceURI = ns; this.children = []; this.attrs = {}; this.listeners = {}; this._text = ""; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  appendChild(n) { this.children.push(n); n.parentNode = this; return n; }
  append(...ns) { ns.forEach((n) => this.appendChild(typeof n === "string" ? document.createTextNode(n) : n)); }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  dispatch(t, ev = {}) { (this.listeners[t] ?? []).forEach((f) => f({ type: t, preventDefault() {}, ...ev })); }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  set innerHTML(v) { this._html = v; }
  get innerHTML() { return this._html ?? ""; }
  get classList() { const self = this; return {
    add: (...c) => { const s = new Set((self.attrs.class ?? "").split(" ").filter(Boolean)); c.forEach((x) => s.add(x)); self.attrs.class = [...s].join(" "); },
    remove: (...c) => { const s = new Set((self.attrs.class ?? "").split(" ").filter(Boolean)); c.forEach((x) => s.delete(x)); self.attrs.class = [...s].join(" "); },
    toggle: (c, force) => { const has = self.classList.contains(c); const want = force ?? !has; want ? self.classList.add(c) : self.classList.remove(c); return want; },
    contains: (c) => (self.attrs.class ?? "").split(" ").includes(c),
  }; }
  querySelectorAll(sel) { const out = []; const m = sel.match(/^([a-z]+)?(?:\.([\w-]+))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/i);
    const walk = (n) => { for (const c of n.children) { if (c instanceof FakeNode) { if (matches(c, m)) out.push(c); walk(c); } } };
    walk(this); return out; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
  get hidden() { return this.attrs.hidden === "true"; } set hidden(v) { if (v) this.attrs.hidden = "true"; else delete this.attrs.hidden; }
  focus() { document.activeElement = this; }
}
function matches(n, m) { if (!m) return false; const [, tag, cls, attr, val] = m;
  if (tag && n.tagName !== tag) return false; if (cls && !n.classList.contains(cls)) return false;
  if (attr && (n.getAttribute(attr) === null || (val !== undefined && n.getAttribute(attr) !== val))) return false; return true; }
class FakeText { constructor(t) { this.textContent = t; } }
export const document = {
  createElement: (t) => new FakeNode(t, "html"),
  createElementNS: (ns, t) => new FakeNode(t, ns),
  createTextNode: (t) => new FakeText(t),
  activeElement: null,
};
export function install() { globalThis.document = document; return document; }
```

- [ ] **Step 2: Write the failing renderer tests**

```js
// tests/dom.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { install } from "./fake-dom.mjs";
install();
const { el } = await import("../site/render/dom.js");
const { renderTable } = await import("../site/render/table.js");
const { renderList } = await import("../site/render/list.js");
const { renderRecall } = await import("../site/render/recall.js");

const ctx = { lessons: {}, highlightStage() {}, exercisesFor: () => [] };

test("el builds attributes, text and listeners", () => {
  let clicked = 0;
  const b = el("button", { class: "x", "aria-label": "Go", onclick: () => clicked++ }, ["Go"]);
  assert.equal(b.tagName, "button");
  assert.equal(b.getAttribute("aria-label"), "Go");
  assert.equal(b.textContent, "Go");
  b.dispatch("click");
  assert.equal(clicked, 1);
});

test("renderTable puts every cell in and tags lesson rows", () => {
  const t = renderTable({ type: "table", id: "ideas", heading: "Key ideas", columns: ["A", "B"], rows: [{ lesson: "empty-cup", cells: ["Empty cup", "Pour it out"] }] }, ctx);
  assert.equal(t.querySelectorAll("th").length, 2);
  assert.equal(t.querySelectorAll("td").length, 2);
  assert.equal(t.querySelector("tr[data-lesson]").getAttribute("data-lesson"), "empty-cup");
  assert.match(t.textContent, /Pour it out/);
});

test("renderList handles steps (ordered) and terms (with kanji)", () => {
  const s = renderList({ type: "steps", id: "steps", heading: "Steps", items: [{ title: "Tune", text: "Get in tune." }] }, ctx);
  assert.equal(s.querySelector("ol").children.length, 1);
  const t = renderList({ type: "terms", id: "terms", heading: "Terms", items: [{ term: "Katsu", kanji: "喝", text: "A shout." }] }, ctx);
  assert.match(t.textContent, /喝/);
  assert.equal(t.querySelector("span[lang=\"ja\"]").textContent, "喝");
});

test("renderRecall reveals answers on click and never shows them by default", () => {
  const r = renderRecall({ recall: [{ q: "Why?", a: "Because." }], reflection: ["Who are you?"] });
  const details = r.querySelector("details");
  assert.ok(details, "uses details/summary so keyboard works for free");
  assert.equal(details.getAttribute("open"), null);
  assert.match(r.textContent, /Who are you\?/);
});
```

- [ ] **Step 3: Run to see it fail**

Run: `node --test tests/dom.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement dom.js**

```js
// site/render/dom.js
const SVG_NS = "http://www.w3.org/2000/svg";

function build(node, attrs, children) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined) continue;
    node.append(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  return node;
}

export const el = (tag, attrs = {}, children = []) => build(document.createElement(tag), attrs, children);
export const svg = (tag, attrs = {}, children = []) => build(document.createElementNS(SVG_NS, tag), attrs, children);

export function heading(section) {
  return el("h3", { class: "sec-h", id: `sec-${section.id}` }, [section.heading]);
}

export function kanji(text) {
  return text ? el("span", { lang: "ja", class: "kanji", "aria-hidden": "true" }, [text]) : null;
}
```

- [ ] **Step 5: Implement table.js, list.js, recall.js**

```js
// site/render/table.js
import { el, heading } from "./dom.js";
export function renderTable(section) {
  const thead = el("thead", {}, [el("tr", {}, section.columns.map((c) => el("th", { scope: "col" }, [c])))]);
  const tbody = el("tbody", {}, section.rows.map((r) =>
    el("tr", { "data-lesson": r.lesson ?? null }, r.cells.map((c, i) => el(i === 0 ? "th" : "td", i === 0 ? { scope: "row" } : {}, [c])))));
  return el("section", { class: "sec sec-table", "aria-labelledby": `sec-${section.id}` }, [heading(section), el("table", { class: "tbl" }, [thead, tbody])]);
}
```

```js
// site/render/list.js
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
```

```js
// site/render/recall.js
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
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add site/render tests/fake-dom.mjs tests/dom.test.mjs
git commit -m "Build DOM from data: element helper, tables, lists and recall"
```

---

### Task 7: The belt ring component and the app shell that navigates

**Files:**
- Create: `site/belt.js`, `site/render/panel.js`
- Modify: `site/app.js`, `site/app.css`

**Interfaces:**
- Consumes: `ring.js` (Task 3), `router.js` (Task 2), `content/index.js` (Task 5), renderers (Task 6).
- Produces:
  - `buildRing(svgEl, { stages, onSelect(stageId) }) -> { setStage(n), setWorn(bool), highlight(n|null), showKoan(text) }`
  - `renderStage(stage, ctx) -> Element` in `panel.js`, which dispatches on `section.type` through a `RENDERERS` map and falls back to a paragraph with the heading for unknown types. Later tasks add entries to `RENDERERS`.
  - `app.js` exposes nothing; it owns the route state and keyboard handling.

- [ ] **Step 1: Write panel.js with the fallback behaviour and a test**

Append to `tests/dom.test.mjs`:

```js
const { renderStage } = await import("../site/render/panel.js");
test("renderStage falls back to a heading paragraph for an unknown section type", () => {
  const out = renderStage({ id: 9, title: "T", subtitle: "S", intro: "I", sections: [{ type: "nope", id: "x", heading: "Mystery" }], recall: [], reflection: [] }, ctx);
  assert.match(out.textContent, /Mystery/);
  assert.ok(out.querySelector("section.sec-fallback"));
});
```

```js
// site/render/panel.js
import { el, heading } from "./dom.js";
import { renderTable } from "./table.js";
import { renderList } from "./list.js";
import { renderRecall } from "./recall.js";

export const RENDERERS = {
  table: renderTable,
  steps: renderList,
  terms: renderList,
  list: renderList,
};

function fallback(section) {
  return el("section", { class: "sec sec-fallback" }, [heading(section), el("p", { class: "muted" }, ["This section is on its way."])]);
}

export function renderStage(stage, ctx) {
  const head = el("header", { class: "stage-head" }, [
    el("p", { class: "eyebrow" }, [`Stage ${stage.id} of 5`]),
    el("h2", { class: "stage-title" }, [stage.title]),
    el("p", { class: "stage-sub" }, [stage.subtitle]),
    el("p", { class: "intro" }, [stage.intro]),
  ]);
  const sections = stage.sections.map((s) => (RENDERERS[s.type] ?? fallback)(s, ctx));
  return el("article", { class: "stage-panel", "data-stage": stage.id }, [head, ...sections, renderRecall(stage)]);
}
```

- [ ] **Step 2: Run tests**

Run: `node --test tests/`
Expected: all pass.

- [ ] **Step 3: Write belt.js**

```js
// site/belt.js
import { svg } from "./render/dom.js";
import { markerPositions, rotationFor, wornStops, beltPath } from "./ring.js";

const CX = 200, CY = 200, R = 142, WIDTH = 34;

function gradient(id, stops, x1, y1, x2, y2) {
  return svg("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1, y1, x2, y2 },
    stops.map((s) => svg("stop", { offset: s.offset, "stop-color": s.color })));
}

export function buildRing(svgEl, { stages, onSelect }) {
  const defs = svg("defs");
  const rightStops = wornStops(false);
  const leftStops = [...rightStops].reverse().map((s, i) => ({ offset: i / (rightStops.length - 1), color: s.color }));
  const gRight = gradient("belt-right", rightStops, CX, CY - R, CX, CY + R);
  const gLeft = gradient("belt-left", leftStops, CX, CY + R, CX, CY - R);
  const fray = svg("filter", { id: "fray", x: "-5%", y: "-5%", width: "110%", height: "110%" }, [
    svg("feTurbulence", { baseFrequency: "0.9", numOctaves: "2", seed: "3", result: "n" }),
    svg("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: "2.5" }),
  ]);
  defs.append(gRight, gLeft, fray);

  const rotor = svg("g", { class: "rotor" });
  rotor.append(
    svg("path", { d: beltPath(R, CX, CY, "right"), fill: "none", stroke: "url(#belt-right)", "stroke-width": WIDTH, filter: "url(#fray)" }),
    svg("path", { d: beltPath(R, CX, CY, "left"), fill: "none", stroke: "url(#belt-left)", "stroke-width": WIDTH, filter: "url(#fray)" }),
    svg("circle", { cx: CX, cy: CY, r: R + 10, class: "stitch" }),
    svg("circle", { cx: CX, cy: CY, r: R - 10, class: "stitch" }),
  );

  const markers = new Map();
  markerPositions(stages.length, R, CX, CY).forEach((p, i) => {
    const stage = stages[i];
    const g = svg("g", { class: "marker", role: "button", tabindex: "0", "aria-label": `Stage ${stage.id}: ${stage.title}`, "data-stage": stage.id, transform: `translate(${p.x} ${p.y})` }, [
      svg("circle", { r: 9, class: "marker-dot" }),
      svg("text", { y: 3, class: "marker-n", "text-anchor": "middle" }, [String(stage.id)]),
    ]);
    const go = () => onSelect(stage.id);
    g.addEventListener("click", go);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    markers.set(stage.id, g);
    rotor.append(g);
  });

  const centre = svg("g", { class: "centre" });
  const koanText = svg("text", { x: CX, y: CY + 4, class: "koan-svg", "text-anchor": "middle" });
  centre.append(koanText);

  svgEl.append(defs, rotor, centre);

  let koanTimer = null;
  return {
    setStage(n) {
      rotor.setAttribute("transform", `rotate(${rotationFor(n, stages.length)} ${CX} ${CY})`);
      for (const [id, g] of markers) {
        g.classList.toggle("is-current", id === n);
        g.setAttribute("aria-current", id === n ? "step" : "false");
        // counter-rotate the number so it stays upright
        g.querySelector("text").setAttribute("transform", `rotate(${-rotationFor(n, stages.length)})`);
      }
    },
    setWorn(again) {
      const stops = wornStops(again);
      gRight.querySelectorAll("stop").forEach((s, i) => s.setAttribute("stop-color", stops[i].color));
      const rev = [...stops].reverse();
      gLeft.querySelectorAll("stop").forEach((s, i) => s.setAttribute("stop-color", rev[i].color));
      svgEl.classList.toggle("is-worn", again);
    },
    highlight(n) {
      for (const [id, g] of markers) g.classList.toggle("is-hot", n !== null && id === n);
    },
    showKoan(text, ms = 1200) {
      const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !text) return;
      clearTimeout(koanTimer);
      koanText.textContent = text;
      svgEl.classList.add("koan-on");
      koanTimer = setTimeout(() => { svgEl.classList.remove("koan-on"); }, ms);
    },
  };
}
```

Note the belt uses `querySelector`/`querySelectorAll` on SVG nodes; the fake DOM supports the selectors used here (`stop`, `text`).

- [ ] **Step 4: Write app.js**

```js
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
```

- [ ] **Step 5: Add ring, marker, panel and landing styles to app.css**

Append:

```css
.stitch { fill: none; stroke: var(--ink); stroke-opacity: .18; stroke-dasharray: 3 5; }
.rotor { transition: transform var(--ease); transform-box: view-box; }
.marker { cursor: pointer; outline: none; }
.marker-dot { fill: var(--paper); stroke: var(--ink); stroke-width: 1.5; transition: fill var(--ease), r var(--ease); }
.marker-n { font: 600 11px var(--sans); fill: var(--ink); pointer-events: none; }
.marker.is-current .marker-dot { fill: var(--accent); stroke: var(--accent); r: 11; }
.marker.is-current .marker-n { fill: #fff; }
.marker.is-hot .marker-dot { stroke: var(--accent); stroke-width: 3; }
.marker:focus-visible .marker-dot { stroke: var(--accent); stroke-width: 3; stroke-dasharray: 2 2; }
.koan-svg { font: italic 15px var(--serif); fill: var(--muted); opacity: 0; transition: opacity var(--ease); }
#ring.koan-on .koan-svg { opacity: 1; }
#ring.is-worn { filter: contrast(.92) saturate(.9); }
.stage-panel { animation: rise var(--ease) both; position: relative; max-width: 65ch; }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.eyebrow { font: 600 11px/1 var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin: 8px 0 6px; }
.stage-title { font-size: 32px; font-weight: 500; margin: 0 0 4px; }
.stage-sub { font-style: italic; color: var(--muted); margin: 0 0 18px; }
.intro { font-size: 17px; }
.hint { font-family: var(--sans); font-size: 14px; color: var(--muted); }
.begin { font: italic 16px var(--serif); color: var(--accent); background: none; border: 0; padding: 0; cursor: pointer; }
.sec { margin: 28px 0; }
.sec-h { font: 600 12px/1 var(--sans); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
.tbl { border-collapse: collapse; width: 100%; font-size: 15px; }
.tbl th, .tbl td { text-align: left; vertical-align: top; padding: 8px 10px 8px 0; border-top: 1px solid var(--rule); }
.tbl thead th { font: 600 11px var(--sans); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); border-top: 0; }
.tbl tbody th { font-weight: 500; width: 28%; }
.steps { padding-left: 1.2em; } .steps li { margin: 8px 0; }
.terms dt { font-weight: 500; margin-top: 10px; } .terms dd { margin: 2px 0 0; }
.kanji { font-size: .8em; color: var(--muted); margin-left: .4em; }
.plain { padding-left: 1.1em; } .plain li { margin: 6px 0; }
.recall { border-top: 1px solid var(--rule); padding: 8px 0; } .recall summary { cursor: pointer; }
.muted { color: var(--muted); }
```

- [ ] **Step 6: Browser check**

Run `python3 -m http.server 8000 --directory site` and open `http://localhost:8000/` in the built-in browser. Confirm: the ring renders with five numbered markers; clicking marker 2 rotates the ring and shows the stage 2 panel with fallback sections; → and ← move stages; after stage 5, → returns to stage 1 with `?again` in the hash and softer ring; the Back button works; the console is clean. Then stop the server.

- [ ] **Step 7: Commit**

```bash
git add site
git commit -m "Draw the belt ring and walk it by click, arrow key and hash"
```

---

### Task 8: The twelve-spoke wheel

**Files:**
- Create: `site/render/wheel-geometry.js`, `site/render/wheel.js`, `tests/wheel-geometry.test.mjs`
- Modify: `site/render/panel.js` (register `wheel`), `site/app.css`, `tests/dom.test.mjs`

**Interfaces:**
- Produces: `spokes(count, inner, outer, cx, cy) -> Array<{ x1, y1, x2, y2, lx, ly, angle, anchor }>` where `lx, ly` is the label position just outside the rim and `anchor` is `"start"|"middle"|"end"` by side. `renderWheel(section, ctx)` returns a section element with an SVG of 12 spokes and a detail box; clicking a spoke shows `core`, `image` and `ctx.exercisesFor(lesson)`.

- [ ] **Step 1: Write the geometry test**

```js
// tests/wheel-geometry.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spokes } from "../site/render/wheel-geometry.js";

test("twelve spokes, first at 12 o'clock, labels anchored by side", () => {
  const s = spokes(12, 34, 120, 170, 170);
  assert.equal(s.length, 12);
  assert.ok(Math.abs(s[0].x1 - 170) < 1e-9 && s[0].y1 < 170 && s[0].y2 < s[0].y1);
  assert.equal(s[0].anchor, "middle");
  assert.equal(s[3].anchor, "start");   // 3 o'clock
  assert.equal(s[9].anchor, "end");     // 9 o'clock
  assert.ok(s[3].lx > s[3].x2, "label sits outside the rim");
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/wheel-geometry.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement wheel-geometry.js**

```js
// site/render/wheel-geometry.js
export function spokes(count, inner, outer, cx, cy, labelGap = 14) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const rad = ((angle - 90) * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const near = (v) => Math.abs(v) < 1e-9;
    const anchor = near(c) ? "middle" : c > 0 ? "start" : "end";
    return {
      x1: cx + inner * c, y1: cy + inner * s,
      x2: cx + outer * c, y2: cy + outer * s,
      lx: cx + (outer + labelGap) * c, ly: cy + (outer + labelGap) * s + 4,
      angle, anchor,
    };
  });
}
```

- [ ] **Step 4: Add the renderer test**

Append to `tests/dom.test.mjs`:

```js
const { renderWheel } = await import("../site/render/wheel.js");
test("renderWheel makes 12 keyboard-reachable spokes and shows detail on activation", () => {
  const items = Array.from({ length: 12 }, (_, i) => ({ lesson: `l${i}`, name: `Point ${i + 1}`, core: `Core ${i + 1}`, image: `Image ${i + 1}` }));
  const w = renderWheel({ type: "wheel", id: "points", heading: "Twelve", hub: { term: "shugyo", kanji: "修行", gloss: "training" }, items },
    { ...ctx, exercisesFor: (l) => (l === "l7" ? [{ name: "Sixteen minutes", text: "One more minute a day." }] : []) });
  const spokesEls = w.querySelectorAll("g[role=\"button\"]");
  assert.equal(spokesEls.length, 12);
  spokesEls.forEach((g) => assert.equal(g.getAttribute("tabindex"), "0"));
  spokesEls[7].dispatch("keydown", { key: "Enter" });
  assert.match(w.querySelector(".wheel-detail").textContent, /Core 8/);
  assert.match(w.querySelector(".wheel-detail").textContent, /Sixteen minutes/);
  assert.ok(spokesEls[7].classList.contains("is-selected"));
});
```

- [ ] **Step 5: Implement wheel.js**

```js
// site/render/wheel.js
import { el, svg, heading, kanji } from "./dom.js";
import { spokes } from "./wheel-geometry.js";

const CX = 170, CY = 170, INNER = 34, OUTER = 120;

export function renderWheel(section, ctx) {
  const detail = el("div", { class: "wheel-detail", "aria-live": "polite" }, [el("p", { class: "muted" }, ["Choose a spoke."])]);
  const geo = spokes(section.items.length, INNER, OUTER, CX, CY);
  const root = svg("svg", { viewBox: "0 0 340 340", class: "wheel", role: "group", "aria-label": section.heading });
  root.append(
    svg("circle", { cx: CX, cy: CY, r: OUTER, class: "wheel-rim" }),
    svg("circle", { cx: CX, cy: CY, r: INNER, class: "wheel-hub" }),
    svg("text", { x: CX, y: CY + 4, class: "wheel-hub-t", "text-anchor": "middle" }, [section.hub.term]),
    svg("text", { x: CX, y: CY + 16, class: "wheel-hub-g", "text-anchor": "middle" }, [section.hub.gloss]),
  );
  const groups = [];
  section.items.forEach((item, i) => {
    const g = geo[i];
    const grp = svg("g", { class: "spoke", role: "button", tabindex: "0", "aria-label": `${i + 1}. ${item.name}` }, [
      svg("line", { x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, class: "spoke-line" }),
      svg("line", { x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, class: "spoke-hit" }),
      svg("text", { x: g.lx, y: g.ly, "text-anchor": g.anchor, class: "spoke-label" }, [item.name]),
    ]);
    const select = () => {
      groups.forEach((o) => o.classList.remove("is-selected"));
      grp.classList.add("is-selected");
      const ex = ctx.exercisesFor(item.lesson);
      detail.replaceChildren(
        el("p", { class: "eyebrow" }, [`${i + 1} of ${section.items.length}`]),
        el("h4", { class: "wheel-name" }, [item.name]),
        el("p", {}, [item.core]),
        el("p", { class: "image" }, [el("span", { class: "eyebrow-inline" }, ["Image "]), item.image]),
        ex.length ? el("p", { class: "trains" }, [el("span", { class: "eyebrow-inline" }, ["Trains with "]), ...ex.flatMap((e, k) => [k ? " · " : "", el("strong", {}, [e.name]), ": ", e.text])]) : null,
      );
    };
    grp.addEventListener("click", select);
    grp.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } });
    groups.push(grp);
    root.append(grp);
  });
  return el("section", { class: "sec sec-wheel", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("div", { class: "wheel-wrap" }, [root, detail]),
    el("p", { class: "muted small" }, [section.hub.term, " ", kanji(section.hub.kanji), ": ", section.hub.gloss, "."]),
  ]);
}
```

- [ ] **Step 6: Register and style**

In `panel.js` add `import { renderWheel } from "./wheel.js";` and `wheel: renderWheel,` to `RENDERERS`.

Append to `app.css`:

```css
.wheel-wrap { display: grid; grid-template-columns: minmax(220px, 340px) 1fr; gap: 18px; align-items: start; }
@media (max-width: 819px) { .wheel-wrap { grid-template-columns: 1fr; } }
.wheel { width: 100%; height: auto; }
.wheel-rim { fill: none; stroke: var(--ink); stroke-opacity: .18; }
.wheel-hub { fill: none; stroke: var(--ink); stroke-opacity: .3; }
.wheel-hub-t { font: italic 12px var(--serif); fill: var(--ink); }
.wheel-hub-g { font: 8px var(--sans); fill: var(--muted); }
.spoke { cursor: pointer; outline: none; }
.spoke-line { stroke: var(--ink); stroke-opacity: .3; transition: stroke var(--ease), stroke-width var(--ease); }
.spoke-hit { stroke: transparent; stroke-width: 14; }
.spoke-label { font: 10.5px var(--sans); fill: var(--ink); }
.spoke.is-selected .spoke-line { stroke: var(--accent); stroke-opacity: 1; stroke-width: 3; }
.spoke.is-selected .spoke-label { fill: var(--accent); font-weight: 600; }
.spoke:focus-visible .spoke-line { stroke: var(--accent); stroke-width: 3; stroke-dasharray: 3 3; }
.wheel-name { margin: 2px 0 8px; font-size: 22px; font-weight: 500; }
.eyebrow-inline { font: 600 10px var(--sans); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.small { font-size: 13px; }
@media (max-width: 480px) { .spoke-label { font-size: 9px; } }
```

- [ ] **Step 7: Run tests and browser check**

Run: `node --test tests/`. Expected: all pass. Then serve and open stage 2: twelve labelled spokes, Discipline selected shows the Sixteen minutes exercise, Tab reaches each spoke, console clean.

- [ ] **Step 8: Commit**

```bash
git add site tests
git commit -m "Lay the twelve points of focus on a spoke wheel"
```

---

### Task 9: The balance for the twelve missteps

**Files:**
- Create: `site/render/balance.js`
- Modify: `site/render/panel.js`, `site/app.css`, `tests/dom.test.mjs`

**Interfaces:**
- Produces: `renderBalance(section, ctx)`. Three pairs drawn as three small two-pan balances in a row (left pan, fulcrum, right pan), plus a list of the six unpaired missteps. Clicking any misstep shows trap and correction in a detail box.

- [ ] **Step 1: Write the test**

Append to `tests/dom.test.mjs`:

```js
const { renderBalance } = await import("../site/render/balance.js");
test("renderBalance shows three pairs, six others, and detail on click", () => {
  const m = (lesson, name) => ({ lesson, name, trap: `${name} trap`, correction: `${name} fix` });
  const b = renderBalance({ type: "balance", id: "missteps", heading: "Missteps", caption: "Return to centre.",
    pairs: [[m("a", "A"), m("b", "B")], [m("c", "C"), m("d", "D")], [m("e", "E"), m("f", "F")]],
    others: ["G", "H", "I", "J", "K", "L"].map((n) => m(n.toLowerCase(), n)) }, ctx);
  assert.equal(b.querySelectorAll("button.pan").length, 6);
  assert.equal(b.querySelectorAll("button.misstep").length, 6);
  b.querySelectorAll("button.pan")[1].dispatch("click");
  assert.match(b.querySelector(".balance-detail").textContent, /B trap/);
  assert.match(b.querySelector(".balance-detail").textContent, /B fix/);
  assert.match(b.textContent, /Return to centre/);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/dom.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement balance.js**

```js
// site/render/balance.js
import { el, svg, heading } from "./dom.js";

export function renderBalance(section, ctx) {
  const detail = el("div", { class: "balance-detail", "aria-live": "polite" }, [el("p", { class: "muted" }, ["Choose a misstep."])]);
  let selected = null;
  const show = (item, btn) => {
    selected?.classList.remove("is-selected");
    selected = btn; btn.classList.add("is-selected");
    detail.replaceChildren(
      el("h4", { class: "wheel-name" }, [item.name]),
      el("p", {}, [el("span", { class: "eyebrow-inline" }, ["The trap "]), item.trap]),
      el("p", {}, [el("span", { class: "eyebrow-inline" }, ["The correction "]), item.correction]),
    );
  };
  const pairs = el("div", { class: "balances" }, section.pairs.map(([l, r]) => {
    const left = el("button", { class: "pan pan-l", type: "button" }, [l.name]);
    const right = el("button", { class: "pan pan-r", type: "button" }, [r.name]);
    left.addEventListener("click", () => show(l, left));
    right.addEventListener("click", () => show(r, right));
    const beam = svg("svg", { viewBox: "0 0 120 40", class: "beam", "aria-hidden": "true" }, [
      svg("line", { x1: 10, y1: 14, x2: 110, y2: 14, class: "beam-line" }),
      svg("path", { d: "M60 14 L52 36 L68 36 Z", class: "fulcrum" }),
      svg("line", { x1: 10, y1: 14, x2: 10, y2: 4, class: "beam-line" }),
      svg("line", { x1: 110, y1: 14, x2: 110, y2: 4, class: "beam-line" }),
    ]);
    return el("div", { class: "balance" }, [el("div", { class: "pans" }, [left, right]), beam]);
  }));
  const others = el("ul", { class: "missteps" }, section.others.map((m) => {
    const b = el("button", { class: "misstep", type: "button" }, [m.name]);
    b.addEventListener("click", () => show(m, b));
    return el("li", {}, [b]);
  }));
  return el("section", { class: "sec sec-balance", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted small" }, [section.caption]),
    pairs,
    el("p", { class: "eyebrow" }, ["And six more"]),
    others,
    detail,
  ]);
}
```

- [ ] **Step 4: Register and style**

In `panel.js` add `balance: renderBalance`. Append to `app.css`:

```css
.balances { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 12px 0; }
@media (max-width: 560px) { .balances { grid-template-columns: 1fr; } }
.balance { text-align: center; }
.pans { display: flex; justify-content: space-between; gap: 6px; }
.pan, .misstep { font: 14px var(--serif); background: none; border: 1px solid var(--rule); border-radius: 999px; padding: 4px 12px; color: var(--ink); cursor: pointer; }
.pan.is-selected, .misstep.is-selected { border-color: var(--accent); color: var(--accent); }
.pan:focus-visible, .misstep:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.beam { width: 100%; height: auto; display: block; }
.beam-line { stroke: var(--ink); stroke-opacity: .5; }
.fulcrum { fill: var(--ink); fill-opacity: .5; }
.missteps { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.balance-detail { border-top: 1px solid var(--rule); padding-top: 10px; }
```

- [ ] **Step 5: Run tests, browser check stage 2 missteps, commit**

```bash
node --test tests/
git add site tests
git commit -m "Weigh the twelve missteps on a balance, three pairs and six more"
```

---

### Task 10: Tabs, mountains and flip cards (stages 3 and 4)

**Files:**
- Create: `site/render/tabs.js`, `site/render/mountains.js`, `site/render/cards.js`, `site/emblems.js`
- Modify: `site/render/panel.js`, `site/app.css`, `tests/dom.test.mjs`

**Interfaces:**
- Produces: `renderTabs(section, ctx)` (buttons with `role="tab"`, panels with `role="tabpanel"`, arrow keys move between tabs), `renderMountains(section, ctx)`, `renderCards(section, ctx)` (each card a `<button aria-pressed>` that toggles `.is-flipped`). `emblems.js` exports `EMBLEMS = { teacup, fist, hand, mountain, enso }` and `MOUNTAINS = [path, path, path]` as SVG path `d` strings drawn in a 200×200 box.

- [ ] **Step 1: Write the tests**

Append to `tests/dom.test.mjs`:

```js
const { renderTabs } = await import("../site/render/tabs.js");
const { renderCards } = await import("../site/render/cards.js");
const { renderMountains } = await import("../site/render/mountains.js");

test("renderTabs exposes tabs, shows one panel, and switches on click", () => {
  const tab = (id, n) => ({ id, label: id, intro: "x", section: { type: "table", id, heading: id, columns: ["L", "C"], rows: Array.from({ length: n }, (_, i) => ({ cells: [`${id}${i}`, "c"] })) } });
  const t = renderTabs({ type: "tabs", id: "hhh", heading: "HHH", tabs: [tab("head", 2), tab("hand", 1), tab("heart", 1)] }, ctx);
  const tabs = t.querySelectorAll("button[role=\"tab\"]");
  assert.equal(tabs.length, 3);
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  const panels = t.querySelectorAll("div[role=\"tabpanel\"]");
  assert.equal(panels.filter((p) => !p.hidden).length, 1);
  tabs[1].dispatch("click");
  assert.equal(tabs[1].getAttribute("aria-selected"), "true");
  assert.ok(panels[0].hidden && !panels[1].hidden);
});

test("renderCards flips on click and reports aria-pressed", () => {
  const c = renderCards({ type: "cards", id: "dualities", heading: "Six", items: [{ lesson: "silence", front: "Sound and silence", back: "Every silence equals every sound." }] }, ctx);
  const card = c.querySelector("button.card");
  assert.equal(card.getAttribute("aria-pressed"), "false");
  card.dispatch("click");
  assert.equal(card.getAttribute("aria-pressed"), "true");
  assert.ok(card.classList.contains("is-flipped"));
  assert.match(c.textContent, /Every silence/);
});

test("renderMountains draws three captioned figures", () => {
  const m = renderMountains({ type: "mountains", id: "mountains", heading: "Mountain", items: [1, 2, 3].map((i) => ({ caption: `M${i}`, text: `T${i}` })) }, ctx);
  assert.equal(m.querySelectorAll("figure").length, 3);
  assert.match(m.textContent, /M3/);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/dom.test.mjs`. Expected: FAIL, modules not found.

- [ ] **Step 3: Write emblems.js**

Hand-drawn single-stroke paths in a 200×200 box. They are deliberately loose; the CSS renders them at low opacity with a thick round-capped stroke so they read as ink wash.

```js
// site/emblems.js
export const EMBLEMS = {
  teacup: "M40 90 h120 q0 60 -60 70 q-60 -10 -60 -70 z M160 100 q30 0 30 25 q0 25 -30 22 M60 70 q10 -20 0 -35 M100 70 q10 -20 0 -35 M140 70 q10 -20 0 -35 M50 88 q30 -30 100 0",
  fist:   "M60 120 q-15 -40 10 -60 q20 -10 30 5 q10 -25 30 -10 q15 5 10 30 q20 -10 25 10 q5 15 -5 30 q10 5 5 25 q-10 40 -60 40 q-50 0 -55 -50 z M70 90 q30 0 40 20",
  hand:   "M70 170 q-30 -40 -20 -90 q5 -15 15 -5 v50 M80 120 v-80 q0 -15 12 -15 q12 0 12 15 v75 M104 115 v-90 q0 -15 12 -15 q12 0 12 15 v90 M128 120 v-70 q0 -12 10 -12 q10 0 10 12 v80 q0 60 -50 60 q-30 0 -45 -25",
  mountain: "M10 160 q40 -60 70 -90 q20 -20 40 10 q20 30 70 80 M60 110 q25 10 50 -5 M20 60 q30 -10 60 5 q30 15 60 -5",
  enso:   "M150 60 q-40 -40 -90 -5 q-45 40 -10 95 q40 45 90 10 q40 -35 15 -85",
};

export const MOUNTAINS = [
  "M10 150 q50 -90 90 -100 q40 10 90 100",
  "M10 150 q30 -40 50 -60 q20 -30 40 -10 q10 -30 40 -30 q20 10 50 100 M40 110 q30 10 60 -20 q30 -20 70 0",
  "M10 150 q50 -90 90 -100 q40 10 90 100 M30 130 q60 -20 140 0",
];
```

- [ ] **Step 4: Implement tabs.js, mountains.js, cards.js**

```js
// site/render/tabs.js
import { el, heading } from "./dom.js";
import { renderTable } from "./table.js";

export function renderTabs(section, ctx) {
  const tabs = [], panels = [];
  const select = (i) => {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.setAttribute("tabindex", k === i ? "0" : "-1"); });
    panels.forEach((p, k) => { p.hidden = k !== i; });
  };
  section.tabs.forEach((t, i) => {
    const tab = el("button", { type: "button", role: "tab", id: `tab-${t.id}`, "aria-controls": `panel-${t.id}`, "aria-selected": "false", tabindex: "-1" }, [t.label]);
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (e) => {
      const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : null;
      if (n !== null) { e.preventDefault(); select(n); tabs[n].focus(); }
    });
    const panel = el("div", { role: "tabpanel", id: `panel-${t.id}`, "aria-labelledby": `tab-${t.id}` }, [
      el("p", { class: "muted small" }, [t.intro]),
      renderTable(t.section, ctx),
    ]);
    tabs.push(tab); panels.push(panel);
  });
  select(0);
  return el("section", { class: "sec sec-tabs", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("div", { role: "tablist", class: "tablist", "aria-label": section.heading }, tabs),
    ...panels,
  ]);
}
```

```js
// site/render/mountains.js
import { el, svg, heading } from "./dom.js";
import { MOUNTAINS } from "../emblems.js";

export function renderMountains(section) {
  const figs = section.items.map((it, i) => el("figure", { class: "mountain" }, [
    svg("svg", { viewBox: "0 0 200 160", class: "mountain-svg", "aria-hidden": "true" }, [svg("path", { d: MOUNTAINS[i % MOUNTAINS.length], class: "brush" })]),
    el("figcaption", {}, [el("strong", {}, [it.caption]), el("br"), it.text]),
  ]));
  return el("section", { class: "sec sec-mountains", "aria-labelledby": `sec-${section.id}` }, [heading(section), el("div", { class: "mountains" }, figs)]);
}
```

```js
// site/render/cards.js
import { el, heading } from "./dom.js";

export function renderCards(section) {
  const cards = section.items.map((it) => {
    const b = el("button", { type: "button", class: "card", "aria-pressed": "false", "data-lesson": it.lesson ?? null }, [
      el("span", { class: "card-front" }, [it.front]),
      el("span", { class: "card-back" }, [it.back]),
    ]);
    b.addEventListener("click", () => {
      const on = b.classList.toggle("is-flipped");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    return b;
  });
  return el("section", { class: "sec sec-cards", "aria-labelledby": `sec-${section.id}` }, [
    heading(section), el("p", { class: "muted small" }, ["Turn a card. Each pair is two that are one."]), el("div", { class: "cards" }, cards)]);
}
```

- [ ] **Step 5: Register, style, and show the stage emblem**

In `panel.js` register `tabs`, `mountains`, `cards`. Also make `renderStage` draw the emblem: import `EMBLEMS` and `svg`, and add as the first child of the article:

```js
stage.emblem && EMBLEMS[stage.emblem]
  ? svg("svg", { viewBox: "0 0 200 200", class: "emblem", "aria-hidden": "true" }, [svg("path", { d: EMBLEMS[stage.emblem], class: "brush" })])
  : null,
```

Append to `app.css`:

```css
.brush { fill: none; stroke: var(--ink); stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; }
.emblem { position: absolute; right: -10px; top: -10px; width: 180px; height: 180px; opacity: .07; pointer-events: none; }
.tablist { display: flex; gap: 6px; border-bottom: 1px solid var(--rule); margin-bottom: 10px; }
.tablist [role="tab"] { font: 600 13px var(--sans); letter-spacing: .06em; background: none; border: 0; border-bottom: 2px solid transparent; padding: 8px 10px; color: var(--muted); cursor: pointer; }
.tablist [role="tab"][aria-selected="true"] { color: var(--accent); border-bottom-color: var(--accent); }
.tablist [role="tab"]:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.mountains { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 560px) { .mountains { grid-template-columns: 1fr; } }
.mountain { margin: 0; text-align: center; font-size: 14px; }
.mountain-svg { width: 100%; height: auto; opacity: .8; }
.mountain-svg .brush { stroke-width: 5; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.card { position: relative; min-height: 140px; perspective: 800px; background: none; border: 0; padding: 0; text-align: left; cursor: pointer; font: inherit; color: inherit; }
.card-front, .card-back { position: absolute; inset: 0; display: grid; place-items: center; padding: 14px; border: 1px solid var(--rule); border-radius: 8px; backface-visibility: hidden; transition: transform var(--ease); background: var(--paper); }
.card-front { font-size: 18px; font-weight: 500; text-align: center; }
.card-back { transform: rotateY(180deg); font-size: 14px; }
.card.is-flipped .card-front { transform: rotateY(180deg); }
.card.is-flipped .card-back { transform: rotateY(360deg); }
.card:focus-visible .card-front, .card:focus-visible .card-back { border-color: var(--accent); }
```

- [ ] **Step 6: Run tests, browser check stages 3 and 4, commit**

```bash
node --test tests/
git add site tests
git commit -m "Give the black belt its tabs and the barrier its mountains and cards"
```

---

### Task 11: Maxims with trace-back, the Glossary and Practice views

**Files:**
- Create: `site/render/maxims.js`, `site/render/glossary.js`, `site/render/practice.js`
- Modify: `site/render/panel.js`, `site/app.js` (register `VIEWS`), `site/app.css`, `tests/dom.test.mjs`

**Interfaces:**
- Produces: `renderMaxims(section, ctx)` reads `ctx.maxims` and `ctx.lessons`; on `mouseenter`/`focus` of a maxim with a lesson it calls `ctx.highlightStage(lessons[l].stage)` and writes the lesson label into a `.trace` line; on `mouseleave`/`blur` calls `ctx.highlightStage(null)`. `renderGlossary(ctx)` and `renderPractice(ctx)` return whole-view elements. `ctx` gains `maxims`, `glossary`, `exercises`.

- [ ] **Step 1: Write the tests**

Append to `tests/dom.test.mjs`:

```js
const { renderMaxims } = await import("../site/render/maxims.js");
const { renderGlossary } = await import("../site/render/glossary.js");
const { renderPractice } = await import("../site/render/practice.js");

test("maxims trace back to their stage on focus and clear on blur", () => {
  const calls = [];
  const c = { ...ctx, lessons: { speed: { stage: 2, section: "missteps", label: "Speed" } }, maxims: [{ text: "Be quick, not hasty.", lesson: "speed" }, { text: "Keep going." }], highlightStage: (n) => calls.push(n) };
  const m = renderMaxims({ type: "maxims", id: "maxims", heading: "The Way" }, c);
  const items = m.querySelectorAll("li.maxim");
  assert.equal(items.length, 2);
  items[0].dispatch("focus");
  assert.deepEqual(calls, [2]);
  assert.match(m.querySelector(".trace").textContent, /Speed/);
  items[0].dispatch("blur");
  assert.deepEqual(calls, [2, null]);
  assert.equal(items[1].getAttribute("tabindex"), null, "untraceable maxims are not focusable");
});

test("glossary filters as you type", () => {
  const c = { ...ctx, glossary: [{ term: "Chudan", literal: "Middle ground", usage: "Centre of balance." }, { term: "Mu", literal: "No-thing", usage: "The void." }] };
  const g = renderGlossary(c);
  const input = g.querySelector("input");
  input.value = "void"; input.dispatch("input");
  const rows = g.querySelectorAll("tr[data-term]");
  assert.equal(rows.filter((r) => !r.hidden).length, 1);
});

test("practice groups exercises by belt in order", () => {
  const c = { ...ctx, lessons: { play: { stage: 1, section: "steps", label: "Play" } }, exercises: [
    { belt: "black", name: "Frame one note", text: "…", lessons: ["play"] },
    { belt: "white", name: "One-note practice", text: "…", lessons: ["play"] } ] };
  const p = renderPractice(c);
  const hs = p.querySelectorAll("h3").map((h) => h.textContent);
  assert.deepEqual(hs, ["White belt", "Black belt"]);
  assert.match(p.textContent, /Play/);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/dom.test.mjs`. Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the three modules**

```js
// site/render/maxims.js
import { el, heading } from "./dom.js";

export function renderMaxims(section, ctx) {
  const trace = el("p", { class: "trace", "aria-live": "polite" }, ["Hover or focus a line to trace it back to its stage."]);
  const items = ctx.maxims.map((m) => {
    const lesson = m.lesson ? ctx.lessons[m.lesson] : null;
    const li = el("li", { class: "maxim", tabindex: lesson ? "0" : null, "data-lesson": m.lesson ?? null }, [m.text]);
    if (lesson) {
      const on = () => { ctx.highlightStage(lesson.stage); trace.textContent = `Stage ${lesson.stage}: ${lesson.label}`; };
      const off = () => { ctx.highlightStage(null); };
      li.addEventListener("mouseenter", on); li.addEventListener("focus", on);
      li.addEventListener("mouseleave", off); li.addEventListener("blur", off);
    }
    return li;
  });
  return el("section", { class: "sec sec-maxims", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted small" }, ["The last chapter is a list of one-line maxims with no commentary. Each line is meant to be recognised, not learned."]),
    el("ul", { class: "maxims" }, items),
    trace,
  ]);
}
```

```js
// site/render/glossary.js
import { el, kanji } from "./dom.js";

export function renderGlossary(ctx) {
  const rows = ctx.glossary.map((g) => el("tr", { "data-term": g.term.toLowerCase() }, [
    el("th", { scope: "row" }, [g.term, kanji(g.kanji)]), el("td", {}, [g.literal]), el("td", {}, [g.usage])]));
  const input = el("input", { type: "search", class: "filter", placeholder: "Filter terms", "aria-label": "Filter glossary" });
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    rows.forEach((r) => { r.hidden = q !== "" && !r.textContent.toLowerCase().includes(q); });
  });
  return el("article", { class: "view-inner" }, [
    el("h2", { class: "stage-title" }, ["Glossary"]),
    el("p", { class: "stage-sub" }, ["The Japanese and Chinese terms the book leans on."]),
    input,
    el("table", { class: "tbl" }, [
      el("thead", {}, [el("tr", {}, ["Term", "Literal meaning", "How the book uses it"].map((h) => el("th", { scope: "col" }, [h])))]),
      el("tbody", {}, rows)]),
  ]);
}
```

```js
// site/render/practice.js
import { el } from "./dom.js";

const BELTS = [["white", "White belt"], ["practice", "Practice stage"], ["black", "Black belt"], ["barrier", "Barrier"]];

export function renderPractice(ctx) {
  const groups = BELTS.map(([belt, label]) => {
    const items = ctx.exercises.filter((e) => e.belt === belt);
    if (!items.length) return null;
    return el("section", { class: "sec" }, [
      el("h3", { class: "sec-h" }, [label]),
      el("ul", { class: "practice" }, items.map((e) => el("li", {}, [
        el("strong", {}, [e.name]), ": ", e.text, " ",
        el("span", { class: "trains-tag" }, [e.lessons.map((l) => ctx.lessons[l]?.label ?? l).join(", ")]),
      ]))),
    ]);
  }).filter(Boolean);
  return el("article", { class: "view-inner" }, [
    el("h2", { class: "stage-title" }, ["Practice"]),
    el("p", { class: "stage-sub" }, ["The book gives almost no explicit exercises, but many of its images convert directly into practice. A rotating menu, not a checklist."]),
    ...groups,
  ]);
}
```

- [ ] **Step 4: Register and wire the views**

In `panel.js` register `maxims: renderMaxims`. In `app.js`: import `glossary, maxims` from content and `renderGlossary`, `renderPractice`; add `maxims, glossary, exercises` to `ctx`; set `const VIEWS = { glossary: renderGlossary, practice: renderPractice };`.

Append to `app.css`:

```css
.maxims { list-style: none; padding: 0; }
.maxim { padding: 6px 0; border-top: 1px solid var(--rule); font-size: 18px; }
.maxim[tabindex] { cursor: default; }
.maxim[tabindex]:hover, .maxim[tabindex]:focus-visible { color: var(--accent); outline: none; }
.trace { font: 13px var(--sans); color: var(--muted); min-height: 1.4em; }
.filter { font: 15px var(--serif); padding: 8px 12px; border: 1px solid var(--rule); border-radius: 6px; background: var(--paper); color: var(--ink); width: 100%; max-width: 320px; margin: 0 0 14px; }
.practice { padding-left: 1.1em; } .practice li { margin: 8px 0; }
.trains-tag { font: 12px var(--sans); color: var(--accent); }
```

- [ ] **Step 5: Run tests, browser check stage 5 and both views, commit**

Check that hovering "Be quick, not hasty" lights marker 2 on the ring, that the Glossary filter narrows rows, and that the top-bar link shows `aria-current`.

```bash
node --test tests/
git add site tests
git commit -m "Trace the maxims back to the ring, and add the Glossary and Practice views"
```

---

### Task 12: Match the image to the lesson

**Files:**
- Create: `site/render/match.js`
- Modify: `site/render/panel.js`, `site/app.css`, `tests/dom.test.mjs`

**Interfaces:**
- Produces: `renderMatch(section, ctx)`. Left column: the ten images as buttons in book order. Right column: the ten lesson labels (from `ctx.lessons[item.lesson].label`) as buttons, shuffled with `ctx.shuffle` (defaults to Fisher–Yates on `Math.random`; tests pass identity). Click an image, then a lesson. Correct: both buttons get `.is-matched`, `disabled`, and a vermilion tick. Wrong: the lesson button gets `.is-wrong` for 400 ms and the selection clears. A footer line reads "n of 10 matched" and, at 10, "All ten. Now go play."

- [ ] **Step 1: Write the test**

Append to `tests/dom.test.mjs`:

```js
const { renderMatch } = await import("../site/render/match.js");
test("match locks correct pairs and clears wrong ones", () => {
  const c = { ...ctx, lessons: { a: { stage: 1, section: "s", label: "Alpha" }, b: { stage: 2, section: "s", label: "Beta" } }, shuffle: (x) => x };
  const m = renderMatch({ type: "match", id: "match", heading: "Match", items: [{ image: "Teacup", lesson: "a" }, { image: "Bulb", lesson: "b" }] }, c);
  const imgs = m.querySelectorAll("button.match-img"), les = m.querySelectorAll("button.match-lesson");
  imgs[0].dispatch("click"); les[1].dispatch("click");           // wrong
  assert.ok(les[1].classList.contains("is-wrong"));
  assert.ok(!imgs[0].classList.contains("is-selected"));
  imgs[0].dispatch("click"); les[0].dispatch("click");           // right
  assert.ok(imgs[0].classList.contains("is-matched") && les[0].classList.contains("is-matched"));
  assert.equal(imgs[0].getAttribute("disabled"), "");
  assert.match(m.querySelector(".match-status").textContent, /1 of 2/);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/dom.test.mjs`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement match.js**

```js
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
  const status = el("p", { class: "match-status", "aria-live": "polite" }, [`0 of ${total} matched`]);
  const imgButtons = section.items.map((it) => el("button", { type: "button", class: "match-img", "data-lesson": it.lesson }, [it.image]));
  const lessonButtons = shuffle(section.items).map((it) => el("button", { type: "button", class: "match-lesson", "data-lesson": it.lesson }, [ctx.lessons[it.lesson]?.label ?? it.lesson]));

  imgButtons.forEach((b) => b.addEventListener("click", () => {
    imgButtons.forEach((o) => o.classList.remove("is-selected"));
    picked = b; b.classList.add("is-selected");
  }));
  lessonButtons.forEach((b) => b.addEventListener("click", () => {
    if (!picked) { status.textContent = "Choose an image first."; return; }
    if (b.getAttribute("data-lesson") === picked.getAttribute("data-lesson")) {
      for (const x of [picked, b]) { x.classList.add("is-matched"); x.classList.remove("is-selected"); x.setAttribute("disabled", ""); }
      matched++;
      status.textContent = matched === total ? `All ${total}. Now go play.` : `${matched} of ${total} matched`;
    } else {
      b.classList.add("is-wrong");
      setTimeout(() => b.classList.remove("is-wrong"), 400);
      picked.classList.remove("is-selected");
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
```

- [ ] **Step 4: Register and style**

In `panel.js` register `match: renderMatch`. Append to `app.css`:

```css
.match { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
@media (max-width: 560px) { .match { grid-template-columns: 1fr; } }
.match-col { display: flex; flex-direction: column; gap: 6px; }
.match-img, .match-lesson { font: 15px var(--serif); text-align: left; background: none; border: 1px solid var(--rule); border-radius: 6px; padding: 8px 10px; color: var(--ink); cursor: pointer; transition: border-color var(--ease); }
.match-img.is-selected { border-color: var(--accent); color: var(--accent); }
.is-matched { border-color: var(--accent); opacity: .55; }
.is-matched::after { content: " ✓"; color: var(--accent); }
.is-wrong { animation: shake 400ms; border-color: var(--accent); }
@keyframes shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.match-status { font: 13px var(--sans); color: var(--muted); }
.match-img:focus-visible, .match-lesson:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 5: Run tests, browser check stage 5, commit**

```bash
node --test tests/
git add site tests
git commit -m "Match the book's images to their lessons"
```

---

### Task 13: Fonts, paper grain, dark mode pass and reduced-motion verification

**Files:**
- Create: `site/assets/fonts/*.woff2`, `site/assets/fonts/OFL-Source-Serif-4.txt`, `site/assets/fonts/OFL-Source-Sans-3.txt`, `scripts/fetch-fonts.sh`
- Modify: `site/app.css`, `tests/smoke.test.mjs`

- [ ] **Step 1: Extend the smoke test to pin the font files and licences**

Append to `tests/smoke.test.mjs`:

```js
import { access } from "node:fs/promises";
test("self-hosted fonts ship with their OFL text", async () => {
  const dir = new URL("../site/assets/fonts/", import.meta.url);
  for (const f of ["source-serif-4-latin-400-normal.woff2", "source-serif-4-latin-400-italic.woff2", "source-serif-4-latin-500-normal.woff2", "source-sans-3-latin-400-normal.woff2", "source-sans-3-latin-600-normal.woff2", "OFL-Source-Serif-4.txt", "OFL-Source-Sans-3.txt"]) {
    await access(new URL(f, dir));
  }
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  assert.match(css, /@font-face/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/, "no runtime font CDN");
});
```

- [ ] **Step 2: Run to see it fail**

Run: `node --test tests/smoke.test.mjs`. Expected: FAIL, ENOENT.

- [ ] **Step 3: Write and run the fetch script (one-time, at development time)**

```bash
#!/usr/bin/env bash
# scripts/fetch-fonts.sh: pulls the OFL-licensed Source fonts from the
# @fontsource npm packages via jsDelivr, once, into site/assets/fonts.
set -euo pipefail
cd "$(dirname "$0")/../site/assets/fonts"
base=https://cdn.jsdelivr.net/npm
get() { curl -fsSL -o "$2" "$1"; echo "fetched $2"; }
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-400-normal.woff2 source-serif-4-latin-400-normal.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-400-italic.woff2 source-serif-4-latin-400-italic.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-500-normal.woff2 source-serif-4-latin-500-normal.woff2
get $base/@fontsource/source-sans-3@5/files/source-sans-3-latin-400-normal.woff2  source-sans-3-latin-400-normal.woff2
get $base/@fontsource/source-sans-3@5/files/source-sans-3-latin-600-normal.woff2  source-sans-3-latin-600-normal.woff2
get $base/@fontsource/source-serif-4@5/LICENSE OFL-Source-Serif-4.txt
get $base/@fontsource/source-sans-3@5/LICENSE  OFL-Source-Sans-3.txt
```

Run: `mkdir -p site/assets/fonts && bash scripts/fetch-fonts.sh`. Confirm each OFL file begins with the SIL Open Font License text; if a LICENSE download is not the OFL, fetch the licence from the font's GitHub repo (adobe-fonts/source-serif and adobe-fonts/source-sans) instead.

- [ ] **Step 4: Add @font-face rules and paper grain at the top of app.css**

```css
@font-face { font-family: "Source Serif 4"; font-style: normal; font-weight: 400; font-display: swap; src: url("./assets/fonts/source-serif-4-latin-400-normal.woff2") format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-style: italic; font-weight: 400; font-display: swap; src: url("./assets/fonts/source-serif-4-latin-400-italic.woff2") format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-style: normal; font-weight: 500; font-display: swap; src: url("./assets/fonts/source-serif-4-latin-500-normal.woff2") format("woff2"); }
@font-face { font-family: "Source Sans 3"; font-style: normal; font-weight: 400; font-display: swap; src: url("./assets/fonts/source-sans-3-latin-400-normal.woff2") format("woff2"); }
@font-face { font-family: "Source Sans 3"; font-style: normal; font-weight: 600; font-display: swap; src: url("./assets/fonts/source-sans-3-latin-600-normal.woff2") format("woff2"); }

body::before {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1; opacity: .35;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .06 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 5: Dark mode and reduced motion check in the browser**

Serve the site. In the built-in browser, set the colour scheme to dark and confirm: paper and ink swap, the accent stays, the ring gradient still reads white-to-black (it uses fixed colours by design), the emblem is visible at low opacity, cards flip with a dark face. Then emulate `prefers-reduced-motion: reduce` (in DevTools rendering options, or by temporarily forcing `--ease: 0ms` in the console) and confirm stage changes are instant and no koan line appears. Restore the settings.

- [ ] **Step 6: Run tests and commit**

```bash
node --test tests/
git add site scripts tests
git commit -m "Self-host the Source fonts, add paper grain, and check dark and reduced-motion modes"
```

---

### Task 14: Phone layout, README, and the live demo

**Files:**
- Modify: `site/app.css`, `README.md`

- [ ] **Step 1: Phone check at 375 px**

Serve the site, emulate a 375 px wide viewport, and walk every stage plus both views. Fix anything on this list in `app.css`:
- horizontal scroll (check `document.documentElement.scrollWidth <= 375` in the console);
- the ring badge overlapping the top bar;
- spoke labels colliding (at ≤ 480 px replace `.spoke-label` text with the index number and show the name only in the detail box: in `wheel.js`, add `svg("text", { …, class: "spoke-index" }, [String(i + 1)])` beside the label and let CSS show one or the other);
- tables that overflow: add `.tbl { display: block; overflow-x: auto; }` under the 480 px query only if needed.

- [ ] **Step 2: Keyboard walk**

With the mouse untouched: Tab from the top bar through markers, spokes, pans, tabs, cards, maxims, match buttons, and the glossary filter. Every stop must show a focus ring and Enter/Space must activate it. Fix any element that is skipped.

- [ ] **Step 3: Optional hero image slot**

If `site/assets/hero.webp` exists (generated from `docs/risograph-prompt.md`, under 200 KB, 4:5), add to `renderLanding()` in `app.js` after the hint paragraph:

```js
el("img", { class: "hero", src: "./assets/hero.webp", alt: "A guitarist alone in an empty room, printed in two inks", width: "320", height: "400", loading: "lazy" }),
```

and to `app.css`:

```css
.hero { display: none; width: 220px; height: auto; margin-top: 24px; border: 1px solid var(--rule); }
@media (min-width: 820px) { .landing .hero { display: block; } }
```

Wrap the `img` in `if (heroExists)` where `heroExists` is a top-of-file constant set to `true` only after the file has been added and committed; a missing file must never produce a broken image or a console error.

- [ ] **Step 3b: Update README**

Replace the demo line and the "What's here" section:

```markdown
**Live demo:** https://brucehoppe.github.io/zen-guitar/

...

## What's here

- `site/` — the static site: `index.html`, `app.css`, `app.js`, pure modules `router.js` and `ring.js`, the content files under `content/`, and one renderer per section type under `render/`
- `tests/` — Node's built-in test runner; covers routing, ring geometry, wheel geometry, every renderer's structure and roles, and the content's integrity (counts and lesson cross-references)
- `zen_guitar/Zen-Guitar-Study-Guide.md` — the study guide the site is built from
- `docs/superpowers/` — the design spec and the implementation plan
```

- [ ] **Step 4: Enable Pages and confirm the deploy**

```bash
gh api -X POST repos/brucehoppe/zen-guitar/pages -f build_type=workflow 2>/dev/null || gh api -X PUT repos/brucehoppe/zen-guitar/pages -f build_type=workflow
git add site README.md
git commit -m "Fit the belt to a phone and publish the live demo"
git push
gh run watch --exit-status
```

Then open `https://brucehoppe.github.io/zen-guitar/` in the built-in browser and confirm the ring renders, → walks the stages, and the console is clean.

---

## Self-review

**Spec coverage.** Landing and copy (T7), ring and rotation (T3, T7), hash routing with `?again` (T2, T7), five stages with every listed section type (T4, T5, T6, T8, T9, T10, T11, T12), recall and reflection (T6), Glossary and Practice (T11), trace-back (T11), palette and tokens (T1), fonts (T13), motion and reduced motion (T1, T7, T13), layout breakpoints (T1, T14), accessibility roles (every renderer's test), content model and split (T4, T5), fallback renderer (T7), Node tests and Pages workflow with tests gating deploy (T1), README demo link first (T14), author credit (T1, T7). Addendum: match game (T12), emblems (T10), koan interludes (T7), content split (T4, T5).

**Type consistency.** `ctx` fields: `lessons`, `highlightStage`, `exercisesFor` (T6), plus `maxims`, `glossary`, `exercises` (T11) and optional `shuffle` (T12). `Route` shape is identical in T2 and T7. Renderer signature `(section, ctx)` everywhere; view signature `(ctx)`. Lesson ids in T4's `lessons.js` are the ones T5's match items and T11's tests use.

**Review Focus tests.** 1 pinned in T2's garbage-hash test. 2 pinned by role/tabindex assertions in T7–T12 and the keyboard walk in T14. 3 pinned in T13 step 5. 4 pinned in T14 step 1. 5 pinned in T5's integrity test.
