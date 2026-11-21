import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { kes, fmtDate, fmtTime } from "../utils";

const TABS = [["All", null], ["Out of stock", "out"], ["Low stock", "low"], ["Sales", "sale"]];

export default function Notifications() {
  const { alerts, isRead, unread, markRead, markAllRead } = useApp();
  const [tab, setTab] = useState("All");

  const kind = TABS.find(([label]) => label === tab)[1];
  const shown = alerts.filter((a) => !kind || a.kind === kind);

  return (
    <>
      <div className="top">
        <div>
          <h1>Notifications</h1>
          <p className="muted">{unread > 0 ? `${unread} new notification${unread === 1 ? "" : "s"}.` : "You are all caught up."}</p>
        </div>
        <button className="btn out" onClick={markAllRead} disabled={unread === 0}>Mark all as read</button>
      </div>

      <div className="tabs">
        {TABS.map(([label]) => (
          <button key={label} className={label === tab ? "on" : ""} onClick={() => setTab(label)}>{label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {shown.length === 0 && <p className="muted" style={{ padding: 18 }}>Nothing here yet.</p>}
        {shown.map((a) => {
          const isNew = !isRead(a);

          if (a.kind === "sale") {
            const s = a.sale;
            return (
              <div className={"notif" + (isNew ? " unread" : "")} key={a.id}>
                <span className="ico">💰</span>
                <div className="grow">
                  <b>Sale #{s.id} completed</b><br />
                  <small className="muted">{s.items.length} item{s.items.length === 1 ? "" : "s"} · {s.method} · {fmtDate(s.date)}, {fmtTime(s.date)}</small>
                </div>
                <b>{kes(s.total)}</b>
                <div className="actions">
                  <Link className="btn out" to="/transactions">View</Link>
                  {isNew && <button className="link" onClick={() => markRead(a.id)}>Mark as read</button>}
                </div>
              </div>
            );
          }

          const p = a.product;
          return (
            <div className={"notif" + (isNew ? " unread" : "")} key={a.id}>
              <span className="ico">{a.kind === "out" ? "🚫" : "⚠️"}</span>
              <div className="grow">
                <b>{p.emoji} {p.name} {a.kind === "out" ? "is out of stock" : "is running low"}</b><br />
                <small className="muted">{p.qty === 0 ? "None left" : `${p.qty} left`} · reorder at {p.minStock}</small>
              </div>
              <span className={"chip " + a.kind}>{a.kind === "out" ? "Out" : "Low"}</span>
              <div className="actions">
                <Link className="btn out" to="/suppliers">Reorder</Link>
                {isNew && <button className="link" onClick={() => markRead(a.id)}>Mark as read</button>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
