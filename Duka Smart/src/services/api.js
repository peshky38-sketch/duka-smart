export const USE_API = import.meta.env.VITE_USE_API === "true";
const BASE = import.meta.env.VITE_API_URL || "";

// FastAPI errors: { detail: "Not found" } or, for validation, { detail: [{ loc, msg }, ...] }
const errorText = (d) =>
  Array.isArray(d.detail) ? d.detail.map((x) => `${x.loc?.slice(-1)[0]}: ${x.msg}`).join(", ") : d.detail || d.message || d.error;

async function request(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const isForm = body instanceof URLSearchParams; // FastAPI OAuth2PasswordRequestForm login
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  // Token expired or invalid: send the user back to login
  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  const data = await res.json().catch(() => ({})); // DELETE may return 204 with no body
  if (!res.ok) throw new Error(errorText(data) || `Request failed (${res.status})`);
  return data;
}

// ---- mappers: backend JSON <-> frontend objects ----
const toProduct = (p) => ({
  id: p.id,
  emoji: p.emoji || "📦",
  name: p.name,
  sku: p.sku,
  category: p.category?.name ?? p.category ?? "Grocery",
  qty: p.quantity,
  minStock: p.min_stock,
  price: Number(p.price),
  cost: Number(p.cost_price ?? 0),
});
const fromProduct = (p) => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  quantity: p.qty,
  min_stock: p.minStock,
  price: p.price,
  cost_price: p.cost,
});
const toSale = (s) => ({
  id: s.id,
  method: s.payment_method,
  total: Number(s.total),
  date: s.created_at,
  items: (s.items || []).map((i) => ({
    id: i.product_id,
    name: i.name || i.product_name,
    emoji: i.emoji || "📦",
    qty: i.quantity,
    price: Number(i.unit_price ?? i.price),
    cost: Number(i.cost_price ?? 0),
  })),
});
const toExpense = (e) => ({
  id: e.id,
  description: e.description,
  category: e.category?.name ?? e.category,
  amount: Number(e.amount),
  date: e.date || e.created_at,
});

// Lists may come back as [..] or { products: [..] }
const list = (data, key) => (Array.isArray(data) ? data : data[key] || []);

export const api = {
  // auth
  async login(email, password) {
    // Default: JSON {email, password}. If your login uses OAuth2PasswordRequestForm,
    // set VITE_LOGIN_FORM=true in .env and it sends form data {username, password} instead.
    const body = import.meta.env.VITE_LOGIN_FORM === "true" ? new URLSearchParams({ username: email, password }) : { email, password };
    const data = await request("/api/auth/login", { method: "POST", body });
    localStorage.setItem("token", data.access_token);
    return {
      email,
      name: data.user?.name || email,
      shop: data.user?.business_name || data.business?.name || "My Shop",
    };
  },
  register: ({ name, shop, email, password }) =>
    request("/api/auth/register", { method: "POST", body: { name, business_name: shop, email, password } }),

  // products
  getProducts: async () => list(await request("/api/products"), "products").map(toProduct),
  createProduct: async (p) => toProduct(await request("/api/products", { method: "POST", body: fromProduct(p) })),
  updateProduct: async (id, p) => toProduct(await request(`/api/products/${id}`, { method: "PATCH", body: fromProduct(p) })),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),

  // sales: lines = [{ id, qty }]
  getSales: async () => list(await request("/api/sales"), "sales").map(toSale),
  createSale: async (lines, method) =>
    toSale(
      await request("/api/sales", {
        method: "POST",
        body: { payment_method: method, items: lines.map((l) => ({ product_id: l.id, quantity: l.qty })) },
      })
    ),

  // expenses
  getExpenses: async () => list(await request("/api/expenses"), "expenses").map(toExpense),
  createExpense: async (e) =>
    toExpense(await request("/api/expenses", { method: "POST", body: { description: e.description, category: e.category, amount: e.amount, date: e.date } })),

  // dashboard (optional: the dashboard currently calculates from sales + expenses)
  getSummary: () => request("/api/dashboard/summary"),
};