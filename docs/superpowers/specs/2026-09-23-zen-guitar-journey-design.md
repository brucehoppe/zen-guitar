# Zen Guitar Journey: design

Date: 2026-09-23
Status: approved design, awaiting spec review

## Purpose

A public, static web site that walks a visitor around the five stages of
*Zen Guitar* by Philip Toshio Sudo, using the book's own belt metaphor as the
navigation. It is an AI-assisted coding project for the author's personal
GitHub, so it must read cleanly as a portfolio piece and run as a live demo on
GitHub Pages.

The site is a pure tour. It keeps no state between visits. The book's opening
instruction, *empty your cup*, is the stated reason, and it appears on the
landing page.

Source of all book content: `zen_guitar/Zen-Guitar-Study-Guide.md` in this
folder. The site paraphrases the study guide; it does not reproduce the book.

## Decisions made during brainstorming

| Question | Decision |
| --- | --- |
| Audience | Public GitHub project, portfolio-grade |
| Organizing metaphor | The belt circle: white to black to white, five stages on a ring |
| Persistence | None. Every visit starts fresh |
| Stack | Vanilla HTML, CSS, SVG and ES modules. No build step, no dependencies |
| Look | Light "paper" default; dark "ink" only when the system prefers dark |
| Confirmed visuals | Frayed belt ring as centrepiece; twelve-spoke wheel for the points of focus |

## Experience

### Landing

A full-viewport belt ring: a thick SVG annulus that is white at 12 o'clock,
darkens clockwise to black at 6 o'clock, then wears back to white. A subtle
turbulence filter frays the edge. Five stage markers sit on the ring; the
current one is vermilion. The centre lists the four steps in small type (wear
the belt, pick up your guitar, tune, play) with a "Begin" link.

Beside the ring: the title, the subtitle "A visual tour of the book by Philip
Toshio Sudo", one paragraph that explains the belt and ends with *empty your
cup each visit*, and a hint line: click a stage, or press the right arrow.

### Navigation

- Clicking a marker, or pressing the left and right arrow keys, moves between
  stages. The ring rotates so the current stage sits at 12 o'clock and the
  stage panel replaces the landing copy.
- The URL hash carries stage and section (`#/2/missteps`). Every screen is
  deep-linkable and the browser Back button works.
- Moving right from stage 5 returns to stage 1. The landing copy then reads
  "Begin again" and the ring is drawn with a slightly softer, more worn
  gradient. This is the only visual state, and it lives in the URL
  (`#/1?again`), not in storage.
- A small top bar links to the two cross-cutting views, Glossary and
  Practice, and back to the ring.

### Stages and their sections

| Stage | Title | Sections |
| --- | --- | --- |
| 1 | White Belt: Beginner's Mind | Key ideas (table) · The four steps (numbered list) · Terms |
| 2 | White Belt to Black Belt | Twelve points (spoke wheel) · Twelve missteps (balance) · Collaboration rules |
| 3 | Black Belt: Responsibility | Five responsibilities · Head, Hand, Heart (three tabs, each a table) |
| 4 | Black Belt to White Belt | Mountain triptych · Six dualities (flip cards) |
| 5 | White Belt: The Way | Maxims list with "trace it back" |

Each stage panel opens with a short intro paragraph, then its sections, then
the recall questions for that stage as click-to-reveal answers, then the
reflection prompts with no answers.

Section behaviours:

- **Spoke wheel.** Twelve spokes labelled with the points of focus. Clicking a
  spoke highlights it in vermilion and shows that point's core lesson,
  memorable image, and the exercises tagged with it. The hub reads *shugyo*.
- **Balance.** The twelve missteps drawn as a two-pan balance. Opposite pairs
  (self-doubt/ego, halfheartedness/overearnestness, obsession/loss of focus)
  sit on opposite pans; the rest are listed below. Clicking a misstep shows
  the trap and the correction. A caption explains that the correction is a
  return to centre, *chudan*.
- **Tabs.** Head, Hand, Heart each render their table from data.
- **Mountain triptych.** Three brush-stroke mountain SVGs captioned "mountain
  is mountain", "mountain is not mountain", "mountain is mountain again",
  each with the matching sentence about a musician's development.
- **Flip cards.** Six dualities. Front shows the pair, back shows the teaching.
  Flip on click or keyboard focus plus Enter.
- **Maxims with trace-back.** The stage 5 list. Hovering or focusing a maxim
  that has a `lesson` id highlights the source stage marker on the ring and
  names the lesson beneath the ring.

### Cross-cutting views

- **Glossary.** The full glossary table with a filter box that matches term,
  literal meaning or usage as the visitor types.
- **Practice.** Exercises grouped by belt, each tagged with the lesson it
  trains. Read-only; no checkboxes.

### Out of scope

Saved progress, notes, audio, accounts, scored quizzes, analytics, a backend of
any kind, and any control that only makes sense on a local machine.

## Visual design

- **Palette.** Paper `#f6f1e7`, ink `#1b1a17`, vermilion accent `#c0392b`
  reserved for the current marker, selected spoke, and links. Dark mode swaps
  paper and ink and keeps the accent. The belt ring is the only element with a
  grey gradient. Colors are CSS custom properties on `:root`, overridden under
  `prefers-color-scheme: dark`.
- **Type.** Source Serif 4 for body, headings and maxims; Source Sans 3 for
  labels, table headers and the spoke labels. Fonts are self-hosted woff2 files
  with their OFL licence text beside them, following minor-pentatonic-go.
  Japanese terms show their romaji in body type with a small muted kanji beside
  it where the glossary gives one.
- **Motion.** One shared 400 ms ease-in-out for ring rotation and panel
  transitions. Nothing autoplays. Under `prefers-reduced-motion` every
  transition becomes instant.
- **Layout.** Ring on the left, panel on the right from 820 px up. Below that,
  the ring shrinks to a badge above the panel. 16 px side gutters, no
  horizontal scroll at 375 px.
- **Accessibility.** Every interactive SVG element is a `<button>` or carries
  `role="button"` and a label. Focus rings are visible. Colour never carries
  meaning alone; the selected spoke is also bold.

## Content model

`site/content.js` is the single source of book text. It exports:

```js
export const stages = [
  {
    id: 1,
    slug: "white-belt",
    title: "White Belt",
    subtitle: "Beginner's Mind",
    intro: "...",
    sections: [
      { type: "table", id: "ideas", heading: "Key ideas",
        columns: ["Idea", "What it means", "Where it comes from"], rows: [...] },
      { type: "steps", id: "steps", heading: "The four steps", items: [...] },
      ...
    ],
    recall: [{ q: "...", a: "..." }],
    reflection: ["..."],
  },
  ...
];
export const glossary   = [{ term, literal, usage, kanji? }];
export const exercises  = [{ belt, name, text, lesson }];
export const maxims     = [{ text, lesson? }];
export const lessons    = { "discipline": { stage: 2, section: "points", label: "Discipline" }, ... };
```

Section `type` values and their renderers:

| type | renderer | data shape |
| --- | --- | --- |
| `table` | `render/table.js` | `columns`, `rows` |
| `steps` | `render/list.js` | `items` (ordered) |
| `terms` | `render/list.js` | `items` with `term` and `text` |
| `wheel` | `render/wheel.js` | `items` of 12, each `{ lesson, name, core, image }` |
| `balance` | `render/balance.js` | `pairs` and `others`, each `{ lesson, name, trap, correction }` |
| `tabs` | `render/tabs.js` | `tabs` each holding a `table` section |
| `mountains` | `render/mountains.js` | `items` of 3 |
| `cards` | `render/cards.js` | `items` each `{ front, back }` |
| `maxims` | `render/maxims.js` | reads `maxims` export |

Every renderer is a function `(section, ctx) => HTMLElement`. `ctx` carries
the `lessons` map and a `highlightStage(n)` callback so renderers never touch
the ring directly.

## Code structure

```
zen-guitar/
  site/
    index.html
    app.css
    app.js            wires router, ring and renderers
    router.js         parseHash(hash) -> {stage, section, again}; buildHash(state)
    ring.js           markerPositions(n, r), rotationFor(stage), wornStops(again)
    content.js
    render/
      table.js list.js wheel.js balance.js tabs.js mountains.js cards.js maxims.js
      glossary.js practice.js
    assets/fonts/     woff2 + OFL text
  tests/
    router.test.mjs
    ring.test.mjs
    content.test.mjs  every lesson id referenced by exercises and maxims exists
  .github/workflows/pages.yml
  README.md           demo link first, then what it is, then how to run locally
  LICENSE
```

`router.js` and `ring.js` are pure functions with no DOM access. Renderers
build DOM with `document.createElement`; there is no HTML string templating,
which also removes the injection surface even though all content is local.

`index.html` references every asset by relative path so the site works at
`https://<user>.github.io/zen-guitar/` and from `file://`.

## Error handling

The site has almost no failure modes: no network calls after the initial page
load, no user input except a glossary filter and hash navigation.

- An unknown stage or section in the hash falls back to stage 1 and rewrites
  the hash.
- A section `type` with no renderer throws at startup in development
  (`content.test.mjs` catches this) and renders a plain paragraph with the
  section heading in production so a data mistake never blanks the page.
- If fonts fail to load the system serif and sans fallbacks are acceptable.

## Testing

- **Unit:** Node's built-in `node:test` runner for `router.js`, `ring.js`,
  and a content integrity test that walks `content.js` and asserts: five
  stages, twelve wheel items, twelve balance items, six cards, three mountains,
  and that every `lesson` id used anywhere is defined in `lessons`.
- **Browser check:** open `site/index.html` in the built-in browser, walk all
  five stages with the arrow keys, open Glossary and Practice, and confirm the
  console has no errors at desktop and 375 px widths.
- **CI:** the Pages workflow runs `node --test tests/` before it publishes.

## Deployment

`.github/workflows/pages.yml` runs on push to the default branch: checkout,
setup-node, `node --test tests/`, upload `site/` as the Pages artifact,
deploy. The README's first line is the live demo link.

The `zen-guitar/` folder is intended to become its own GitHub repository. The
mono-repo's `.gitignore` will list it once that split happens, following the
existing convention for nested repositories.

## Addendum, 2026-09-23: enrichments agreed before planning

- **Match the image.** Stage 5 gains a section `match` that shows the ten
  images from the study guide's self-test (an overflowing teacup, a light bulb
  replaced after class, and so on). The visitor clicks an image, then clicks a
  lesson from a shuffled list. A correct pair locks in vermilion; a wrong pair
  shakes once and clears. No score is kept, and reloading resets.
- **Stage emblems.** Each stage has a monochrome ink-wash SVG emblem drawn
  faintly behind its panel: 1 a teacup overflowing, 2 a clenched fist (shugyo),
  3 an open hand, 4 a mountain behind cloud, 5 an enso. Emblems live in
  `site/emblems.js` as SVG path strings and never carry text.
- **Koan interludes.** On every stage change the ring's centre shows one line
  for 1.2 s before the new stage's title: 1 "What is the sound of one hand
  clapping?", 2 "Seven times down, eight times up.", 3 "Then wash your bowl.",
  4 "Mountain is mountain.", 5 "Not yet." Under reduced motion the line is
  skipped.
- **Content files.** `site/content.js` becomes `site/content/index.js`
  re-exporting `stages`, `glossary`, `exercises`, `maxims`, `lessons` from
  `site/content/stage1.js` through `stage5.js`, `glossary.js`, `exercises.js`,
  `maxims.js`, `lessons.js`. The exported shapes are unchanged.

## Addendum 2, 2026-09-23: quiet solitude, and a risograph image

**Quiet solitude is a design requirement.** The site should feel like practising
alone in an empty room. Concretely:

- One thing on screen at a time. The panel shows a single stage; sections are
  stacked, never side by side with each other, and nothing competes with the
  ring for attention.
- No counters, badges, progress bars, toasts or "new" markers anywhere. The
  match game's status line is the only running tally, and it lives in the
  section that owns it.
- Generous space: panel line length capped near 65 characters, 28 px between
  sections, the ring surrounded by empty paper.
- Motion is rare and slow. Only the ring rotation, the panel rise and the koan
  fade move; nothing pulses, bounces or loops.
- Copy is spare. Hints are one line. No exclamation marks.
- Sound stays out of scope, and the site never asks for permissions of any kind.

**Risograph hero image.** The landing page may carry one still image beside
the ring at 820 px and up (hidden below), as `site/assets/hero.webp`, at most
200 KB, with `alt` text "A guitarist alone in an empty room, printed in two
inks." The image is generated from the prompt in `docs/risograph-prompt.md`
and the two ink colours must be the site's ink (`#1b1a17` or a dark blue) and
the accent vermilion (`#c0392b`) on paper, so it sits inside the palette
rather than on top of it. If no image is produced, the slot stays empty and
the layout does not change.
