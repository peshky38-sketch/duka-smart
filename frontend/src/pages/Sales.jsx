import { useState } from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import Status from "../components/Status";
import { useToast } from "../components/Toast";
import PayIcon from "../components/PayIcon";
import { useShop } from "../useShop";
import { post } from "../api";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Sales.css";

const PAYMENTS = ["Cash", "M-Pesa", "Card"];

function Sales() {
  const shop = useShop();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("Cash");
  const [received, setReceived] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [sheet, setSheet] = useState(false);

  const products = shop.products;
  const categories = ["All", ...shop.categories.map((c) => c.name)];
  const tone = (p) => 1 + (shop.categories.findIndex((c) => c.id === p.categoryId) % 6);

  const shown = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  const qtyInCart = (id) => (cart.find((i) => i.id === id) || { qty: 0 }).qty;

  function addToCart(p) {
    if (p.quantity === 0) return;
    if (qtyInCart(p.id) >= p.quantity) {
      toast("Only " + p.quantity + " of " + p.name + " in stock", "error");
      return;
    }
    setCart((c) =>
      c.find((i) => i.id === p.id)
        ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { id: p.id, name: p.name, price: p.selling, qty: 1, stock: p.quantity }]
    );
  }

  function changeQty(id, by) {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, i.qty + by) } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const cash = Number(received) || 0;
  const change = cash - total;
  const quick = [...new Set([total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000])].filter((n) => n > 0);

  async function charge() {
    if (cart.length === 0) return;
    if (payment === "Cash" && received !== "" && cash < total) {
      toast("Cash received is less than the total", "error");
      return;
    }
    setSaving(true);
    try {
      const sale = await post("/api/sales", {
        payment_method: payment,
        items: cart.map((i) => ({ product_id: i.id, quantity: i.qty })),
      });
      setReceipt({
        number: sale.sale_number,
        total,
        payment,
        items: cart,
        change: payment === "Cash" && received !== "" ? change : null,
        time: new Date(),
      });
      setCart([]);
      setReceived("");
      setSheet(false);
      toast("Sale recorded · " + formatKES(total));
      await shop.reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const todayKey = new Date().toDateString();
  const todays = shop.sales.filter((x) => new Date(x.createdAt + "Z").toDateString() === todayKey);
  const todaysTotal = todays.reduce((s, x) => s + x.total, 0);
  const average = todays.length ? Math.round(todaysTotal / todays.length) : 0;
  const byPay = {};
  todays.forEach((x) => (byPay[x.payment] = (byPay[x.payment] || 0) + 1));
  const payNote = Object.entries(byPay).map(([m, n]) => m + " " + n).join(" · ") || "No sales yet";

  return (
    <div className="dash">
      <TopNav active="Sales" />

      <main className="dash-main">
        <Status loading={shop.loading} error={shop.error} />

        <div className="dash-top">
          <div>
            <h1>New sale</h1>
            <p className="dash-sub">Tap a product to add it, then take the payment.</p>
          </div>
        </div>

        <section className="kpis compact" aria-label="Today">
          <div className="kpi primary">
            <span className="k-label">Sales today</span>
            <strong>{formatKES(todaysTotal)}</strong>
            <span className="k-note">{todays.length} {todays.length === 1 ? "sale" : "sales"} so far</span>
          </div>
          <div className="kpi">
            <span className="k-label">Average sale</span>
            <strong>{formatKES(average)}</strong>
            <span className="k-note">Per customer today</span>
          </div>
          <div className="kpi">
            <span className="k-label">Paid by</span>
            <strong className="k-small">{payNote}</strong>
            <span className="k-note">Sales by payment method</span>
          </div>
          <div className="kpi">
            <span className="k-label">In this sale</span>
            <strong>{itemCount}</strong>
            <span className="k-note">{itemCount === 0 ? "Nothing added yet" : formatKES(total) + " so far"}</span>
          </div>
        </section>

        <div className="till">
          <section className="panel picker">
            <div className="picker-top">
              <input className="t-search" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="chips">
              {categories.map((c) => (
                <button key={c} className={c === category ? "chip on" : "chip"} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>

            <div className="tiles">
              {shown.map((p) => {
                const n = qtyInCart(p.id);
                const out = p.quantity === 0;
                return (
                  <button
                    key={p.id}
                    className={"tile" + (out ? " out" : "") + (n ? " picked" : "")}
                    onClick={() => addToCart(p)}
                    disabled={out}
                  >
                    {n > 0 && <span className="q">{n}</span>}
                    <i className={"dot tone" + tone(p)} />
                    <strong>{p.name}</strong>
                    <span className="p">{formatKES(p.selling)}</span>
                    <small>{out ? "Out of stock" : p.quantity <= p.threshold ? p.quantity + " left" : p.quantity + " in stock"}</small>
                  </button>
                );
              })}
              {!shop.loading && shown.length === 0 && <p className="empty">No products match.</p>}
            </div>
          </section>

          <aside className={"cart" + (sheet ? " open" : "")}>
            <button className="sheet-close" onClick={() => setSheet(false)} aria-label="Close">Close</button>
            <h2>Current sale {itemCount > 0 && <span className="count">{itemCount}</span>}</h2>

            <div className="lines">
              {cart.length === 0 && <p className="no-items">Nothing added yet.<br />Tap a product to start.</p>}
              {cart.map((i) => (
                <div className="cart-line" key={i.id}>
                  <div>
                    <strong>{i.name}</strong>
                    <small>{formatKES(i.price)} each</small>
                  </div>
                  <div className="qty">
                    <button onClick={() => changeQty(i.id, -1)}>−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => changeQty(i.id, 1)}>+</button>
                  </div>
                  <b>{formatKES(i.price * i.qty)}</b>
                </div>
              ))}
            </div>

            <div className="total"><span>Total</span><strong>{formatKES(total)}</strong></div>

            <div className="pay-grid" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map((m) => (
                <button key={m} role="radio" aria-checked={m === payment} className={m === payment ? "pay-opt on" : "pay-opt"} onClick={() => setPayment(m)}>
                  <span className="pay-art"><PayIcon method={m} /></span>
                  <span className="pay-name">{m}</span>
                </button>
              ))}
            </div>

            {payment === "Cash" && total > 0 && (
              <div className="cash">
                <div className="quick">
                  {quick.map((q) => (
                    <button key={q} onClick={() => setReceived(String(q))} className={cash === q ? "on" : ""}>{q === total ? "Exact" : q.toLocaleString()}</button>
                  ))}
                </div>
                <input type="number" min="0" placeholder="Cash received" value={received} onChange={(e) => setReceived(e.target.value)} />
                {received !== "" && (
                  <div className={"change" + (change < 0 ? " short" : "")}>
                    {change >= 0 ? "Change " : "Still owed "}<b>{formatKES(Math.abs(change))}</b>
                  </div>
                )}
              </div>
            )}

            <button className="charge" onClick={charge} disabled={saving || cart.length === 0}>
              {saving ? "Recording..." : cart.length === 0 ? "Add a product" : "Charge " + formatKES(total)}
            </button>
          </aside>
        </div>

        {sheet && <div className="sheet-backdrop" onClick={() => setSheet(false)} />}

        {cart.length > 0 && !sheet && (
          <button className="cartbar" onClick={() => setSheet(true)}>
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <b>{formatKES(total)}</b>
            <span className="go">Review</span>
          </button>
        )}

        <div className="panel today-panel">
          <div className="g-head"><h2>Today's sales</h2><Link to="/transactions" className="g-link">See all</Link></div>
          {todays.length === 0 && <p className="empty">No sales yet today.</p>}
          {todays.length > 0 && (
            <table className="stack">
              <thead>
                <tr><th>Sale</th><th>Items</th><th>Payment</th><th>Total</th><th>Time</th></tr>
              </thead>
              <tbody>
                {todays.map((s) => (
                  <tr key={s.id}>
                    <td data-label="Sale">#{s.number.replace("SALE-", "").slice(0, 5)}</td>
                    <td data-label="Items">{s.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td data-label="Payment">{s.payment}</td>
                    <td data-label="Total">{formatKES(s.total)}</td>
                    <td data-label="Time">{new Date(s.createdAt + "Z").toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Footer />

      {receipt && (
        <div className="overlay" onClick={() => setReceipt(null)}>
          <div className="modal receipt" onClick={(e) => e.stopPropagation()}>
            <svg className="tick" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" /><path d="M23 37l9 9 18-20" /></svg>
            <h2>Sale complete</h2>
            <p className="dash-sub">#{receipt.number.replace("SALE-", "").slice(0, 5)} · {receipt.time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
            <div className="r-pay"><PayIcon method={receipt.payment} /><span>Paid by {receipt.payment}</span></div>
            <div className="r-lines">
              {receipt.items.map((i) => (
                <div key={i.id}><span>{i.name} × {i.qty}</span><b>{formatKES(i.price * i.qty)}</b></div>
              ))}
            </div>
            <div className="r-total"><span>Total</span><strong>{formatKES(receipt.total)}</strong></div>
            {receipt.change !== null && receipt.change >= 0 && <div className="change">Give back <b>{formatKES(receipt.change)}</b></div>}
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => window.print()}>Print</button>
              <button className="add-btn" onClick={() => setReceipt(null)}>New sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;
