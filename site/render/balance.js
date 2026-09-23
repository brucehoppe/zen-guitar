// site/render/balance.js
import { el, svg, heading } from "./dom.js";

export function renderBalance(section, ctx) {
  const detail = el("div", { class: "balance-detail", "aria-live": "polite" }, [el("p", { class: "muted" }, ["Choose a misstep."])]);
  let selected = null;
  const show = (item, btn) => {
    selected?.classList.remove("is-selected");
    selected?.setAttribute("aria-pressed", "false");
    selected = btn;
    btn.classList.add("is-selected");
    btn.setAttribute("aria-pressed", "true");
    detail.replaceChildren(
      el("h4", { class: "wheel-name" }, [item.name]),
      el("p", {}, [el("span", { class: "eyebrow-inline" }, ["The trap "]), item.trap]),
      el("p", {}, [el("span", { class: "eyebrow-inline" }, ["The correction "]), item.correction]),
    );
  };
  const pairs = el("div", { class: "balances" }, section.pairs.map(([l, r]) => {
    const left = el("button", { class: "pan pan-l", type: "button", "aria-pressed": "false" }, [l.name]);
    const right = el("button", { class: "pan pan-r", type: "button", "aria-pressed": "false" }, [r.name]);
    left.addEventListener("click", () => show(l, left));
    right.addEventListener("click", () => show(r, right));
    const beam = svg("svg", { viewBox: "0 0 120 40", class: "beam", "aria-hidden": "true" }, [
      svg("line", { x1: 10, y1: 14, x2: 110, y2: 14, class: "beam-line" }),
      svg("path", { d: "M60 14 L52 36 L68 36 Z", class: "fulcrum" }),
      svg("line", { x1: 10, y1: 14, x2: 10, y2: 4, class: "beam-line" }),
      svg("line", { x1: 110, y1: 14, x2: 110, y2: 4, class: "beam-line" }),
    ]);
    return el("div", { class: "balance" }, [el("div", { class: "pans" }, [left, right]), beam]);
  }));
  const others = el("ul", { class: "missteps" }, section.others.map((m) => {
    const b = el("button", { class: "misstep", type: "button", "aria-pressed": "false" }, [m.name]);
    b.addEventListener("click", () => show(m, b));
    return el("li", {}, [b]);
  }));
  return el("section", { class: "sec sec-balance", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted small" }, [section.caption]),
    pairs,
    el("p", { class: "muted small" }, ["And six more"]),
    others,
    detail,
  ]);
}
