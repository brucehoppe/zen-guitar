const SVG_NS = "http://www.w3.org/2000/svg";

function build(node, attrs, children) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined) continue;
    node.append(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  return node;
}

export const el = (tag, attrs = {}, children = []) => build(document.createElement(tag), attrs, children);
export const svg = (tag, attrs = {}, children = []) => build(document.createElementNS(SVG_NS, tag), attrs, children);

export function heading(section) {
  return el("h3", { class: "sec-h", id: `sec-${section.id}` }, [section.heading]);
}

export function kanji(text) {
  return text ? el("span", { lang: "ja", class: "kanji", "aria-hidden": "true" }, [text]) : null;
}
