// The deploy job in .github/workflows/pages.yml stamps ?v=<short sha> into every
// relative module URL of the uploaded copy, so a returning visitor never runs a
// fresh app.js against cached older modules. This test runs the same three
// rewrites in JS on a temp copy of site/.
// KEEP IN SYNC: these regexes must match the sed commands in the
// "Version module URLs" step of .github/workflows/pages.yml.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = fileURLToPath(new URL("../site/", import.meta.url));
const V = "abc1234";

// sed -E "s#(src=\"\./app\.js)\"#\1?v=${v}\"#" site/index.html
const APP_JS = /(src="\.\/app\.js)"/;
// sed -E "s#(href=\"\./app\.css)\"#\1?v=${v}\"#" site/index.html
const APP_CSS = /(href="\.\/app\.css)"/;
// sed -E "s#(from \"\.{1,2}/[^\"]+\.js)\"#\1?v=${v}\"#g" on every .js file
const FROM_JS = /(from "\.{1,2}\/[^"]+\.js)"/g;
// sed -E "s#(src: \"\./assets/hero\.jpg)\"#\1?v=${v}\"#" site/app.js
const HERO = /(src: "\.\/assets\/hero\.jpg)"/;

async function jsFiles(dir) {
  const out = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) out.push(...await jsFiles(p));
    else if (d.name.endsWith(".js")) out.push(p);
  }
  return out;
}

async function versionCopy(root, v) {
  const index = join(root, "index.html");
  let html = await readFile(index, "utf8");
  html = html.replace(APP_JS, `$1?v=${v}"`).replace(APP_CSS, `$1?v=${v}"`);
  await writeFile(index, html);
  for (const f of await jsFiles(root)) {
    const src = await readFile(f, "utf8");
    await writeFile(f, src.replace(FROM_JS, `$1?v=${v}"`));
  }
  const app = join(root, "app.js");
  await writeFile(app, (await readFile(app, "utf8")).replace(HERO, `$1?v=${v}"`));
}

// every relative module specifier in `from "…"` form, with or without a query
const RELATIVE_FROM = /from "(\.{1,2}\/[^"]+)"/g;

test("the deploy rewrite versions app.js, app.css, the hero image and every relative module import", async () => {
  const root = await mkdtemp(join(tmpdir(), "zen-guitar-deploy-"));
  try {
    await cp(SITE, root, { recursive: true });

    // guard: the source itself is unversioned, so a no-op rewrite cannot pass
    const before = await readFile(join(root, "index.html"), "utf8");
    assert.doesNotMatch(before, /\?v=/, "site/index.html should not carry a version in source");

    await versionCopy(root, V);

    const html = await readFile(join(root, "index.html"), "utf8");
    assert.match(html, new RegExp(`src="\\./app\\.js\\?v=${V}"`), "index.html should load app.js?v=");
    assert.match(html, new RegExp(`href="\\./app\\.css\\?v=${V}"`), "index.html should load app.css?v=");

    const files = await jsFiles(root);
    let imports = 0;
    for (const f of files) {
      const src = await readFile(f, "utf8");
      for (const [, spec] of src.matchAll(RELATIVE_FROM)) {
        imports++;
        assert.ok(spec.endsWith(`.js?v=${V}`), `${f.slice(root.length)} imports ${spec} without ?v=`);
      }
      assert.doesNotMatch(src, /\bimport\s*\(/, `${f.slice(root.length)} uses a dynamic import() the rewrite would miss`);
      assert.doesNotMatch(src, /^\s*import\s+["']/m, `${f.slice(root.length)} uses a bare import "…" the rewrite would miss`);
    }
    assert.ok(imports > 20, `expected the site's module graph to be rewritten, saw ${imports} imports`);
    const app = await readFile(join(root, "app.js"), "utf8");
    assert.match(app, new RegExp(`src: "\\./assets/hero\\.jpg\\?v=${V}"`), "the hero image should be versioned too");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the workflow's sed commands and this test's regexes stay in sync", async () => {
  const yml = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  assert.match(yml, /s#\(src=\\"\\\.\/app\\\.js\)\\"#\\1\?v=\$\{v\}\\"#/, "app.js sed changed");
  assert.match(yml, /s#\(href=\\"\\\.\/app\\\.css\)\\"#\\1\?v=\$\{v\}\\"#/, "app.css sed changed");
  assert.match(yml, /s#\(from \\"\\\.\{1,2\}\/\[\^\\"\]\+\\\.js\)\\"#\\1\?v=\$\{v\}\\"#g/, "module import sed changed");
  assert.match(yml, /s#\(src: \\"\\\.\/assets\/hero\\\.jpg\)\\"#\\1\?v=\$\{v\}\\"#/, "hero image sed changed");
  // the version step runs in the deploy job, before the upload
  const deploy = yml.slice(yml.indexOf("  deploy:"));
  assert.ok(deploy.indexOf("Version module URLs") > 0, "version step belongs to the deploy job");
  assert.ok(deploy.indexOf("Version module URLs") < deploy.indexOf("upload-pages-artifact"), "version step must run before the upload");
});
