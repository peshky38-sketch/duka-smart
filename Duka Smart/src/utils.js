export const kes = (n) => "KES " + Math.round(n).toLocaleString();
export const sum = (arr, f) => arr.reduce((t, x) => t + f(x), 0);

const key = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`; };
export const sameDay = (a, b) => key(a) === key(b);

// last n days as Date objects, oldest first (today is last)
export const daysBack = (n) =>
  Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return d; });

export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
export const fmtTime = (d) => new Date(d).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

export const saleCost = (s) => sum(s.items, (i) => i.cost * i.qty); // cost of goods sold
export const pctChange = (now, before) => (before ? Math.round(((now - before) / before) * 100) : null);

// ---------- CSV export (opens in Excel / Google Sheets) ----------
// Text that starts with = + - @ could run as a formula in a spreadsheet, so it gets a ' in front.
// Real numbers are left alone, so a negative profit stays a number.
const csvCell = (v) => {
  let s = typeof v === "number" ? String(v) : String(v ?? "");
  if (typeof v !== "number" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(",")).join("\r\n");

export const downloadCsv = (filename, rows) => {
  const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" }); // BOM makes Excel read it as UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// 2026-11-24 in the user's own time zone (used in file names and the Date column)
export const isoDay = (d) => new Date(d).toLocaleDateString("en-CA");
