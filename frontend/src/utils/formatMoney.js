// Shows a money amount the way people read it in Kenya: KES 1,844,400
// Used by every page so the format is the same everywhere.
export function formatKES(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "KES 0";
  return "KES " + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
