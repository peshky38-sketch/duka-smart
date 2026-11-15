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
