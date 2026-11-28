import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import { Icon } from "../components/Icons";
import { useShop } from "../useShop";
import { getUser } from "../api";
import { formatKES } from "../utils/formatMoney";
import { productIcon, timeAgo } from "../utils/productIcon";

const shortCode = (n) => "#" + n.replace("SALE-", "").slice(0, 5);
const when = (iso) => new Date(iso + "Z");
const sameDay = (d, e) => d.toDateString() === e.toDateString();
const sum = (list, key) => list.reduce((s, x) => s + x[key], 0);

// round the chart's top up to a tidy number (1k, 2k, 5k, 10k, 20k, 50k ...)
function niceMax(v) {
  if (v <= 0) return 1000;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}
const kLabel = (v) => (v >= 1000 ? v / 1000 + "k" : String(v));

function Dashboard() {
  const shop = useShop();
  const user = getUser();
  const now = new Date();

  if (shop.loading) return <PageSkeleton active="Dashboard" kind="dashboard" />;

  const salesOn = (day) => shop.sales.filter((x) => sameDay(when(x.createdAt), day));
  const spentOn = (day) => sum(shop.expenses.filter((x) => sameDay(when(x.createdAt), day)), "amount");

  const salesToday = salesOn(now);
  const salesTotal = sum(salesToday, "total");
  const spentToday = spentOn(now);
  const buying = {};
  shop.products.forEach((p) => (buying[p.id] = p.buying));
  const costToday = salesToday.reduce((s, x) => s + x.items.reduce((c, i) => c + (buying[i.productId] || 0) * i.quantity, 0), 0);
  const profitToday = salesTotal - costToday - spentToday;

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yTotal = sum(salesOn(yesterday), "total");
  const change = yTotal > 0 ? Math.round(((salesTotal - yTotal) / yTotal) * 100) : null;
  const ySpent = spentOn(yesterday);
  const spentChange = ySpent > 0 ? Math.round(((spentToday - ySpent) / ySpent) * 100) : null;

  const week = [];
  for (let n = 6; n >= 0; n--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n);
    week.push({ label: day.toLocaleDateString([], { weekday: "short" }), sales: sum(salesOn(day), "total"), spent: spentOn(day), today: n === 0 });
  }
  const top = niceMax(Math.max(...week.map((d) => Math.max(d.sales, d.spent))));
  const ticks = [0, 1, 2, 3].map((i) => (top / 3) * i).reverse();

  const lowStock = shop.products
    .filter((p) => p.quantity <= p.threshold)
    .sort((a, b) => a.quantity / (a.threshold || 1) - b.quantity / (b.threshold || 1));
  const needReorder = lowStock.filter((p) => p.quantity === 0).length;
  const recent = shop.sales.slice(0, 4);
  const firstName = (user.username || "there").split(" ")[0];

  const trendPill = (v, goodWhenUp) =>
    v === null ? <span className="pill">No data for yesterday</span> : (
      <span className={"pill" + (goodWhenUp ? (v >= 0 ? "" : " amber") : v > 0 ? " amber" : "")}>
        {v >= 0 ? "▲" : "▼"} {Math.abs(v)}% vs yesterday
      </span>
    );

  return (
    <div className="dash">
      <TopNav active="Dashboard" />

      <main className="dash-main">
        <div className="page-head">
          <div>
            <h1>Habari, {firstName}</h1>
            <p>Here is how {user.business || "your shop"} is doing today.</p>
          </div>
          <div className="page-actions">
            <Link to="/expenses" className="ghost-btn"><Icon name="plus" />Add expense</Link>
            <Link to="/sales" className="solid-btn"><Icon name="sales" />New sale</Link>
          </div>
        </div>

        <Status error={shop.error} />

        {lowStock.length > 0 && (
          <Link to="/low-stock" className="alert-banner">
            <span className="kcard-ic amber"><Icon name="alert" className="" /></span>
            <span><b>{lowStock.length} {lowStock.length === 1 ? "item is" : "items are"} low</b><small>{lowStock.slice(0, 2).map((p) => p.name).join(" and ")} {lowStock.length > 2 ? "and more " : ""}need reordering</small></span>
          </Link>
        )}

        <section className="kpi-grid" aria-label="Today">
          <div className="card2 kcard">
            <div className="kcard-top">Today's sales<span className="kcard-ic"><Icon name="sales" className="" /></span></div>
            <strong>{formatKES(salesTotal)}</strong>
            {trendPill(change, true)}
          </div>
          <div className="card2 kcard">
            <div className="kcard-top">Expenses<span className="kcard-ic"><Icon name="expenses" className="" /></span></div>
            <strong>{formatKES(spentToday)}</strong>
            {trendPill(spentChange, false)}
          </div>
          <div className="card2 kcard">
            <div className="kcard-top">Profit today<span className="kcard-ic"><Icon name="reports" className="" /></span></div>
            <strong>{formatKES(profitToday)}</strong>
            <span className="pill">After stock cost and expenses</span>
          </div>
          <div className="card2 kcard">
            <div className="kcard-top">Low-stock items<span className="kcard-ic amber"><Icon name="alert" className="" /></span></div>
            <strong>{lowStock.length} {lowStock.length === 1 ? "product" : "products"}</strong>
            <span className="pill amber">{needReorder > 0 ? needReorder + " out of stock" : lowStock.length > 0 ? "Reorder soon" : "All stocked up"}</span>
          </div>
        </section>

        <section className="dash-grid">
          <div className="card2 pcard">
            <div className="pcard-head">
              <h2>Sales and expenses this week</h2>
              <div className="legend"><span><i style={{ background: "var(--leaf)" }} />Sales</span><span><i style={{ background: "var(--amber)" }} />Expenses</span></div>
            </div>
            <p className="pcard-sub">KES thousands</p>
            <div className="chart2" role="img" aria-label="Sales and expenses for the last 7 days">
              <div className="chart2-grid" aria-hidden="true">
                {ticks.map((t, i) => (
                  <div key={i} style={{ top: (i / 3) * 100 + "%" }}><span>{kLabel(Math.round(t))}</span></div>
                ))}
              </div>
              <div className="chart2-cols">
                {week.map((d) => (
                  <div className="chart2-col" key={d.label + d.today}>
                    <div className="chart2-bars">
                      <i className={"s" + (d.today ? " today" : "")} style={{ height: (d.sales / top) * 100 + "%" }} title={formatKES(d.sales)} />
                      <i className="e" style={{ height: (d.spent / top) * 100 + "%" }} title={formatKES(d.spent)} />
                    </div>
                    <small>{d.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card2 pcard">
            <div className="pcard-head"><h2>Low-stock alerts</h2><Link to="/low-stock" className="link-sm">View all</Link></div>
            {lowStock.length === 0 && <p className="empty2">Nothing is running low.</p>}
            {lowStock.slice(0, 4).map((p) => (
              <div className="alert-row" key={p.id}>
                <span className="emoji-tile">{productIcon(p)}</span>
                <div><b>{p.name}</b><small>{p.quantity === 0 ? "Out of stock" : p.quantity + " left"} · reorder at {p.threshold}</small></div>
                <span className={"pill " + (p.quantity === 0 ? "red" : "amber")}>{p.quantity === 0 ? "Out" : "Low"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card2 pcard">
          <div className="pcard-head"><h2>Recent sales</h2><Link to="/transactions" className="link-sm">View all</Link></div>
          {recent.length === 0 && <p className="empty2">No sales yet. <Link to="/sales" className="link-sm">Record the first one</Link>.</p>}
          <div className="sale-cols">
            {recent.map((s) => {
              const count = s.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <div className="sale-line" key={s.id}>
                  <div><b>Sale {shortCode(s.number)}</b><small>{count} {count === 1 ? "item" : "items"} · {timeAgo(when(s.createdAt))}</small></div>
                  <span className="pill">{s.payment}</span>
                  <span className="amt">{formatKES(s.total)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
