import { useEffect, useRef, useState } from "react";
import TopNav from "../components/TopNav";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import BarcodeScanner from "../components/BarcodeScanner";
import { Icon } from "../components/Icons";
import { useToast } from "../components/Toast";
import PayIcon from "../components/PayIcon";
import { useShop } from "../useShop";
import { post, mpesaPush, mpesaStatus } from "../api";
import { formatKES } from "../utils/formatMoney";
import { productIcon } from "../utils/productIcon";

const PAYMENTS = [
  { name: "Cash", icon: "cash" },
  { name: "M-Pesa", icon: "phone" },
  { name: "Card", icon: "card" },
];
const HELD_KEY = "duka_held_sales";
const readHeld = () => {
  try { return JSON.parse(localStorage.getItem(HELD_KEY) || "[]"); } catch { return []; }
};

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
  const [phone, setPhone] = useState("");
  // null, or { id, status: "waiting" | "failed", message }
  const [mpesa, setMpesa] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [held, setHeld] = useState(readHeld);
  const [showHeld, setShowHeld] = useState(false);
  const cartRef = useRef(null);

  const products = shop.products;
  const categories = ["All", ...shop.categories.map((c) => c.name)];

  const shown = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
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
        : [...c, { id: p.id, name: p.name, price: p.selling, qty: 1, stock: p.quantity, icon: productIcon(p) }]
    );
  }

  function changeQty(id, by) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, i.qty + by) } : i)).filter((i) => i.qty > 0));
  }

  // a scanned barcode adds the product whose SKU matches
  function onScanned(code) {
    setScanning(false);
    const p = products.find((x) => x.sku.toLowerCase() === code.toLowerCase());
    if (p) {
      addToCart(p);
      toast(p.name + " added");
    } else {
      toast("No product with the code " + code, "error");
    }
  }

  function holdSale() {
    if (cart.length === 0) return;
    const next = [...held, { id: Date.now(), at: new Date().toISOString(), cart }];
    localStorage.setItem(HELD_KEY, JSON.stringify(next));
    setHeld(next);
    setCart([]);
    toast("Sale put on hold");
  }

  function resumeSale(h) {
    if (cart.length > 0) {
      toast("Finish or hold the current sale first", "error");
      return;
    }
    // use today's stock levels, drop anything that has sold out meanwhile
    const live = h.cart
      .map((i) => {
        const p = products.find((x) => x.id === i.id);
        return p ? { ...i, price: p.selling, stock: p.quantity, qty: Math.min(i.qty, p.quantity) } : null;
      })
      .filter((i) => i && i.qty > 0);
    setCart(live);
    dropHeld(h.id);
    setShowHeld(false);
  }

  function dropHeld(id) {
    const next = held.filter((h) => h.id !== id);
    localStorage.setItem(HELD_KEY, JSON.stringify(next));
    setHeld(next);
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const cash = Number(received) || 0;
  const change = cash - total;
  const quick = [...new Set([total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000])].filter((n) => n > 0);
  const saleNo = 1001 + shop.sales.length;

  // sends the prompt to the customer's phone, then the effect below waits for the answer
  async function charge() {
    if (cart.length === 0) return;
    if (payment === "Cash" && received !== "" && cash < total) {
      toast("Cash received is less than the total", "error");
      return;
    }
    if (payment !== "M-Pesa") return recordSale();

    if (!/^(\+?254|0)[17]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
      toast("Enter the customer's Safaricom number, like 0712345678", "error");
      return;
    }
    setSaving(true);
    try {
      const sent = await mpesaPush(phone, total);
      setMpesa({ id: sent.checkout_request_id, status: "waiting", message: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function recordSale() {
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
      toast("Sale recorded · " + formatKES(total));
      await shop.reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  // while a prompt is waiting, ask every 3 seconds whether the customer has paid (gives up after 90 seconds)
  const recordRef = useRef(recordSale);
  recordRef.current = recordSale;
  const waitingId = mpesa && mpesa.status === "waiting" ? mpesa.id : null;
  useEffect(() => {
    if (!waitingId) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const r = await mpesaStatus(waitingId);
        if (r.state === "paid") {
          clearInterval(timer);
          setMpesa(null);
          recordRef.current();
        } else if (r.state === "failed") {
          clearInterval(timer);
          setMpesa({ id: waitingId, status: "failed", message: r.message });
        }
      } catch {
        // a hiccup: keep trying until the time is up
      }
      if (tries >= 30) {
        clearInterval(timer);
        setMpesa({ id: waitingId, status: "failed", message: "No answer from the customer. Try again, or take cash." });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [waitingId]);

  if (shop.loading) return <PageSkeleton active="Sales" kind="till" />;

  return (
    <div className="dash">
      <TopNav active="Sales" />

      <main className="dash-main">
        <div className="page-head">
          <div>
            <h1>New sale</h1>
            <p>Tap products to add them. Pick how the customer pays.</p>
          </div>
          <div className="page-actions">
            <button className="ghost-btn" onClick={() => setShowHeld(true)}><Icon name="pause" />Held sales{held.length > 0 ? " (" + held.length + ")" : ""}</button>
          </div>
        </div>

        <Status error={shop.error} />

        <div className="sale-layout">
          <section>
            <div className="sale-search">
              <div className="box">
                <Icon name="search" className="" />
                <input placeholder="Search or scan a product" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
              </div>
              <button className="ghost-btn" onClick={() => setScanning(true)}><Icon name="scan" />Scan</button>
            </div>

            <div className="chipbar">
              {categories.map((c) => (
                <button key={c} className={"chip2" + (c === category ? " on" : "")} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>

            <div className="prod-grid">
              {shown.map((p) => {
                const n = qtyInCart(p.id);
                const out = p.quantity === 0;
                return (
                  <button key={p.id} className={"pcard2" + (n ? " picked" : "")} onClick={() => addToCart(p)} disabled={out}>
                    {n > 0 && <span className="q">{n}</span>}
                    <span className="pic">{productIcon(p)}</span>
                    <b>{p.name}</b>
                    <span className="row"><span className="price">{formatKES(p.selling)}</span><small>{out ? "Out of stock" : p.quantity + " in stock"}</small></span>
                  </button>
                );
              })}
            </div>
            {shown.length === 0 && <p className="empty2">{products.length === 0 ? "No products yet. Add some in Inventory." : "No products match."}</p>}
          </section>

          <aside className="card2 cart2" ref={cartRef}>
            <div className="cart2-head"><h2>Current sale</h2><span>#{saleNo}</span></div>

            {cart.length === 0 && <p className="cart2-empty">Nothing added yet.<br />Tap a product to start.</p>}
            {cart.map((i) => (
              <div className="cline" key={i.id}>
                <span className="emoji-tile">{i.icon}</span>
                <div className="nm"><b>{i.name}</b><small>{formatKES(i.price)} each</small></div>
                <div className="stepper">
                  <button onClick={() => changeQty(i.id, -1)} aria-label={"Fewer " + i.name}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => changeQty(i.id, 1)} aria-label={"More " + i.name}>+</button>
                </div>
                <b className="lt">{formatKES(i.price * i.qty).replace("KES ", "")}</b>
              </div>
            ))}

            <div className="cart2-total"><span>Total</span><strong>{formatKES(total)}</strong></div>

            <div className="paytabs" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map((m) => (
                <button key={m.name} role="radio" aria-checked={m.name === payment} className={m.name === payment ? "on" : ""} onClick={() => setPayment(m.name)}>
                  <Icon name={m.icon} className="" />{m.name}
                </button>
              ))}
            </div>

            {payment === "Cash" && total > 0 && (
              <div>
                <div className="quick2">
                  {quick.map((q) => (
                    <button key={q} onClick={() => setReceived(String(q))} className={cash === q ? "on" : ""}>{q === total ? "Exact" : q.toLocaleString()}</button>
                  ))}
                </div>
                <div className="field-sm"><input type="number" min="0" placeholder="Cash received" value={received} onChange={(e) => setReceived(e.target.value)} aria-label="Cash received" /></div>
                {received !== "" && <div className={"change2" + (change < 0 ? " short" : "")}>{change >= 0 ? "Change " : "Still owed "}<b>{formatKES(Math.abs(change))}</b></div>}
              </div>
            )}

            {payment === "M-Pesa" && total > 0 && (
              <div className="field-sm">
                <label htmlFor="mpesa-phone">Customer's M-Pesa number</label>
                <input id="mpesa-phone" type="tel" inputMode="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <small style={{ color: "var(--mute)" }}>They get a prompt on their phone and enter their PIN.</small>
              </div>
            )}

            <button className="solid-btn complete" onClick={charge} disabled={saving || cart.length === 0}>
              {saving ? (payment === "M-Pesa" ? "Sending prompt..." : "Recording...") : cart.length === 0 ? "Add a product" : payment === "M-Pesa" ? "Send M-Pesa prompt · " + formatKES(total) : "Complete sale · " + formatKES(total)}
            </button>
            {cart.length > 0 && (
              <div className="hold-row">
                <button className="ghost-btn" onClick={holdSale}><Icon name="pause" />Hold</button>
                <button className="ghost-btn" onClick={() => setCart([])}>Clear</button>
              </div>
            )}
            <p className="note">Stock updates automatically when you complete the sale.</p>
          </aside>
        </div>

        {cart.length > 0 && (
          <button className="mobile-cartbar" onClick={() => cartRef.current && cartRef.current.scrollIntoView({ behavior: "smooth" })}>
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span><span>{formatKES(total)}</span><span>Review</span>
          </button>
        )}
      </main>

      {scanning && <BarcodeScanner onDetected={onScanned} onClose={() => setScanning(false)} />}

      {showHeld && (
        <div className="overlay" onClick={() => setShowHeld(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Held sales</h2>
            {held.length === 0 && <p className="dash-sub">No sales on hold. Use Hold when a customer steps away.</p>}
            {held.map((h) => (
              <div className="sale-line" key={h.id}>
                <div>
                  <b>{h.cart.reduce((n, i) => n + i.qty, 0)} items · {formatKES(h.cart.reduce((s, i) => s + i.price * i.qty, 0))}</b>
                  <small>{h.cart.map((i) => i.name).join(", ")}</small>
                </div>
                <button className="solid-btn" onClick={() => resumeSale(h)}>Resume</button>
                <button className="ghost-btn" onClick={() => dropHeld(h.id)} aria-label="Discard held sale">✕</button>
              </div>
            ))}
            <div className="modal-buttons"><button className="cancel-btn" onClick={() => setShowHeld(false)}>Close</button></div>
          </div>
        </div>
      )}

      {mpesa && (
        <div className="overlay">
          <div className="modal mpesa-modal" onClick={(e) => e.stopPropagation()}>
            {mpesa.status === "waiting" ? (
              <>
                <span className="mpesa-spin" />
                <h2>Check the customer's phone</h2>
                <p className="dash-sub">A prompt for <b>{formatKES(total)}</b> was sent to {phone}. Ask them to enter their M-Pesa PIN.</p>
                <p className="dash-sub">Waiting for payment...</p>
              </>
            ) : (
              <>
                <h2>Payment not completed</h2>
                <p className="dash-sub">{mpesa.message}</p>
              </>
            )}
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setMpesa(null)}>{mpesa.status === "waiting" ? "Cancel" : "Close"}</button>
              {mpesa.status === "failed" && <button className="add-btn" onClick={() => { setMpesa(null); charge(); }}>Send again</button>}
            </div>
          </div>
        </div>
      )}

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
