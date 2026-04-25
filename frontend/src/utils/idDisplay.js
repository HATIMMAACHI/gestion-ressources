export function formatRef(prefix, id) {
  if (!id) return "-";

  const raw = String(id);
  const shortPart = raw.split("-")[0] || raw.slice(0, 8);
  return `${prefix}-${shortPart.toUpperCase()}`;
}

export function formatIdCell(prefix, id) {
  if (!id) return "-";
  return formatRef(prefix, id);
}
