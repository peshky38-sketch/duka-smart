import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { get, getUser, logout } from "../api";
import { Icon } from "./Icons";

// the frame around every page after login: top bar, sidebar (phones: bottom tabs)
const SIDE = [
  { key: "Dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
  { key: "Sales", label: "Sales", href: "/sales", icon: "sales" },
  { key: "Inventory", label: "Inventory", href: "/inventory", icon: "box" },
  { key: "Expenses", label: "Expenses", href: "/expenses", icon: "expenses" },
  { key: "Reports", label: "Reports", href: "/reports", icon: "reports" },
  { key: "Suppliers", label: "Suppliers", href: "/suppliers", icon: "truck" },
  { key: "Settings", label: "Settings", href: "/settings", icon: "settings" },
];
const TABS = [
  { key: "Dashboard", label: "Home", href: "/dashboard", icon: "home" },
  { key: "Sales", label: "Sell", href: "/sales", icon: "sales" },
  { key: "Inventory", label: "Stock", href: "/inventory", icon: "box" },
  { key: "Reports", label: "Reports", href: "/reports", icon: "reports" },
];
// set VITE_WHATSAPP_NUMBER (like 2547XXXXXXXX) in .env.local to point "Open chat" at your support line
const WHATSAPP = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

function useOutside(ref, close) {
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, close]);
}

function TopNav({ active }) {
  const navigate = useNavigate();
  const user = getUser();
  const initials = (user.username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const [low, setLow] = useState([]);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const bellRef = useRef(null);
  const menuRef = useRef(null);
  useOutside(bellRef, () => setBell(false));
  useOutside(menuRef, () => setMenu(false));

  useEffect(() => {
    let alive = true;
    get("/api/products/low-stock")
      .then((d) => alive && setLow(d.low_stock_products || []))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    logout();
    navigate("/login");
  }

  function search(e) {
    e.preventDefault();
    navigate("/inventory" + (q.trim() ? "?q=" + encodeURIComponent(q.trim()) : ""));
  }

  const avatar = user.picture ? <img src={user.picture} alt="" /> : initials;

  return (
    <>
      <header className="app-top">
        <Link to="/dashboard" className="app-logo">
          <img src={logo} alt="" width="34" height="34" />
          <span>Duka<b>Smart</b></span>
        </Link>

        <form className="app-search" onSubmit={search} role="search">
          <Icon name="search" className="" />
          <input type="search" placeholder="Search products, sales, suppliers" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <span className="app-gap" />

        <div className="app-pop" ref={bellRef}>
          <button className="app-bell" onClick={() => { setBell(!bell); setMenu(false); }} aria-label="Alerts" aria-expanded={bell}>
            <Icon name="bell" />
            {low.length > 0 && <em className="app-badge">{low.length}</em>}
          </button>
          {bell && (
            <div className="app-card">
              <strong>Running low</strong>
              {low.length === 0 && <p>Nothing is running low.</p>}
              {low.slice(0, 5).map((p) => (
                <div className="app-row" key={p.id}>
                  <span>{p.name}</span>
                  <b className={p.quantity === 0 ? "out" : "low"}>{p.quantity === 0 ? "Out" : p.quantity + " left"}</b>
                </div>
              ))}
              <Link to="/low-stock" onClick={() => setBell(false)} className="app-link">See all low stock</Link>
              <Link to="/notifications" onClick={() => setBell(false)} className="app-link">All notifications</Link>
            </div>
          )}
        </div>

        <div className="app-pop" ref={menuRef}>
          <button className="app-who" onClick={() => { setMenu(!menu); setBell(false); }} aria-label="Account" aria-expanded={menu}>
            <span className="app-ava">{avatar}</span>
            <span><b>{user.username || "Your shop"}</b><small>{user.business ? "Owner · " + user.business : "Signed in"}</small></span>
          </button>
          {menu && (
            <div className="app-card">
              <Link to="/profile" onClick={() => setMenu(false)} className="app-link">My profile</Link>
              <Link to="/settings" onClick={() => setMenu(false)} className="app-link">Settings</Link>
              <Link to="/expenses" onClick={() => setMenu(false)} className="app-link more-only">Expenses</Link>
              <Link to="/suppliers" onClick={() => setMenu(false)} className="app-link more-only">Suppliers</Link>
              <Link to="/transactions" onClick={() => setMenu(false)} className="app-link">Transactions</Link>
              <Link to="/notifications" onClick={() => setMenu(false)} className="app-link more-only">Notifications</Link>
              <a href="/login" onClick={handleLogout} className="app-link out">Log out</a>
            </div>
          )}
        </div>
      </header>

      <aside className="app-side" aria-label="Main">
        {SIDE.map((l) => (
          <Link key={l.key} to={l.href} className={"nav" + (active === l.key ? " on" : "")}>
            <Icon name={l.icon} />
            <span>{l.label}</span>
            {l.key === "Inventory" && low.length > 0 && <em className="app-badge">{low.length}</em>}
          </Link>
        ))}
        <div className="help-card">
          <strong>Need a hand?</strong>
          <span>Chat to our team on WhatsApp.</span>
          <a href={"https://wa.me/" + WHATSAPP} target="_blank" rel="noreferrer">Open chat</a>
        </div>
      </aside>

      <nav className="tabbar2" aria-label="Main">
        {TABS.map((l) => (
          <Link key={l.key} to={l.href} className={active === l.key ? "on" : ""}>
            <Icon name={l.icon} />
            <span>{l.label}</span>
            {l.key === "Inventory" && low.length > 0 && <em className="app-badge">{low.length}</em>}
          </Link>
        ))}
      </nav>
    </>
  );
}

export default TopNav;
