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

export function beltPath(radius, cx, cy, side) {
  const top = `${cx} ${cy - radius}`, bottom = `${cx} ${cy + radius}`;
  return side === "right"
    ? `M${top} A${radius} ${radius} 0 0 1 ${bottom}`
    : `M${bottom} A${radius} ${radius} 0 0 1 ${top}`;
}
