class FakeNode {
  constructor(tag, ns) { this.tagName = tag; this.namespaceURI = ns; this.children = []; this.attrs = {}; this.listeners = {}; this._text = ""; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  appendChild(n) { this.children.push(n); n.parentNode = this; return n; }
  append(...ns) { ns.forEach((n) => this.appendChild(typeof n === "string" ? document.createTextNode(n) : n)); }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  dispatch(t, ev = {}) { (this.listeners[t] ?? []).forEach((f) => f({ type: t, preventDefault() {}, ...ev })); }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  set innerHTML(v) { this._html = v; }
  get innerHTML() { return this._html ?? ""; }
  get classList() { const self = this; return {
    add: (...c) => { const s = new Set((self.attrs.class ?? "").split(" ").filter(Boolean)); c.forEach((x) => s.add(x)); self.attrs.class = [...s].join(" "); },
    remove: (...c) => { const s = new Set((self.attrs.class ?? "").split(" ").filter(Boolean)); c.forEach((x) => s.delete(x)); self.attrs.class = [...s].join(" "); },
    toggle: (c, force) => { const has = self.classList.contains(c); const want = force ?? !has; want ? self.classList.add(c) : self.classList.remove(c); return want; },
    contains: (c) => (self.attrs.class ?? "").split(" ").includes(c),
  }; }
  querySelectorAll(sel) { const out = []; const m = sel.match(/^([a-z]+)?(?:\.([\w-]+))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/i);
    const walk = (n) => { for (const c of n.children) { if (c instanceof FakeNode) { if (matches(c, m)) out.push(c); walk(c); } } };
    walk(this); return out; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
  get hidden() { return this.attrs.hidden === "true"; } set hidden(v) { if (v) this.attrs.hidden = "true"; else delete this.attrs.hidden; }
  focus() { document.activeElement = this; }
}
function matches(n, m) { if (!m) return false; const [, tag, cls, attr, val] = m;
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
