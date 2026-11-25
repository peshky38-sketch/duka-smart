import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { kes } from "../utils";
import "../search.css";

const PAGES = [
  ["Dashboard", "/", "🏠"], ["Sales", "/sales", "🛒"], ["Inventory", "/inventory", "📦"], ["Transactions", "/transactions", "📜"],
  ["Expenses", "/expenses", "🧾"], ["Reports", "/reports", "📊"], ["Suppliers", "/suppliers", "🚚"],
  ["Notifications", "/notifications", "🔔"], ["Profile", "/profile", "👤"], ["Settings", "/settings", "⚙️"],
];

// Searches products, sales, suppliers and pages. Picking a result opens the right page.
export default function SearchBar() {
  const { products, sales, suppliers } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const num = t.replace("#", "");
    const out = [];
    products
      .filter((p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t) || (p.barcode || "").includes(t))
      .slice(0, 5)
      .forEach((p) => out.push({ key: "p" + p.id, group: "Products", icon: p.emoji, title: p.name, note: `${p.qty} in stock · ${kes(p.price)}`, to: "/inventory" }));
    if (/^\d+$/.test(num)) {
      sales
        .filter((s) => String(s.id).includes(num))
        .slice(0, 3)
        .forEach((s) => out.push({ key: "s" + s.id, group: "Sales", icon: "🧾", title: `Sale #${s.id}`, note: `${kes(s.total)} · ${s.method}`, to: "/transactions" }));
    }
    suppliers
      .filter((s) => s.name.toLowerCase().includes(t))
      .slice(0, 3)
      .forEach((s) => out.push({ key: "u" + s.id, group: "Suppliers", icon: "🚚", title: s.name, note: s.phone, to: "/suppliers" }));
    PAGES.filter(([name]) => name.toLowerCase().includes(t))
      .slice(0, 3)
      .forEach(([name, to, icon]) => out.push({ key: "g" + to, group: "Pages", icon, title: name, note: "Go to page", to }));
    return out;
  }, [q, products, sales, suppliers]);

  useEffect(() => setActive(0), [q]);

  // close when clicking anywhere else
  useEffect(() => {
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const go = (r) => {
    nav(r.to);
    setQ("");
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) go(results[active]);
  };

  return (
    <div className="search-wrap" ref={box}>
      <input
        placeholder="Search products, sales, suppliers"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
      />
      {open && q.trim() && (
        <div className="results">
          {results.length === 0 && <div className="none">No matches for "{q}".</div>}
          {results.map((r, i) => (
            <div key={r.key}>
              {(i === 0 || results[i - 1].group !== r.group) && <h4>{r.group}</h4>}
              <button className={"res" + (i === active ? " on" : "")} onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
                <span className="ico">{r.icon}</span>
                <span><b>{r.title}</b><small>{r.note}</small></span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
