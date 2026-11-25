// Talks to the Flask backend. The address comes from VITE_API_URL (see .env.example).
const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export function getToken() {
  return localStorage.getItem("duka_token");
}

export function isLoggedIn() {
  return !!getToken();
}

export function getUser() {
  return {
    username: localStorage.getItem("duka_username") || "",
    business: localStorage.getItem("duka_business") || "",
  };
}

export function logout() {
  localStorage.removeItem("duka_token");
  localStorage.removeItem("duka_username");
  localStorage.removeItem("duka_business");
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  let res;
  try {
    res = await fetch(BASE + path, { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some replies have no body
  }

  // an expired or missing token sends the person back to log in
  if (res.status === 401 && token) {
    logout();
    window.location.href = "/login";
  }
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || "Something went wrong (" + res.status + ")");
  }
  return data;
}

const send = (method) => (path, body) =>
  request(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export const get = (path) => request(path);
export const post = send("POST");
export const put = send("PUT");
export const del = send("DELETE");

export async function login(email, password) {
  const data = await post("/api/login", { email, password });
  localStorage.setItem("duka_token", data.access_token);
  localStorage.setItem("duka_username", data.username || "");
  return data;
}

export function register(body) {
  return post("/api/register", body);
}

// ----- helpers that turn backend replies into the shapes the pages use -----

export async function loadShop() {
  const [p, c, s, sa, ex] = await Promise.all([
    get("/api/products"),
    get("/api/categories"),
    get("/api/suppliers"),
    get("/api/sales"),
    get("/api/expenses"),
  ]);
  const categories = c.categories.map((x) => ({ id: x.id, name: x.category_name }));
  const suppliers = s.suppliers.map((x) => ({ id: x.id, name: x.supplier_name }));
  const catName = (id) => (categories.find((x) => x.id === id) || {}).name || "";
  const supName = (id) => (suppliers.find((x) => x.id === id) || {}).name || "";

  const products = p.products.map((x) => ({
    id: x.id,
    name: x.name,
    sku: x.sku,
    description: x.description || "",
    buying: x.buying,
    selling: x.selling,
    quantity: x.quantity,
    threshold: x.threshold,
    categoryId: x.category,
    supplierId: x.supplier,
    category: catName(x.category),
    supplier: supName(x.supplier),
  }));

  const nameOf = (id) => (products.find((x) => x.id === id) || { name: "Deleted product" }).name;
  const sales = sa
    .map((x) => ({
      id: x.sale_id,
      number: x.sale_number,
      total: Number(x.total_amount),
      payment: x.payment_method,
      createdAt: x.created_at,
      items: x.items.map((i) => ({
        productId: i.product_id,
        name: nameOf(i.product_id),
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
        subtotal: Number(i.subtotal),
      })),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const expenses = ex.expenses.map((x) => ({
    id: x.id,
    name: x.expense_name,
    amount: Number(x.amount),
    category: x.category,
    payment: x.payment_method,
    note: x.note || "",
    createdAt: x.created_at,
  }));

  return { products, categories, suppliers, sales, expenses };
}

// find a category or supplier by name, or create it, and give back its id
export async function ensureCategory(name, categories) {
  const found = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (found) return found.id;
  const created = await post("/api/categories", { category_name: name.trim() });
  return created.category.id;
}

export async function ensureSupplier(name, suppliers) {
  const found = suppliers.find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  if (found) return found.id;
  // the backend needs a phone number that is different for every supplier (the form
  // does not ask for one yet) and crashes if the address is left out, so both are sent
  const created = await post("/api/suppliers", { supplier_name: name.trim(), phone_number: "not given " + Date.now(), address: "" });
  return created.supplier.id;
}
