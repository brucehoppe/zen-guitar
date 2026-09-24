// A koan stays with its stage until the reader chooses to leave.
export function createKoan(el) {
  return {
    show(text) { el.textContent = text || ""; },
    clear() { el.textContent = ""; },
  };
}
