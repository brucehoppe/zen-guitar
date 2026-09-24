import { test } from "node:test";
import assert from "node:assert/strict";
import { install, document } from "./fake-dom.mjs";
install();
const { createKoan } = await import("../site/koan.js");
test("koans remain until navigation replaces or clears them", () => {
  const el = document.createElement("p");
  const koan = createKoan(el);
  koan.show("Not yet.");
  assert.equal(el.textContent, "Not yet.");
  koan.show("Mountain is mountain.");
  assert.equal(el.textContent, "Mountain is mountain.");
  koan.clear();
  assert.equal(el.textContent, "");
});
