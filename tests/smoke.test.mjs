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
