import logo from "../assets/logo.svg";
import "./Sidebar.css";

function Sidebar({ active }) {
  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Inventory", href: "/inventory" },
    { name: "Sales", href: "/sales" },
    { name: "Expenses", href: "/expenses" },
    { name: "Transactions", href: "/transactions" },
    { name: "Reports", href: "/reports" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="DukaSmart logo" width="36" height="36" />
        <span className="brand-name">
          Duka<span className="brand-light">Smart</span>
        </span>
      </div>

      <nav className="sidebar-links">
        {links.map((l) => (
          <a
            key={l.name}
            href={l.href}
            className={active === l.name ? "active" : ""}
          >
            {l.name}
          </a>
        ))}
      </nav>

      <a href="/login" className="sidebar-logout">Log out</a>
    </aside>
  );
}

export default Sidebar;
