# Zen Guitar journey

![Rats of Chaos present: Music Through the Noise. A two-ink poster: a guitar and a teacup on a quiet porch facing pine, mountains and a red sun on the left; a city, traffic and stacked amplifiers on the right. Practice, listen, tune, play, repeat.](docs/images/rats-of-chaos-poster.jpg)


**Live demo:** https://brucehoppe.github.io/zen-guitar/ (coming once the site is built)

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

## What's here

- `zen_guitar/Zen-Guitar-Study-Guide.md` — the study guide the site is built from
- `docs/superpowers/specs/` — the design spec for the site
- `site/` — the static site (in progress)

## Running locally

The site is static files with no build step. Once `site/` exists:

```bash
python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000/.

## Tests

```bash
node --test tests/
```

## Licence

Code is released under the MIT licence (see `LICENSE`). The study guide text is
my own summary and is shared for personal study; the underlying ideas and any
quoted phrases belong to Philip Toshio Sudo.
