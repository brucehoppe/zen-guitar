export function spokes(count, inner, outer, cx, cy, labelGap = 14) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const rad = ((angle - 90) * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const near = (v) => Math.abs(v) < 1e-9;
    const anchor = near(c) ? "middle" : c > 0 ? "start" : "end";
    return {
      x1: cx + inner * c, y1: cy + inner * s,
      x2: cx + outer * c, y2: cy + outer * s,
      lx: cx + (outer + labelGap) * c, ly: cy + (outer + labelGap) * s + 4,
      angle, anchor,
    };
  });
}
