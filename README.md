# Zen Guitar journey

![Rats of Chaos of Gridlock. A two-ink poster: on the left a quiet porch with a guitar, a cushion and a steaming cup of tea, facing pine, mountains and a red sun; on the right the CN Tower, a highway of traffic and stacked amplifiers. Practice, listen, tune, play, repeat.](docs/images/rats-of-chaos-poster.jpg)


**Live demo:** https://brucehoppe.github.io/zen-guitar/

A visual tour of *Zen Guitar* by **Philip Toshio Sudo** (Simon & Schuster, 1997),
built as a belt you walk around: white belt, white to black, black belt, black to
white, and back to white. Each stage opens the book's ideas as diagrams, tables
and cards. The site keeps nothing between visits. In the book's words, you empty
your cup.

## About the book and this project

*Zen Guitar* is Philip Toshio Sudo's book, and every idea on this site is his.
The text here is a study guide in my own words, paraphrased stage by stage. It
is a map, not a substitute: the book is short and worth reading in full. Please
buy it or borrow it from a library.

This is a personal, non-commercial learning project. It is not affiliated with
or endorsed by the author's estate or the publisher.

Fonts: Source Serif 4 and Source Sans 3 by Adobe, latin subsets from @fontsource,
under the SIL Open Font License; licences in `site/assets/fonts/`.

## What's here

- `site/` — the static site: `index.html`, `app.css`, `app.js`, pure modules `router.js` and `ring.js`, the belt ring in `belt.js`, stage emblems in `emblems.js`, the content files under `content/`, one renderer per section type under `render/`, and the poster, icon and self-hosted fonts under `assets/`
- `tests/` — Node's built-in test runner; covers routing, ring and wheel geometry, every renderer's structure and roles, the content's integrity (counts and lesson cross-references), the page's contrast and reduced-motion rules, and the deploy step that versions module URLs
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
node --test tests/
```

## Licence

Code is released under the MIT licence (see `LICENSE`). The study guide text is
my own summary and is shared for personal study; the underlying ideas and any
quoted phrases belong to Philip Toshio Sudo.
