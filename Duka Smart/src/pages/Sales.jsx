import { useState } from "react";
import { useApp, isOut } from "../context/AppContext.jsx";

const TABS = ["All", "Grocery", "Drinks", "Bakery", "Household"];

export default function Sales() {
  const { products, sales, completeSale, loading } = useApp();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({}); // { productId: qty }
  const [method, setMethod] = useState("M-Pesa");
  const [msg, setMsg] = useState(null);

  const shown = products.filter(
    (p) =>
      (tab === "All" || p.category === tab) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );
  const lines = Object.keys(cart).map((id) => ({ ...products.find((p) => p.id === Number(id)), qty: cart[id] }));
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const nextId = Math.max(0, ...sales.map((s) => s.id)) + 1;

  // A sale cannot exceed available stock
  const add = (p) => {
    const have = cart[p.id] || 0;
    if (have < p.qty) setCart({ ...cart, [p.id]: have + 1 });
  };
  const change = (p, d) => {
    const n = (cart[p.id] || 0) + d;
    const next = { ...cart };
    if (n <= 0) delete next[p.id];
    else if (n <= p.qty) next[p.id] = n;
    setCart(next);
  };

  // Barcode scanners type the code and press Enter: add the matching product straight to the sale
  const onSearchKey = (e) => {
    if (e.key !== "Enter" || !search.trim()) return;
    const q = search.trim().toLowerCase();
    const hit =
      products.find((p) => p.barcode === search.trim() || p.sku.toLowerCase() === q || p.name.toLowerCase() === q) ||
      (shown.length === 1 ? shown[0] : null);
    if (hit && !isOut(hit)) {
      add(hit);
      setSearch("");
    }
  };

  const complete = async () => {
    if (!lines.length) return;
    try {
      await completeSale(lines.map((l) => ({ id: l.id, qty: l.qty })), method);
      setCart({});
      setMsg({ ok: true, text: `Sale #${nextId} completed. Stock updated.` });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
  };

  return (
    <>
      <div className="top">
        <div>
          <h1>New sale</h1>
          <p className="muted">Tap products to add them, or scan a barcode. Pick how the customer pays.</p>
        </div>
      </div>

      {msg && <div className={"banner" + (msg.ok ? " ok" : "")}>{msg.text}</div>}

      <div className="pos">
        <div>
          <input className="search" placeholder="Search or scan a product" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={onSearchKey} />
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="prods">
            {shown.map((p) => (
              <button key={p.id} className={"prod" + (cart[p.id] ? " picked" : "")} disabled={isOut(p)} onClick={() => add(p)}>
                <span>{p.emoji}</span>
                <b>{p.name}</b>
                <div className="row nb"><b className="green">KES {p.price}</b><small className="muted">{p.qty} in stock</small></div>
              </button>
            ))}
          </div>
          {shown.length === 0 && <p className="muted">{loading ? "Loading products..." : "No products found."}</p>}
        </div>

        <div className="card">
          <div className="row"><b>Current sale</b><span className="muted">#{nextId}</span></div>
          {lines.length === 0 && <p className="muted" style={{ padding: "12px 0" }}>No items yet.</p>}
          {lines.map((l) => (
            <div className="row" key={l.id}>
              <span>{l.emoji} <b>{l.name}</b><br /><small className="muted">KES {l.price} each</small></span>
              <span className="qty">
                <button onClick={() => change(l, -1)}>−</button>{l.qty}<button onClick={() => change(l, 1)}>+</button>
              </span>
              <b>{l.price * l.qty}</b>
            </div>
          ))}
          <div className="row"><b>Total</b><span className="total">KES {total.toLocaleString()}</span></div>
          <div className="pay">
            {["Cash", "M-Pesa", "Card"].map((m) => (
              <button key={m} className={m === method ? "on" : ""} onClick={() => setMethod(m)}>{m}</button>
            ))}
          </div>
          <button className="btn full big" onClick={complete} disabled={!lines.length}>
            Complete sale{total ? ` · KES ${total.toLocaleString()}` : ""}
          </button>
          <small className="muted">Stock updates automatically when you complete the sale.</small>
        </div>
      </div>
    </>
  );
}
