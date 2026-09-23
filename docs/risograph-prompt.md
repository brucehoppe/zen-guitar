# Risograph image prompt

Use with any image model. Generate at 3:4 or 4:5, then export as WebP under
200 KB to `site/assets/hero.webp`. Two variants are given; the first is the
intended one.

## Prompt A: the empty room

> Risograph print, two-colour, on warm off-white uncoated paper. A single
> figure seated on the floor of an otherwise empty tatami room, seen from
> behind and slightly above, holding an acoustic guitar but not playing it,
> head bowed toward the strings. A sliding shoji screen on the far wall is
> half open onto plain grey light. Ink 1: deep near-black indigo for the
> figure, guitar and shadows, printed with visible grain and a slight
> misregistration. Ink 2: vermilion red, used only once, for a small round
> seal-like mark on the wall and a faint halftone wash on the floor. Flat
> shapes, no outlines, coarse halftone dots visible in the mid-tones, ink
> texture uneven at the edges as if hand-fed through a duplicator. Large
> areas of untouched paper. No text, no lettering, no logos. Quiet,
> solitary, still. Composition leaves the upper third almost empty.

Negative prompt, where supported:

> text, letters, watermark, signature, multiple people, faces, stage lights,
> audience, amplifier, gradients, glossy, 3D render, photograph, neon.

## Prompt B: one note

> Risograph print, two inks on cream paper. Extreme close-up of a left hand
> fretting a single note on a guitar neck, cropped so only the hand, four
> frets and two strings are visible, filling the lower half of the frame.
> The upper half is empty paper with one small vermilion enso circle drawn
> in a single loose brush stroke. Ink 1: dark indigo, grainy halftone,
> slightly out of register. Ink 2: vermilion, only for the enso. Flat
> shapes, coarse dot screen, paper texture showing through. No text, no
> logos. Calm, austere, patient.

## Notes for use

- Ask for the paper colour close to `#f6f1e7` and the red close to `#c0392b`
  so the image matches the site's tokens.
- Prefer the result with the most empty paper. Solitude is the brief.
- Crop to 4:5 before export; the slot on the landing page is portrait.
- Run it through `cwebp -q 78` (or any WebP exporter) and check the size.
