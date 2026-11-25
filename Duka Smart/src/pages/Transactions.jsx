import { Fragment, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { kes, sum, fmtDate, fmtTime, saleCost, downloadCsv, isoDay } from "../utils";

const METHODS = ["All", "Cash", "M-Pesa", "Card"];

export default function Transactions() {
  const { sales } = useApp();
  const [method, setMethod] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null); // id of the expanded sale

  const shown = sales
    .filter((s) => (method === "All" || s.method === method) && String(s.id).includes(q.replace("#", "").trim()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = sum(shown, (s) => s.total);

  // One row per sale, for Excel or Google Sheets. It exports what is on screen (the current filter).
  const exportCsv = () =>
    downloadCsv(`transactions-${isoDay(new Date())}.csv`, [
      ["Sale number", "Date", "Time", "Payment method", "Items", "Total (KES)", "Cost of goods (KES)", "Profit (KES)"],
      ...shown.map((s) => [
        s.id,
        isoDay(s.date),
        fmtTime(s.date),
        s.method,
        s.items.map((i) => `${i.name} x${i.qty}`).join("; "),
        s.total,
        saleCost(s),
        s.total - saleCost(s),
      ]),
    ]);

  return (
    <>
      <div className="top">
        <div>
          <h1>Transactions</h1>
          <p className="muted">Every sale you have recorded. Tap a row to see what was sold.</p>
        </div>
        <button className="btn out" onClick={exportCsv} disabled={shown.length === 0}>Export CSV</button>
      </div>

      <div className="kpis">
        <div className="card"><span className="muted">Transactions</span><b>{shown.length}</b></div>
        <div className="card"><span className="muted">Total sales</span><b>{kes(total)}</b></div>
        <div className="card"><span className="muted">Average sale</span><b>{kes(shown.length ? total / shown.length : 0)}</b></div>
      </div>

      <div className="filters">
        <div className="tabs" style={{ margin: 0 }}>
          {METHODS.map((m) => (
            <button key={m} className={m === method ? "on" : ""} onClick={() => setMethod(m)}>{m}</button>
          ))}
        </div>
        <input className="search" style={{ maxWidth: 240, margin: 0 }} placeholder="Search sale number" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card" style={{ overflowX: "auto", marginTop: 12 }}>
        <table>
          <thead><tr><th>SALE</th><th>DATE</th><th>ITEMS</th><th>PAYMENT</th><th style={{ textAlign: "right" }}>TOTAL</th></tr></thead>
          <tbody>
            {shown.map((s) => (
              <Fragment key={s.id}>
                <tr className="click" onClick={() => setOpen(open === s.id ? null : s.id)}>
                  <td><b>#{s.id}</b></td>
                  <td className="muted">{fmtDate(s.date)}, {fmtTime(s.date)}</td>
                  <td>{s.items.length} {open === s.id ? "▴" : "▾"}</td>
                  <td><span className="chip">{s.method}</span></td>
                  <td style={{ textAlign: "right" }}><b>{kes(s.total)}</b></td>
                </tr>
                {open === s.id && (
                  <tr className="detail">
                    <td colSpan="5">
                      {s.items.map((i, n) => (
                        <div className="row" key={n}>
                          <span>
                            {i.emoji} {i.name} <small className="muted">· {i.qty} × KES {i.price}</small>
                            {i.description && <><br /><small className="muted">{i.description}</small></>}
                          </span>
                          <b>{kes(i.qty * i.price)}</b>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {shown.length === 0 && <tr><td colSpan="5" className="muted">No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
