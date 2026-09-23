export function spokes(count, inner, outer, cx, cy) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const rad = ((angle - 90) * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const near = (v) => Math.abs(v) < 1e-9;
    const anchor = near(c) ? "middle" : c > 0 ? "start" : "end";
    // Every start/end-anchored (non-vertical) label is a "side" label and is pulled
    // in from the default 14-unit gap to 8; the exact 3 and 9 o'clock spokes sit
    // closest to the viewBox's side edges, so they're pulled in further still, to 6.
    const gap = near(s) ? 6 : 8;
    // The hit line starts further out than the visible spoke line so neighbouring
    // 24-unit-wide hit strokes don't overlap each other near the hub.
    const hitInner = inner + 12;
    return {
      x1: cx + inner * c, y1: cy + inner * s,
      x2: cx + outer * c, y2: cy + outer * s,
      hx1: cx + hitInner * c, hy1: cy + hitInner * s,
      lx: cx + (outer + gap) * c, ly: cy + (outer + gap) * s + 4,
      angle, anchor,
    };
  });
}

// Splits a label longer than 11 characters into two lines at its last hyphen or
// space (whichever comes later), so long names like "Follow-through" and "Stages
// and plateaus" wrap onto a second <tspan> instead of running past the wheel's
// edge. The split character stays on the first line (a hyphen reads naturally, and
// a space is kept so the two lines' textContent still reads as the original
// "Stages and plateaus" rather than running the words together). Labels with no
// hyphen or space to split on are returned unsplit.
export function splitLabel(name) {
  if (name.length <= 11) return [name];
  const hyphen = name.lastIndexOf("-");
  const space = name.lastIndexOf(" ");
  const idx = Math.max(hyphen, space);
  if (idx <= 0) return [name];
  return [name.slice(0, idx + 1), name.slice(idx + 1)];
}
