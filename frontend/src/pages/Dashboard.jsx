import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Status from "../components/Status";
import { useToast } from "../components/Toast";
import { useShop } from "../useShop";
import { getUser } from "../api";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./DashboardGlass.css";

// "SALE-7986C51A3E" is too long to read, so show a short code
const shortCode = (n) => "#" + n.replace("SALE-", "").slice(0, 5);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const shop = useShop();
  const toast = useToast();
  const user = getUser();
  const [showRestock, setShowRestock] = useState(false);

  const when = (iso) => new Date(iso + "Z");
  const now = new Date();
  const sameDay = (d, e) => d.toDateString() === e.toDateString();

  const salesOn = (day) => shop.sales.filter((x) => sameDay(when(x.createdAt), day));
  const sum = (list, key) => list.reduce((s, x) => s + x[key], 0);

  const salesToday = salesOn(now);
  const salesTotal = sum(salesToday, "total");
  const spentToday = sum(shop.expenses.filter((x) => sameDay(when(x.createdAt), now)), "amount");
  const buying = {};
  shop.products.forEach((p) => (buying[p.id] = p.buying));
  const costToday = salesToday.reduce(
    (s, x) => s + x.items.reduce((c, i) => c + (buying[i.productId] || 0) * i.quantity, 0),
    0
  );
  const profitToday = salesTotal - costToday;

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yTotal = sum(salesOn(yesterday), "total");
  const change = yTotal > 0 ? Math.round(((salesTotal - yTotal) / yTotal) * 100) : null;

  const week = [];
  for (let n = 6; n >= 0; n--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n);
    week.push({ label: day.toLocaleDateString([], { weekday: "short" }), total: sum(salesOn(day), "total"), today: n === 0 });
  }
  const maxDay = Math.max(1, ...week.map((d) => d.total));

  const lowStock = shop.products
    .filter((p) => p.quantity <= p.threshold)
    .sort((a, b) => a.quantity / (a.threshold || 1) - b.quantity / (b.threshold || 1));
  const outCount = shop.products.filter((p) => p.quantity === 0).length;

  const recent = shop.sales.slice(0, 5);
  const firstName = (user.username || "there").split(" ")[0];

  function restockText() {
    return lowStock
      .map((p) => `${p.name}: ${p.quantity} left, buy about ${Math.max(1, p.threshold * 2 - p.quantity)} from ${p.supplier || "your supplier"}`)
      .join("\n");
  }

  async function copyList() {
    try {
      await navigator.clipboard.writeText(restockText());
      toast("Restock list copied");
    } catch {
      toast("Could not copy the list", "error");
    }
  }

  const initials = (user.username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="dash">
      <Sidebar active="Dashboard" />

      <main className="dash-main">
        <Status loading={shop.loading} error={shop.error} />

        <div className="dash-top">
          <div>
            <h1>{greeting()}, {firstName}</h1>
            <p className="dash-sub">
              {now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
              {user.business ? " · " + user.business : ""}
            </p>
          </div>
          <div className="g-actions">
            <Link to="/sales" className="pill-btn g-new">New sale</Link>
            <div className="avatar">{initials}</div>
          </div>
        </div>

        {!shop.loading && (
          <p className="g-sentence">
            {salesToday.length === 0 ? (
              <>No sales yet today. <Link to="/sales">Record the first one</Link>.</>
            ) : (
              <>Today you made <b>{formatKES(salesTotal)}</b> from {salesToday.length} {salesToday.length === 1 ? "sale" : "sales"}.</>
            )}{" "}
            {lowStock.length > 0 && <>{lowStock.length} {lowStock.length === 1 ? "item is" : "items are"} running low.</>}
          </p>
        )}

        <div className="g-hero">
          <div className="g-big">
            <span className="g-label">Sales today</span>
            <div className="g-number">{formatKES(salesTotal)}</div>
            {change !== null ? (
              <span className="g-badge">{change < 0 ? "Down " : "Up "}{Math.abs(change)}% on yesterday</span>
            ) : (
              <span className="g-badge">Last 7 days</span>
            )}
            <div className="g-spark">
              {week.map((d, i) => (
                <div className="g-col" key={d.label + i} title={d.label + ": " + formatKES(d.total)}>
                  <span className={d.today ? "today" : ""} style={{ height: Math.max(4, (d.total / maxDay) * 100) + "%" }} />
                  <small>{d.label}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="g-side">
            <div className="g-mini"><span>Profit today</span><strong>{formatKES(profitToday)}</strong></div>
            <div className="g-mini"><span>Spent today</span><strong>{formatKES(spentToday)}</strong></div>
            <div className="g-mini">
              <span>Products</span>
              <strong>{shop.products.length}{outCount > 0 && <em> · {outCount} out of stock</em>}</strong>
            </div>
          </div>
        </div>

        <div className="g-row">
          <div className="panel">
            <div className="g-head">
              <h2>Running low</h2>
              {lowStock.length > 0 && <button className="g-link" onClick={() => setShowRestock(true)}>Restock list</button>}
            </div>
            {lowStock.length === 0 && <p className="empty">Nothing is running low.</p>}
            {lowStock.slice(0, 6).map((p, i) => {
              const pct = Math.min(100, Math.round((p.quantity / Math.max(1, p.threshold * 2)) * 100));
              const out = p.quantity === 0;
              return (
                <div className="g-stock" key={p.id}>
                  <span>{p.name}</span>
                  <div className="g-meter"><i className={out ? "out" : "low"} style={{ width: Math.max(3, pct) + "%" }} /></div>
                  <span className={out ? "tag tag-out" : "tag tag-low"}>{out ? "Out" : p.quantity + " left"}</span>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="g-head"><h2>Latest sales</h2><Link to="/transactions" className="g-link">See all</Link></div>
            {recent.length === 0 && <p className="empty">Sales will show up here.</p>}
            {recent.map((s, i) => (
              <div className="g-sale" key={s.id}>
                <div>
                  <strong>{shortCode(s.number)} · {s.items.map((x) => x.name).join(", ")}</strong>
                  <small>{s.payment} · {when(s.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>
                </div>
                <b>{formatKES(s.total)}</b>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Link to="/sales" className="pill-btn g-fab">New sale</Link>

      {showRestock && (
        <div className="overlay" onClick={() => setShowRestock(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Restock list</h2>
            <p className="dash-sub">Enough to bring each item back to double its alert level.</p>
            <div className="g-restock">
              {lowStock.map((p) => (
                <div key={p.id}>
                  <span>{p.name}<small>{p.supplier}</small></span>
                  <b>+{Math.max(1, p.threshold * 2 - p.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowRestock(false)}>Close</button>
              <button className="add-btn" onClick={copyList}>Copy list</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
