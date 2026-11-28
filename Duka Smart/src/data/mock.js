export const CATEGORIES = ["Grocery", "Drinks", "Bakery", "Household"];
export const EXPENSE_CATEGORIES = ["Rent", "Transport", "Stock costs", "Wages", "Utilities", "Supplies", "Other"];

export const PRODUCTS = [
  { id: 1,  name: "Unga Pembe 2kg", sku: "UNG-002", category: "Grocery", qty: 6, minStock: 20, price: 145, cost: 110 },
  { id: 2,  name: "Sugar 1kg", sku: "SUG-001", category: "Grocery", qty: 4, minStock: 25, price: 165, cost: 130 },
  { id: 3,  name: "Cooking Oil 1L", sku: "OIL-001", category: "Grocery", qty: 38, minStock: 15, price: 310, cost: 240 },
  { id: 4,  name: "Rice Pishori 2kg", sku: "RIC-002", category: "Grocery", qty: 52, minStock: 15, price: 480, cost: 370 },
  { id: 5,  name: "Fresh Milk 500ml", sku: "MLK-050", category: "Drinks", qty: 24, minStock: 12, price: 65, cost: 50 },
  { id: 6,  name: "White Bread", sku: "BRD-001", category: "Bakery", qty: 18, minStock: 10, price: 70, cost: 55 },
  { id: 7,  name: "Tea Leaves 250g", sku: "TEA-250", category: "Drinks", qty: 41, minStock: 12, price: 120, cost: 90 },
  { id: 8,  name: "Bar Soap", sku: "SOP-001", category: "Household", qty: 9, minStock: 15, price: 55, cost: 40 },
  { id: 9,  name: "Salt 500g", sku: "SLT-050", category: "Grocery", qty: 63, minStock: 20, price: 40, cost: 30 },
  { id: 10, name: "Eggs Tray (30)", sku: "EGG-030", category: "Grocery", qty: 0, minStock: 6, price: 480, cost: 380 },
];

// date helpers for seed data
const today = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString();
const past = (days, hour) => { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hour, 15, 0, 0); return d.toISOString(); };

const sale = (id, date, method, lines) => {
  const items = lines.map(([pid, qty]) => {
    const p = PRODUCTS.find((x) => x.id === pid);
    return { id: pid, name: p.name, emoji: p.emoji, qty, price: p.price, cost: p.cost };
  });
  return { id, date, method, items, total: items.reduce((t, i) => t + i.price * i.qty, 0) };
};

export const SALES = [
  sale(1042, today(2), "M-Pesa", [[4, 3], [3, 2], [5, 4]]),
  sale(1041, today(9), "Cash", [[9, 5], [6, 4], [7, 2]]),
  sale(1040, today(21), "M-Pesa", [[10, 3], [4, 2], [1, 4]]),
  sale(1039, today(40), "Card", [[3, 4], [4, 3], [2, 2]]),
  sale(1038, past(1, 16), "Cash", [[4, 5], [3, 3], [7, 4]]),
  sale(1037, past(1, 11), "M-Pesa", [[9, 6], [1, 5], [5, 6]]),
  sale(1036, past(2, 15), "M-Pesa", [[4, 6], [2, 4], [6, 5]]),
  sale(1035, past(2, 10), "Card", [[3, 5], [8, 6]]),
  sale(1034, past(3, 17), "Cash", [[10, 4], [4, 3]]),
  sale(1033, past(3, 12), "M-Pesa", [[7, 5], [5, 8], [9, 4]]),
  sale(1032, past(4, 14), "M-Pesa", [[4, 7], [3, 4]]),
  sale(1031, past(4, 9), "Cash", [[1, 6], [6, 6], [8, 4]]),
  sale(1030, past(5, 16), "Card", [[3, 6], [4, 4]]),
  sale(1029, past(5, 10), "M-Pesa", [[2, 5], [5, 6], [7, 3]]),
  sale(1028, past(6, 15), "M-Pesa", [[4, 6], [10, 2], [9, 5]]),
  sale(1027, past(6, 11), "Cash", [[3, 3], [6, 4]]),
];

const ex = (id, date, description, category, amount) => ({ id, date, description, category, amount });
export const EXPENSES = [
  ex(1, today(30), "Boda boda delivery", "Transport", 800),
  ex(2, today(120), "Safaricom airtime", "Utilities", 300),
  ex(3, today(200), "Packaging bags", "Supplies", 400),
  ex(4, past(1, 9), "Transport to wholesaler", "Transport", 700),
  ex(5, past(1, 14), "KPLC tokens", "Utilities", 900),
  ex(6, past(2, 9), "Shop assistant", "Wages", 1200),
  ex(7, past(2, 13), "Transport", "Transport", 600),
  ex(8, past(3, 11), "Cleaning supplies", "Supplies", 500),
  ex(9, past(4, 10), "Transport", "Transport", 650),
  ex(10, past(4, 15), "Airtime", "Utilities", 200),
  ex(11, past(5, 9), "Shop assistant", "Wages", 1200),
  ex(12, past(6, 10), "Transport", "Transport", 700),
];
