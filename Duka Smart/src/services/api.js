// SBRR-26: all communication with the backend lives here.
// This version is written for the team's Flask backend (routes like /api/login, products with
// "buying" / "selling" / "threshold", categories and suppliers by id). If the backend changes,
// edit the mapper functions in this file. The pages never need to change.

export const USE_API = import.meta.env.VITE_USE_API === "true";
const BASE = import.meta.env.VITE_API_URL || "";

// ---------- one place for every request ----------
// Flask answers errors as { "error": "..." }, Flask-JWT as { "msg": "..." }, and crashes as an HTML page.
const errorText = (d) => d.error || d.msg || d.message || (Array.isArray(d.detail) ? d.detail.map((x) => x.msg).join(", ") : d.detail);
const plainMessage = (status) =>
  status === 404 ? "This feature is not available on the server yet." :
  status >= 500 ? "The server had a problem. Please try again." :
  `Request failed (${status})`;

export async function request(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({})); // DELETE or a Flask crash page has no JSON
  // Token expired or invalid (Flask-JWT answers 401, or 422 for a damaged token): back to login
  if (token && (res.status === 401 || (res.status === 422 && data.msg))) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  if (!res.ok) {
    const err = new Error(errorText(data) || plainMessage(res.status));
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- small helpers ----------
const utc = (s) => (s && !/(Z|[+-]\d{2}:?\d{2})$/i.test(s) ? s + "Z" : s); // the server sends UTC times without the Z
const toList = (data, key) => (Array.isArray(data) ? data : data[key] || []);

// The backend has no place for some things the app shows (emoji, barcode, delivery days).
// They are remembered in the browser, per record id.
const extras = {
  all: (kind) => JSON.parse(localStorage.getItem("extras:" + kind) || "{}"),
  get(kind, id) { return this.all(kind)[id] || {}; },
  set(kind, id, values) {
    const all = this.all(kind);
    all[id] = { ...all[id], ...values };
    localStorage.setItem("extras:" + kind, JSON.stringify(all));
  },
};

// ---------- categories and suppliers (products need their ids) ----------
const getCategories = async () => toList(await request("/api/categories"), "categories");

async function categoryId(name) {
  const wanted = (name || "General").trim();
  const found = (await getCategories()).find((c) => c.category_name.toLowerCase() === wanted.toLowerCase());
  if (found) return found.id;
  return (await request("/api/categories", { method: "POST", body: { category_name: wanted } })).category.id;
}

// The backend requires every product to have a supplier. The product form asks the user to pick a real one.
// (Nothing is invented here. If the backend makes the supplier optional, this check can go.)
async function supplierFor(p) {
  if (p.supplier) return p.supplier;
  const list = toList(await request("/api/suppliers"), "suppliers");
  if (list.length === 1) return list[0].id;
  throw new Error(list.length ? "Please choose a supplier for this product." : "Add a supplier first. Every product needs one.");
}

// ---------- mappers: backend JSON <-> what the pages use ----------
const toProduct = (p, categoryNames) => {
  const x = extras.get("product", p.id);
  return {
    id: p.id,
    emoji: x.emoji || "📦",
    name: p.name,
    description: p.description || "",
    supplier: p.supplier ?? null,
    sku: p.sku,
    barcode: x.barcode || "",
    category: categoryNames[p.category] || "General",
    qty: p.quantity,
    minStock: p.threshold,
    price: Number(p.selling),
    cost: Number(p.buying),
  };
};

const toSale = (s, products) => ({
  id: s.sale_id ?? s.id,
  method: s.payment_method,
  total: Number(s.total_amount),
  date: utc(s.created_at),
  items: (s.items || []).map((i) => {
    const p = products[i.product_id];
    // Best: the cost and name saved with the sale (cost_price / product_name). Until the backend sends them,
    // fall back to the product's current buying price and name.
    return {
      id: i.product_id,
      name: i.product_name || p?.name || "Deleted product",
      description: p?.description || "",
      emoji: p?.emoji || "📦",
      qty: i.quantity,
      price: Number(i.unit_price),
      cost: i.cost_price != null ? Number(i.cost_price) : p ? p.cost : 0,
    };
  }),
});

const toExpense = (e) => ({ id: e.id, description: e.expense_name, category: e.category, amount: Number(e.amount), date: utc(e.date || e.created_at) }); // `date` once the backend sends it

export const api = {
  // ---------- auth ----------
  async login(email, password) {
    const data = await request("/api/login", { method: "POST", body: { email, password } });
    localStorage.setItem("token", data.access_token);
    const savedProfile = JSON.parse(localStorage.getItem("profile:" + email) || "{}"); // profile edits kept on this device
    return {
      email,
      name: data.username,
      shop: data.business_name || localStorage.getItem("shop:" + email) || "My Shop",
      // sent by the backend once the login response includes them
      ...(data.phone_number ? { phone: data.phone_number } : {}),
      ...(data.business_address ? { location: data.business_address } : {}),
      ...(data.avatar ? { avatar: data.avatar } : {}),
      ...savedProfile,
    };
  },

  // The backend asks for extra business details. The ones the form does not ask for get sensible defaults.
  async register({ name, shop, email, password, phone, location }) {
    await request("/api/register", {
      method: "POST",
      body: {
        username: name,
        email,
        password,
        business_name: shop,
        business_type: "Retail",
        currency: "KES",
        business_email: email,
        phone_number: phone,
        business_address: location || "Not provided",
        business_logo: "default",
      },
    });
    localStorage.setItem("shop:" + email, shop); // the login response does not include the shop name yet
  },

  // ---------- products ----------
  async getProducts() {
    const [data, cats] = await Promise.all([request("/api/products"), getCategories()]);
    const names = Object.fromEntries(cats.map((c) => [c.id, c.category_name]));
    return toList(data, "products").map((p) => toProduct(p, names));
  },
  async createProduct(p) {
    const [category, supplier] = await Promise.all([categoryId(p.category), supplierFor(p)]);
    const saved = await request("/api/products", {
      method: "POST",
      body: { name: p.name, description: p.description || "", sku: p.sku, buying: p.cost, selling: p.price, quantity: p.qty, threshold: p.minStock, category, supplier },
    });
    extras.set("product", saved.id, { emoji: p.emoji, barcode: p.barcode });
    return { ...p, id: saved.id };
  },
  async updateProduct(id, p) {
    const category = await categoryId(p.category);
    await request(`/api/products/${id}`, {
      method: "PUT",
      body: { name: p.name, description: p.description || "", sku: p.sku, buying: p.cost, selling: p.price, quantity: p.qty, threshold: p.minStock, category, ...(p.supplier ? { supplier: p.supplier } : {}) },
    });
    extras.set("product", id, { emoji: p.emoji, barcode: p.barcode });
    return { ...p, id }; // the server only answers "updated", so the saved values are the ones we sent
  },
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),

  // ---------- sales: lines = [{ id, qty }] ----------
  async getSales() {
    const [data, products] = await Promise.all([request("/api/sales"), api.getProducts()]);
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    return toList(data, "sales").map((s) => toSale(s, byId)).sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first
  },
  async createSale(lines, method) {
    const r = await request("/api/sales", {
      method: "POST",
      body: { payment_method: method, items: lines.map((l) => ({ product_id: l.id, quantity: l.qty })) },
    });
    return { id: r.sale_id, method, total: Number(r.total_amount), date: new Date().toISOString(), items: [] };
  },

  // ---------- expenses ----------
  async getExpenses() {
    return toList(await request("/api/expenses"), "expenses").map(toExpense);
  },
  async createExpense(e) {
    // the server stamps the time itself and also wants a payment method
    const r = await request("/api/expenses", { method: "POST", body: { expense_name: e.description, amount: e.amount, category: e.category, payment_method: "Cash", date: e.date } });
    return toExpense(r.expense);
  },

  // ---------- dashboard (optional: the dashboard works these out itself) ----------
  getSummary: async () => (await request("/api/dashboard/stats")).dashboard,
};
