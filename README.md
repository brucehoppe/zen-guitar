# Zen Guitar journey

![Rats of Chaos of Gridlock. A two-ink poster: on the left a quiet porch with a guitar, a cushion and a steaming cup of tea, facing pine, mountains and a red sun; on the right the CN Tower, a highway of traffic and stacked amplifiers. Practice, listen, tune, play, repeat.](docs/images/rats-of-chaos-poster.jpg)


**Live demo:** https://brucehoppe.github.io/zen-guitar/

A visual tour of *Zen Guitar* by **Philip Toshio Sudo** (Simon & Schuster, 1997),
built as a belt you walk around: white belt, white to black, black belt, black to
white, and back to white. Each stage opens the book's ideas as diagrams, tables
and cards. The site keeps nothing between visits. In the book's words, you empty
your cup.

## About the book and this project

*Zen Guitar* is Philip Toshio Sudo's book. The core study guide paraphrases its
teachings stage by stage. Expandable companion notes and the guitar examples
beside the illustrated connections are original commentary for this site. It
is a map, not a substitute: the book is short and worth reading in full. Please
buy it or borrow it from a library.

This is a personal, non-commercial learning project. It is not affiliated with
or endorsed by the author's estate or the publisher.

Fonts: Source Serif 4 and Source Sans 3 by Adobe, latin subsets from @fontsource,
under the SIL Open Font License; licences in `site/assets/fonts/`.

## Quiet solitude

Read at your own pace. Koans remain visible for the whole stage, with a compact
belt ring and named stage links for orientation. Dualities open as simple native
disclosures. Ten original line drawings connect images to their teachings;
there is no matching game. Each main section offers an optional deeper example,
and reflection never requires a response. There is no audio, scoring, timer,
completion system or saved progress. Paper, ink and the risograph poster remain
the visual foundation.

The September 23 design and implementation documents are historical; this
quiet-solitude direction supersedes their timed koans, flip cards and match game.
The old `#/5/match` anchor remains valid for shared links.

## What's here

- `site/` — the static site: `index.html`, `app.css`, `app.js`, pure modules `router.js` and `ring.js`, the belt ring in `belt.js`, stage emblems in `emblems.js`, the content files under `content/`, one renderer per section type under `render/`, and the poster, icon and self-hosted fonts under `assets/`
- `tests/` — Node's built-in test runner; covers routing, ring and wheel geometry, every renderer's structure and roles, the content's integrity (counts and lesson cross-references), the page's contrast and reduced-motion rules, and the deploy step that versions module URLs and the poster
- `zen_guitar/Zen-Guitar-Study-Guide.md` — the study guide the site is built from
- `docs/superpowers/` — the design spec and the implementation plan
- `docs/images/` — the poster shown above
- `scripts/fetch-fonts.sh` — fetches the Source Serif 4 and Source Sans 3 subsets into `site/assets/fonts/`

## Running locally

The site is static files with no build step:

```bash
python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000/.

After pulling changes, hard-reload the page (Cmd+Shift+R) so the browser doesn't mix cached modules.

## Tests

```bash
node --test "tests/*.test.mjs"
```

## Licence

Code is released under the MIT licence (see `LICENSE`). The study guide text is
my own summary and is shared for personal study; the underlying ideas and any
quoted phrases belong to Philip Toshio Sudo.
