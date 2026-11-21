// Fills the real backend with realistic demo data for your presentation.
// Usage:  node scripts/seed.mjs http://localhost:8000 you@email.com yourpassword [--form]
// Add --form if your login uses OAuth2 form data (username/password).
// Needs Node 18 or newer. Field names match src/services/api.js, so change them in both places together.
const [base, email, password, flag] = process.argv.slice(2);
if (!base || !email || !password) {
  console.log("Usage: node scripts/seed.mjs <api-url> <email> <password> [--form]");
  process.exit(1);
}

let token = "";
async function call(path, method = "GET", body, form = false) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": form ? "application/x-www-form-urlencoded" : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? (form ? new URLSearchParams(body) : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data.detail || data)}`);
  return data;
}

const P = (name, sku, category, quantity, min_stock, price, cost_price) => ({ name, sku, category, quantity, min_stock, price, cost_price });
const PRODUCTS = [
  P("Unga Pembe 2kg", "UNG-002", "Grocery", 40, 20, 145, 110), P("Sugar 1kg", "SUG-001", "Grocery", 45, 25, 165, 130),
  P("Cooking Oil 1L", "OIL-001", "Grocery", 38, 15, 310, 240), P("Rice Pishori 2kg", "RIC-002", "Grocery", 52, 15, 480, 370),
  P("Fresh Milk 500ml", "MLK-050", "Drinks", 24, 12, 65, 50), P("White Bread", "BRD-001", "Bakery", 30, 10, 70, 55),
  P("Tea Leaves 250g", "TEA-250", "Drinks", 41, 12, 120, 90), P("Bar Soap", "SOP-001", "Household", 35, 15, 55, 40),
  P("Salt 500g", "SLT-050", "Grocery", 63, 20, 40, 30), P("Eggs Tray (30)", "EGG-030", "Grocery", 20, 6, 480, 380),
  P("Wheat Flour 2kg", "FLR-002", "Grocery", 36, 15, 190, 150), P("Maize Flour 1kg", "MZF-001", "Grocery", 48, 20, 90, 70),
  P("Soda 500ml", "SOD-050", "Drinks", 60, 24, 60, 45), P("Detergent 1kg", "DET-001", "Household", 22, 10, 260, 200),
  P("Biscuits Pack", "BIS-001", "Bakery", 40, 12, 50, 36), P("Toothpaste 100ml", "TTP-100", "Household", 18, 8, 150, 110),
];
const EXPENSES = [
  ["Boda boda delivery", "Transport", 800], ["Airtime", "Utilities", 300], ["Packaging bags", "Supplies", 400],
  ["KPLC tokens", "Utilities", 900], ["Shop assistant", "Wages", 1200], ["Transport to wholesaler", "Transport", 700],
];

try {
  const login = await call("/api/auth/login", "POST", flag === "--form" ? { username: email, password } : { email, password }, flag === "--form");
  token = login.access_token;
  console.log("Logged in");

  const ids = [];
  for (const p of PRODUCTS) {
    const saved = await call("/api/products", "POST", p);
    ids.push(saved.id ?? saved.product?.id);
  }
  console.log(`Added ${ids.length} products`);

  for (const [description, category, amount] of EXPENSES) {
    await call("/api/expenses", "POST", { description, category, amount, date: new Date().toISOString() });
  }
  console.log(`Added ${EXPENSES.length} expenses`);

  const methods = ["Cash", "M-Pesa", "Card"];
  for (let i = 0; i < 10; i++) {
    const pick = [...ids].sort(() => Math.random() - 0.5).slice(0, 1 + (i % 3));
    await call("/api/sales", "POST", {
      payment_method: methods[i % 3],
      items: pick.map((id) => ({ product_id: id, quantity: 1 + (i % 3) })),
    });
  }
  console.log("Recorded 10 sales (the server stamps them with today's date)");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
}
