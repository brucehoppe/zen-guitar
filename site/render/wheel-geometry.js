export function spokes(count, inner, outer, cx, cy, labelGap = 14) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const rad = ((angle - 90) * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const near = (v) => Math.abs(v) < 1e-9;
    const anchor = near(c) ? "middle" : c > 0 ? "start" : "end";
    // The 3 and 9 o'clock labels sit closest to the viewBox's side edges, so they're
    // anchored 8 units further inward (labelGap 6 instead of 14) to stay inside it.
    const gap = near(s) ? labelGap - 8 : labelGap;
    return {
      x1: cx + inner * c, y1: cy + inner * s,
      x2: cx + outer * c, y2: cy + outer * s,
      lx: cx + (outer + gap) * c, ly: cy + (outer + gap) * s + 4,
      angle, anchor,
    };
  });
}

// Splits a label longer than 11 characters into two lines at its last hyphen or
// space (whichever comes later), so long names like "Follow-through" and "Stages
// and plateaus" wrap onto a second <tspan> instead of running past the wheel's
// edge. Labels with no hyphen or space to split on are returned unsplit.
export function splitLabel(name) {
  if (name.length <= 11) return [name];
  const hyphen = name.lastIndexOf("-");
  const space = name.lastIndexOf(" ");
  const idx = Math.max(hyphen, space);
  if (idx <= 0) return [name];
  const first = name.slice(0, idx + (idx === hyphen ? 1 : 0));
  const second = name.slice(idx + 1);
  return [first, second];
}
