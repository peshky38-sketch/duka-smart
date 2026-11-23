import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { getUser, logout } from "../api";
import "./Sidebar.css";

// small line icons for the phone tab bar
const icons = {
  Dashboard: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  Inventory: <path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" />,
  Sales: <path d="M4 6h16l-1.5 9h-13L4 6zM4 6L3 3H1M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z" />,
  Expenses: <path d="M3 7h18v12H3V7zM3 7l3-3h12l3 3M16 13h2" />,
  Transactions: <path d="M4 8h14l-3-3M20 16H6l3 3" />,
  Reports: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  More: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
};

const links = [
  { name: "Dashboard", label: "Home", href: "/dashboard" },
  { name: "Inventory", label: "Stock", href: "/inventory" },
  { name: "Sales", label: "Sell", href: "/sales" },
  { name: "Expenses", label: "Costs", href: "/expenses" },
  { name: "Transactions", label: "Transactions", href: "/transactions" },
  { name: "Reports", label: "Reports", href: "/reports" },
];

// remembers which page the menu was on, so the highlight can slide to the next one
let lastIndex = -1;

function Sidebar({ active }) {
  const navigate = useNavigate();
  const [more, setMore] = useState(false);
  const user = getUser();
  const initials = (user.username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // the highlight slides from the page you came from to this one
  const current = links.findIndex((l) => l.name === active);
  const [pillAt, setPillAt] = useState(lastIndex >= 0 ? lastIndex : current);
  useEffect(() => {
    const id = requestAnimationFrame(() => setPillAt(current));
    lastIndex = current;
    return () => cancelAnimationFrame(id);
  }, [current]);

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("duka_menu") === "small"; } catch { return false; }
  });
  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("duka_menu", next ? "small" : "wide"); } catch { /* not saved */ }
  }

  function handleLogout(e) {
    e.preventDefault();
    logout();
    navigate("/login");
  }

  // the phone bar has room for five, so Transactions, Reports and Log out go under "More"
  const tabs = links.filter((l) => l.name !== "Transactions" && l.name !== "Reports");

  return (
    <>
      <aside className={"sidebar" + (collapsed ? " collapsed" : "")}>
        <div className="sidebar-brand">
          <img src={logo} alt="DukaSmart logo" width="36" height="36" />
          <span className="brand-name">
            Duka<span className="brand-light">Smart</span>
          </span>
          <button className="collapse-btn" onClick={toggle} aria-label={collapsed ? "Expand menu" : "Collapse menu"} title={collapsed ? "Expand menu" : "Collapse menu"}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 5l-5 5 5 5" /></svg>
          </button>
        </div>

        <nav className="sidebar-links">
          <span className="nav-pill" style={{ transform: "translateY(" + pillAt * 48 + "px)", opacity: current === -1 ? 0 : 1 }} />
          {links.map((l) => (
            <Link key={l.name} to={l.href} className={active === l.name ? "active" : ""} data-label={l.name}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{icons[l.name]}</svg>
              <span>{l.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="su-avatar">{initials}</div>
          <div className="su-text">
            <strong>{user.username || "Your shop"}</strong>
            <span>{user.business || "Signed in"}</span>
          </div>
          <a href="/login" className="su-out" onClick={handleLogout} aria-label="Log out" title="Log out">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" /></svg>
          </a>
        </div>
      </aside>

      <nav className="tabbar" aria-label="Main">
        {tabs.map((l) => (
          <Link key={l.name} to={l.href} className={active === l.name ? "tab on" : "tab"}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{icons[l.name]}</svg>
            <span>{l.label}</span>
          </Link>
        ))}
        <button className={active === "Transactions" || active === "Reports" || more ? "tab on" : "tab"} onClick={() => setMore(!more)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{icons.More}</svg>
          <span>More</span>
        </button>
      </nav>

      {more && (
        <div className="more-backdrop" onClick={() => setMore(false)}>
          <div className="more-sheet" onClick={(e) => e.stopPropagation()}>
            <Link to="/transactions" onClick={() => setMore(false)}>Transactions</Link>
            <Link to="/reports" onClick={() => setMore(false)}>Reports</Link>
            <a href="/login" onClick={handleLogout}>Log out</a>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
