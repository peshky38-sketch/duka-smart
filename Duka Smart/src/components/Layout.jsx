import { NavLink, Outlet, Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import SearchBar from "./SearchBar.jsx";
import { useApp, isLow, isOut } from "../context/AppContext.jsx";

const LINKS = [
  ["/", "🏠", "Dashboard"],
  ["/sales", "🛒", "Sales"],
  ["/inventory", "📦", "Inventory"],
  ["/transactions", "📜", "Transactions"],
  ["/expenses", "🧾", "Expenses"],
  ["/reports", "📊", "Reports"],
  ["/suppliers", "🚚", "Suppliers"],
  ["/profile", "👤", "Profile"],
  ["/settings", "⚙️", "Settings"],
];

export default function Layout() {
  const { user, logout, products, error, unread } = useApp();
  const alerts = products.filter((p) => isLow(p) || isOut(p)).length;

  return (
    <div className="app">
      <aside>
        <Link to="/" title="Go to dashboard" style={{ padding: 0, display: "block", borderRadius: 0 }}>
          <Logo />
        </Link>
        {LINKS.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "on" : "")}>
            {icon} {label}
          </NavLink>
        ))}
      </aside>
      <div>
        <header className="topbar">
          <SearchBar />
          <div className="user">
            <Link to="/notifications" className="bell" title="Notifications">
              🔔{unread > 0 && <i>{unread}</i>}
            </Link>
            <Link to="/profile" className="me">
              <span className="mini">{user.avatar ? <img src={user.avatar} alt="" /> : user.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <b>{user.name}</b>
                <small>Owner · {user.shop}</small>
              </div>
            </Link>
            <button className="btn out" onClick={logout}>Log out</button>
          </div>
        </header>
        <main>
          {error && <div className="banner">⚠ {error}</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
