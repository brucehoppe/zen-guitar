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
  for (const f of ["source-serif-4-latin-400-normal.woff2", "source-serif-4-latin-400-italic.woff2", "source-serif-4-latin-500-normal.woff2", "source-sans-3-latin-400-normal.woff2", "source-sans-3-latin-600-normal.woff2", "OFL-Source-Serif-4.txt", "OFL-Source-Sans-3.txt"]) {
    await access(new URL(f, dir));
  }
  const css = await readFile(new URL("../site/app.css", import.meta.url), "utf8");
  assert.match(css, /@font-face/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/, "no runtime font CDN");
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
