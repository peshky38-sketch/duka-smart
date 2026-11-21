import { createContext, useContext, useEffect, useState } from "react";
import { PRODUCTS, SALES, EXPENSES } from "../data/mock";
import { api, USE_API } from "../services/api";
import { profileApi } from "../services/profile";
import { supplierApi } from "../services/suppliers";
import { SUPPLIERS } from "../data/suppliers";
import { sum } from "../utils";

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

// Business rules from the project doc
export const isOut = (p) => p.qty === 0;
export const isLow = (p) => p.qty > 0 && p.qty <= p.minStock; // less than or equal to minimum

// Remembers each account's profile (photo, phone...) so it survives logging out (demo mode)
const savedProfile = (email) => JSON.parse(localStorage.getItem("profile:" + email) || "{}");

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [products, setProducts] = useState(USE_API ? [] : PRODUCTS);
  const [sales, setSales] = useState(USE_API ? [] : SALES);
  const [expenses, setExpenses] = useState(USE_API ? [] : EXPENSES);
  const [suppliers, setSuppliers] = useState(USE_API ? [] : SUPPLIERS);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(!USE_API); // true once the first data has arrived
  const [error, setError] = useState("");

  // Load everything from the backend once the user is logged in
  useEffect(() => {
    if (!USE_API || !user) return;
    setLoading(true);
    Promise.all([api.getProducts(), api.getSales(), api.getExpenses()])
      .then(([p, s, e]) => { setProducts(p); setSales(s); setExpenses(e); setError(""); })
      .catch((err) => setError(err.message))
      .finally(() => { setLoading(false); setLoaded(true); });
  }, [user]);

  // ---------- notifications: stock alerts and new sales ----------
  const stockAlerts = products
    .filter((p) => isLow(p) || isOut(p))
    .sort((a, b) => a.qty - b.qty)
    .map((p) => ({ id: `${p.id}-${isOut(p) ? "out" : "low"}`, kind: isOut(p) ? "out" : "low", product: p }));
  const saleAlerts = [...sales]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20) // the 20 most recent sales
    .map((s) => ({ id: `sale-${s.id}`, kind: "sale", sale: s }));
  const alerts = [...stockAlerts, ...saleAlerts];

  const [readIds, setReadIds] = useState(() => JSON.parse(localStorage.getItem("readAlerts") || "[]"));
  // Sales that existed the first time the app loaded are not "new": only later sales notify
  const [baseline, setBaseline] = useState(() => {
    const v = localStorage.getItem("saleBaseline");
    return v === null ? null : Number(v);
  });

  useEffect(() => localStorage.setItem("readAlerts", JSON.stringify(readIds)), [readIds]);
  useEffect(() => {
    if (!loaded || baseline !== null) return;
    const max = Math.max(0, ...sales.map((x) => x.id));
    localStorage.setItem("saleBaseline", String(max));
    setBaseline(max);
  }, [loaded, sales]);
  // forget "read" marks for alerts that no longer apply, so a product that runs low again is unread again
  useEffect(() => {
    if (loading || !loaded || products.length === 0) return;
    const live = alerts.map((a) => a.id);
    setReadIds((r) => (r.every((id) => live.includes(id)) ? r : r.filter((id) => live.includes(id))));
  }, [products, sales, loading, loaded]);

  const isRead = (a) => readIds.includes(a.id) || (a.kind === "sale" && (baseline === null || a.sale.id <= baseline));
  const unread = alerts.filter((a) => !isRead(a)).length;
  const markRead = (id) => setReadIds((r) => (r.includes(id) ? r : [...r, id]));
  const markAllRead = () => setReadIds((r) => [...new Set([...r, ...alerts.map((a) => a.id)])]);

  // Suppliers load separately so a missing suppliers endpoint never breaks the rest of the app
  useEffect(() => {
    if (!USE_API || !user) return;
    supplierApi.list().then(setSuppliers).catch(() => {});
  }, [user]);

  // ---------- auth ----------
  const startSession = (u) => { localStorage.setItem("user", JSON.stringify(u)); setUser(u); };

  const login = async (email, password) => {
    if (!USE_API) return startSession({ name: "Wanjiru", shop: "Mama Wanjiru Stores", email, ...savedProfile(email) });
    startSession(await api.login(email, password));
  };
  const register = async (f) => {
    if (!USE_API) {
      localStorage.setItem("profile:" + f.email, JSON.stringify({ name: f.name, shop: f.shop, email: f.email }));
      return startSession({ name: f.name, shop: f.shop, email: f.email });
    }
    await api.register(f);
    await login(f.email, f.password);
  };
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // ---------- profile ----------
  const updateProfile = async (changes) => {
    if (USE_API) await profileApi.update(changes);
    const next = { ...user, ...changes };
    localStorage.setItem("profile:" + next.email, JSON.stringify(next));
    localStorage.setItem("user", JSON.stringify(next));
    setUser(next);
  };
  const changePassword = async (current, next) => {
    if (USE_API) await profileApi.changePassword(current, next);
    // mock mode: nothing to change, any password is accepted
  };

  // ---------- products ----------
  const saveProduct = async (p) => {
    if (USE_API) {
      const saved = p.id ? await api.updateProduct(p.id, p) : await api.createProduct(p);
      setProducts((l) => (p.id ? l.map((x) => (x.id === saved.id ? saved : x)) : [...l, saved]));
      return;
    }
    setProducts((l) => (p.id ? l.map((x) => (x.id === p.id ? p : x)) : [...l, { ...p, id: Date.now() }]));
  };
  const deleteProduct = async (id) => {
    if (USE_API) await api.deleteProduct(id);
    setProducts((l) => l.filter((x) => x.id !== id));
  };

  // ---------- sales: lines = [{ id, qty }] ----------
  const completeSale = async (lines, method) => {
    if (USE_API) {
      const sale = await api.createSale(lines, method);
      // the backend already reduced the stock, so reload both
      const [p, s] = await Promise.all([api.getProducts(), api.getSales()]);
      setProducts(p);
      setSales(s);
      return sale;
    }
    const items = lines.map((l) => {
      const p = products.find((x) => x.id === l.id);
      return { id: p.id, name: p.name, emoji: p.emoji, qty: l.qty, price: p.price, cost: p.cost };
    });
    const sale = {
      id: Math.max(0, ...sales.map((s) => s.id)) + 1,
      method,
      date: new Date().toISOString(),
      items,
      total: sum(items, (i) => i.price * i.qty),
    };
    setProducts((l) => l.map((p) => {
      const it = items.find((i) => i.id === p.id);
      return it ? { ...p, qty: p.qty - it.qty } : p;
    }));
    setSales((s) => [sale, ...s]);
    return sale;
  };

  // ---------- suppliers ----------
  const saveSupplier = async (s) => {
    if (USE_API) {
      const saved = s.id ? await supplierApi.update(s.id, s) : await supplierApi.create(s);
      setSuppliers((l) => (s.id ? l.map((x) => (x.id === saved.id ? saved : x)) : [...l, saved]));
      return;
    }
    setSuppliers((l) => (s.id ? l.map((x) => (x.id === s.id ? s : x)) : [...l, { ...s, id: Date.now() }]));
  };
  const deleteSupplier = async (id) => {
    if (USE_API) await supplierApi.remove(id);
    setSuppliers((l) => l.filter((x) => x.id !== id));
  };

  // ---------- expenses ----------
  const addExpense = async (e) => {
    if (USE_API) {
      const saved = await api.createExpense(e);
      setExpenses((l) => [saved, ...l]);
      return;
    }
    setExpenses((l) => [{ ...e, id: Date.now() }, ...l]);
  };

  return (
    <Ctx.Provider value={{
      user, login, register, logout, updateProfile, changePassword, loading, error,
      products, saveProduct, deleteProduct,
      sales, completeSale,
      expenses, addExpense,
      suppliers, saveSupplier, deleteSupplier,
      alerts, readIds, isRead, unread, markRead, markAllRead,
    }}>
      {children}
    </Ctx.Provider>
  );
}
