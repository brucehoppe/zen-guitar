import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

test("index.html references assets relatively and credits the author", async () => {
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /(href|src)="\//, "no root-absolute asset paths");
  assert.match(html, /Philip Toshio Sudo/);
  for (const id of ["top", "ring", "koan", "announce", "panel", "view"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
});

test("self-hosted fonts ship with their OFL text", async () => {
  const dir = new URL("../site/assets/fonts/", import.meta.url);
  for (const f of ["source-serif-4-latin-400-normal.woff2", "source-serif-4-latin-400-italic.woff2", "source-serif-4-latin-500-normal.woff2", "source-serif-4-latin-600-normal.woff2", "source-sans-3-latin-400-normal.woff2", "source-sans-3-latin-600-normal.woff2", "OFL-Source-Serif-4.txt", "OFL-Source-Sans-3.txt"]) {
    await access(new URL(f, dir));
  }
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  assert.match(css, /@font-face/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/, "no runtime font CDN");
});

test("the OFL licences are Adobe's upstream text, not the generic @fontsource stand-in", async () => {
  const dir = new URL("../site/assets/fonts/", import.meta.url);
  for (const f of ["OFL-Source-Serif-4.txt", "OFL-Source-Sans-3.txt"]) {
    const text = await readFile(new URL(f, dir), "utf8");
    assert.match(text, /Adobe/, `${f} should credit Adobe`);
    assert.match(text, /Reserved Font Name/, `${f} should carry the Reserved Font Name notice`);
  }
});

test("--muted meets 4.5:1 body-text contrast in both colour schemes", async () => {
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  const hex = (s) => [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  const srgbToLinear = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const luminance = ([r, g, b]) => 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  const mix = (ink, paper, inkPct) => ink.map((c, i) => Math.round(c * (inkPct / 100) + paper[i] * (1 - inkPct / 100)));

  const [lightMatch, darkMatch] = [...css.matchAll(/--paper:\s*#([0-9a-f]{6}).*?--ink:\s*#([0-9a-f]{6})/gis)];
  assert.ok(lightMatch && darkMatch, "expected two --paper/--ink pairs (light root, dark override)");

  const lightPaper = hex(lightMatch[1]), lightInk = hex(lightMatch[2]);
  const darkPaper = hex(darkMatch[1]), darkInk = hex(darkMatch[2]);

  const mutedPcts = [...css.matchAll(/--muted:\s*color-mix\(in srgb,\s*var\(--ink\)\s*(\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
  assert.equal(mutedPcts.length, 2, "expected two --muted declarations (light root, dark override)");
  const [lightPct, darkPct] = mutedPcts;

  const lightMuted = mix(lightInk, lightPaper, lightPct);
  const darkMuted = mix(darkInk, darkPaper, darkPct);

  assert.ok(contrast(lightMuted, hex("f6f1e7")) >= 4.5, "light --muted must reach 4.5:1 on #f6f1e7");
  assert.ok(contrast(darkMuted, hex("161513")) >= 4.5, "dark --muted must reach 4.5:1 on #161513");
});

test("app.css zeroes motion under prefers-reduced-motion", async () => {
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  const match = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(match, "missing prefers-reduced-motion block");
  const block = match[1];
  assert.match(block, /--ease:\s*0ms/);
  assert.match(block, /transition-duration:\s*0ms/);
  assert.match(block, /animation-duration:\s*0ms/);
});

test("the landing carries the captioned hero poster with alt text and a relative src, and no stage does", async () => {
  const js = await readFile(new URL("../site/app.js", import.meta.url), "utf8");
  const landing = js.match(/function renderLanding\(\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(landing, "renderLanding not found in app.js");
  const fig = landing[1].match(/el\("figure",\s*\{\s*class:\s*"hero-fig"\s*\},\s*\[([\s\S]*?)\n\s*\]\)/);
  assert.ok(fig, "renderLanding should build a figure.hero-fig");
  const img = fig[1].match(/el\("img",\s*\{([^}]*class:\s*"hero"[^}]*)\}/);
  assert.ok(img, "the figure should hold an img.hero");
  const cap = fig[1].match(/el\("figcaption",\s*\{\s*\},\s*\["([^"]+)"\]\)/);
  assert.ok(cap && cap[1].trim(), "the figure should carry a non-empty figcaption");
  const attr = (name) => img[1].match(new RegExp(`\\b${name}:\\s*"([^"]*)"`))?.[1];
  assert.ok(attr("alt")?.trim(), "hero needs a non-empty alt");
  assert.equal(attr("loading"), undefined, "the hero is not lazy-loaded");
  assert.match(attr("src") ?? "", /^\.\/[^/]/, "hero src must be relative (./…)");

  // width/height attributes match the JPEG's real pixel size (read from its SOF marker)
  const jpg = await readFile(new URL(`../site/${attr("src").slice(2)}`, import.meta.url));
  assert.ok(jpg.length <= 120 * 1024, `hero.jpg should be at most 120 KB, is ${jpg.length} bytes`);
  let w, h;
  for (let p = 2; p < jpg.length;) {
    const marker = jpg[p + 1], len = jpg.readUInt16BE(p + 2);
    if (marker >= 0xc0 && marker <= 0xc3) { h = jpg.readUInt16BE(p + 5); w = jpg.readUInt16BE(p + 7); break; }
    p += 2 + len;
  }
  assert.equal(attr("width"), String(w), "hero width attribute should match the file");
  assert.equal(attr("height"), String(h), "hero height attribute should match the file");

  const outside = js.replace(landing[0], "");
  assert.doesNotMatch(outside, /class:\s*"hero/, "the hero belongs to the landing only");
});
