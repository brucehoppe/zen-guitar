function parseSelector(sel) {
  const m = sel.match(/^([a-z][a-z0-9-]*)?(?:\.([\w-]+))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/i);
  if (!m) throw new Error("fake-dom: unsupported selector " + sel);
  return m;
}

class FakeNode {
  constructor(tag, ns) { this.tagName = tag; this.namespaceURI = ns; this.childNodes = []; this.attrs = {}; this.listeners = {}; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  appendChild(n) { this.childNodes.push(n); n.parentNode = this; return n; }
  append(...ns) { ns.forEach((n) => {
    if (typeof n === "string") return this.appendChild(document.createTextNode(n));
    if (n instanceof FakeNode || n instanceof FakeText) return this.appendChild(n);
    throw new Error(`fake-dom: cannot append ${n === null ? "null" : typeof n}`);
  }); }
  replaceChildren(...ns) { this.childNodes = []; this.append(...ns); }
  remove() { if (this.parentNode) this.parentNode.childNodes = this.parentNode.childNodes.filter((n) => n !== this); }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  dispatch(t, ev = {}) {
    const event = { type: t, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...ev };
    (this.listeners[t] ?? []).forEach((f) => f(event));
    return event;
  }
  get children() { return this.childNodes.filter((n) => n instanceof FakeNode); }
  set textContent(v) { this.childNodes = [new FakeText(String(v))]; }
  get textContent() { return this.childNodes.map((c) => c.textContent).join(""); }
  set innerHTML(v) {
    if (v === "") { this.childNodes = []; return; }
    throw new Error("fake-dom: innerHTML with content is not allowed");
  }
  get innerHTML() { return ""; }
  get classList() { const self = this; return {
    add: (...c) => { const s = new Set((self.attrs.class ?? "").split(" ").filter(Boolean)); c.forEach((x) => s.add(x)); self.attrs.class = [...s].join(" "); },
    remove: (...c) => { const s = new Set((self.attrs.class ?? "").split(" ").filter(Boolean)); c.forEach((x) => s.delete(x)); if (s.size) self.attrs.class = [...s].join(" "); else delete self.attrs.class; },
    toggle: (c, force) => { const has = self.classList.contains(c); const want = force ?? !has; want ? self.classList.add(c) : self.classList.remove(c); return want; },
    contains: (c) => (self.attrs.class ?? "").split(" ").includes(c),
  }; }
  querySelectorAll(sel) { const out = []; const m = parseSelector(sel);
    const walk = (n) => { for (const c of n.children) { if (matches(c, m)) out.push(c); walk(c); } };
    walk(this); return out; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
  closest(sel) { const m = parseSelector(sel); let n = this; while (n instanceof FakeNode) { if (matches(n, m)) return n; n = n.parentNode; } return null; }
  get hidden() { return "hidden" in this.attrs; } set hidden(v) { v ? (this.attrs.hidden = "") : delete this.attrs.hidden; }
  focus() { document.activeElement = this; }
}
function matches(n, m) { const [, tag, cls, attr, val] = m;
  if (tag && n.tagName !== tag) return false; if (cls && !n.classList.contains(cls)) return false;
  if (attr && (n.getAttribute(attr) === null || (val !== undefined && n.getAttribute(attr) !== val))) return false; return true; }
class FakeText { constructor(t) { this.textContent = t; } }
export const document = {
  createElement: (t) => new FakeNode(t, "html"),
  createElementNS: (ns, t) => new FakeNode(t, ns),
  createTextNode: (t) => new FakeText(t),
  activeElement: null,
};
export function install() { globalThis.document = document; return document; }
