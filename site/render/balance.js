// site/render/balance.js
import { el, svg, heading } from "./dom.js";

export function renderBalance(section, ctx) {
  const detail = el("div", { class: "balance-detail", "aria-live": "polite" }, [el("p", { class: "muted" }, ["Choose a misstep."])]);
  let selected = null;
  let tiltedBalance = null;
  const clearTilt = () => {
    if (tiltedBalance) {
      tiltedBalance.classList.remove("is-tilt-left", "is-tilt-right");
      tiltedBalance = null;
    }
  };
  const showDetail = (item) => {
    const children = [
      el("h4", { class: "detail-name" }, [item.name]),
      el("p", {}, [el("span", { class: "eyebrow-inline" }, ["The trap "]), item.trap]),
      el("p", {}, [el("span", { class: "eyebrow-inline" }, ["The correction "]), item.correction]),
    ];
    if (item.opposite) children.push(el("p", { class: "muted small" }, [`Its opposite: ${item.opposite}`]));
    detail.replaceChildren(...children);
  };
  const select = (item, btn) => {
    selected?.classList.remove("is-selected");
    selected?.setAttribute("aria-pressed", "false");
    selected = btn;
    btn.classList.add("is-selected");
    btn.setAttribute("aria-pressed", "true");
    showDetail(item);
  };
  const scrollToDetail = () => {
    if (typeof detail.scrollIntoView === "function") detail.scrollIntoView({ block: "nearest" });
  };
  const pairs = el("div", { class: "balances" }, section.pairs.map(([l, r]) => {
    const left = el("button", { class: "pan pan-l", type: "button", "aria-pressed": "false" }, [l.name]);
    const right = el("button", { class: "pan pan-r", type: "button", "aria-pressed": "false" }, [r.name]);
    const balanceEl = el("div", { class: "balance", role: "group", "aria-label": `Opposite pair: ${l.name} and ${r.name}` });
    left.addEventListener("click", (e) => {
      clearTilt();
      balanceEl.classList.add("is-tilt-left");
      tiltedBalance = balanceEl;
      select({ ...l, opposite: r.name }, left);
      if (e.detail > 0) scrollToDetail();
    });
    right.addEventListener("click", (e) => {
      clearTilt();
      balanceEl.classList.add("is-tilt-right");
      tiltedBalance = balanceEl;
      select({ ...r, opposite: l.name }, right);
      if (e.detail > 0) scrollToDetail();
    });
    const fulcrumGroup = svg("svg", { x: 52, y: 10, width: 16, height: 28, viewBox: "0 0 16 28", preserveAspectRatio: "xMidYMid meet", class: "fulcrum-inner" }, [
      svg("path", { d: "M8 4 L0 26 L16 26 Z", class: "fulcrum" }),
      svg("circle", { cx: 8, cy: 4, r: 3, class: "chudan-mark" }),
    ]);
    const beam = svg("svg", { viewBox: "0 0 120 40", class: "beam", "aria-hidden": "true", preserveAspectRatio: "none" }, [
      svg("line", { x1: 10, y1: 14, x2: 110, y2: 14, class: "beam-line", "vector-effect": "non-scaling-stroke" }),
      fulcrumGroup,
      svg("line", { x1: 10, y1: 14, x2: 10, y2: 4, class: "beam-line", "vector-effect": "non-scaling-stroke" }),
      svg("line", { x1: 110, y1: 14, x2: 110, y2: 4, class: "beam-line", "vector-effect": "non-scaling-stroke" }),
    ]);
    balanceEl.append(el("div", { class: "pans" }, [left, right]), beam);
    return balanceEl;
  }));
  const others = el("ul", { class: "missteps" }, section.others.map((m) => {
    const b = el("button", { class: "misstep", type: "button", "aria-pressed": "false" }, [m.name]);
    b.addEventListener("click", (e) => {
      clearTilt();
      select(m, b);
      if (e.detail > 0) scrollToDetail();
    });
    return el("li", {}, [b]);
  }));
  return el("section", { class: "sec sec-balance", "aria-labelledby": `sec-${section.id}` }, [
    heading(section),
    el("p", { class: "muted small" }, [section.caption]),
    pairs,
    el("p", { class: "muted small" }, ["Standing alone"]),
    others,
    detail,
  ]);
}
