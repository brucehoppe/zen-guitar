export function markerPositions(count, radius, cx = 200, cy = 200) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad), angle };
  });
}

export function rotationFor(stage, count = 5) {
  const deg = -((360 / count) * (stage - 1));
  return deg === 0 ? 0 : deg;
}

export function wornStops(again) {
  return again
    ? [{ offset: 0, color: "#f6f1e7" }, { offset: 0.5, color: "#8d877a" }, { offset: 1, color: "#2a2825" }]
    : [{ offset: 0, color: "#f6f1e7" }, { offset: 0.5, color: "#6b665c" }, { offset: 1, color: "#151412" }];
}

export function beltPath(radius, cx, cy, side, overlap = 0) {
  const point = (deg) => {
    const rad = (deg * Math.PI) / 180;
    const x = +(cx + radius * Math.cos(rad)).toFixed(3), y = +(cy + radius * Math.sin(rad)).toFixed(3);
    return `${x} ${y}`;
  };
  // angles in SVG space: -90 is the top, 90 the bottom; overlap extends each end
  const [from, to] = side === "right" ? [-90 - overlap, 90 + overlap] : [90 - overlap, 270 + overlap];
  return `M${point(from)} A${radius} ${radius} 0 ${overlap > 0 ? 1 : 0} 1 ${point(to)}`;
}
