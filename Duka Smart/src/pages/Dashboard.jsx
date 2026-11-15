import { Link } from "react-router-dom";
import { useApp, isLow, isOut } from "../context/AppContext.jsx";
import { kes, sum, sameDay, daysBack, fmtTime, saleCost, pctChange } from "../utils";

const trend = (now, before, goodWhenUp) => {
  const c = pctChange(now, before);
  if (c === null) return ["No data yesterday", ""];
  const up = c >= 0;
  return [`${up ? "▲" : "▼"} ${Math.abs(c)}% vs yesterday`, up === goodWhenUp ? "" : "warn"];
};

export default function Dashboard() {
  const { user, products, sales, expenses, loading } = useApp();
  const now = new Date();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);

  const salesOn = (d) => sales.filter((s) => sameDay(s.date, d));
  const expOn = (d) => sum(expenses.filter((e) => sameDay(e.date, d)), (e) => e.amount);

  const rev = sum(salesOn(now), (s) => s.total);
  const revY = sum(salesOn(yest), (s) => s.total);
  const exp = expOn(now);
  const expY = expOn(yest);
  const profit = rev - sum(salesOn(now), saleCost) - exp; // revenue - cost of goods - expenses
  const lowList = products.filter((p) => isLow(p) || isOut(p)).sort((a, b) => a.qty - b.qty);

  const week = daysBack(7).map((d) => ({
    label: d.toLocaleDateString("en", { weekday: "short" }),
    s: sum(salesOn(d), (x) => x.total),
    e: expOn(d),
  }));
  const max = Math.max(1, ...week.map((w) => Math.max(w.s, w.e)));

  const [salesNote, salesTone] = trend(rev, revY, true);
  const [expNote, expTone] = trend(exp, expY, false);
  const kpis = [
    ["Today's sales", kes(rev), salesNote, salesTone],
    ["Expenses", kes(exp), expNote, expTone],
    ["Profit today", kes(profit), "After stock cost and expenses", profit < 0 ? "warn" : ""],
    ["Low-stock items", `${lowList.length} products`, "Need reordering", "warn"],
  ];

  return (
    <>
      <div className="top">
        <div>
          <h1>Habari, {user.name}</h1>
          <p className="muted">{loading ? "Loading your shop..." : `Here is how ${user.shop} is doing today.`}</p>
        </div>
        <div className="actions">
          <Link to="/expenses" className="btn out">+ Add expense</Link>
          <Link to="/sales" className="btn">New sale</Link>
        </div>
      </div>

      <div className="kpis">
        {kpis.map(([label, value, note, tone]) => (
          <div className="card" key={label}>
            <span className="muted">{label}</span>
            <b>{value}</b>
            <span className={"chip " + tone}>{note}</span>
          </div>
        ))}
      </div>

      <div className="two">
        <div className="card">
          <div className="row nb">
            <b>Sales and expenses this week</b>
            <span className="legend"><i className="s" />Sales <i className="x" />Expenses</span>
          </div>
          <div className="wk">
            {week.map((w, i) => (
              <div key={i}>
                <span className="pair">
                  <i style={{ height: (w.s / max) * 100 + "%", background: i === 6 ? "var(--em)" : undefined }} />
                  <i className="x" style={{ height: (w.e / max) * 100 + "%" }} />
                </span>
                {w.label}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row"><b>Low-stock alerts</b><Link to="/inventory">View all</Link></div>
          {lowList.length === 0 && <p className="muted" style={{ paddingTop: 12 }}>Everything is well stocked.</p>}
          {lowList.slice(0, 5).map((p) => (
            <div className="row" key={p.id}>
              <span>{p.emoji} <b>{p.name}</b><br />
                <small className="muted">{isOut(p) ? "Out of stock" : `${p.qty} left`} · reorder at {p.minStock}</small>
              </span>
              <span className={"chip " + (isOut(p) ? "out" : "low")}>{isOut(p) ? "Out" : "Low"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row"><b>Recent sales</b><Link to="/transactions">View all</Link></div>
        {sales.slice(0, 4).map((s) => (
          <div className="row" key={s.id}>
            <span>Sale #{s.id} <small className="muted">· {s.items.length} items · {fmtTime(s.date)}</small></span>
            <span className="chip">{s.method}</span>
            <b>{kes(s.total)}</b>
          </div>
        ))}
      </div>
    </>
  );
}
