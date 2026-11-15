import{NavLink, Outlet} from "react-router-dom";
import Logo from "./Logo.jsx";
import { useApp, isLow, isOut} from "../context/AppContext.jsx";

const LINKS = [
    ["/","Dashboard"],
    ["/sales",  "Sales"],
    ["/inventory",  "Inventory"],
    ["/transactions",  "Transactions"],
    ["/expenses",  "Expenses"],
    ["/reports",  "Reports"],
    ["/suppliers",  "Suppliers"],
    ["/settings",  "Settings"],
];

export default function Layout() {
    const {user, logout,products, error} = useApp();
    const alerts = products.filter((p) => isLow(p) || isOut(p)).length;

    return (
        <div className="app">
        <aside>
        <Logo />
        {LINKS.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
            {icon} {label}
          </NavLink>
        ))}
      </aside>
      <div>
        <header className="topbar">
          <input placeholder="Search products, sales, suppliers" />
          <div className="user">
            <span className="bell">🔔<i>{alerts}</i></span>
            <div>
              <b>{user.name}</b>
              <small>Owner · {user.shop}</small>
            </div>
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
