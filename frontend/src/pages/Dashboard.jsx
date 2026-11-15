import logo from "../assets/logo.svg";
import "./Dashboard.css";

function Dashboard() {
  // sample numbers for now, will come from the api later
  const stats = [
    { label: "Total products", value: "148" },
    { label: "Sales today", value: "KES 48,250" },
    { label: "Expenses today", value: "KES 12,400" },
    { label: "Estimated profit", value: "KES 35,850" },
  ];

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="DukaSmart logo" width="36" height="36" />
          <span className="brand-name">
            Duka<span className="brand-light">Smart</span>
          </span>
        </div>

        <nav className="sidebar-links">
          <a href="/dashboard" className="active">Dashboard</a>
          <a href="/inventory">Inventory</a>
          <a href="/sales">Sales</a>
          <a href="/expenses">Expenses</a>
        </nav>

        <a href="/login" className="sidebar-logout">Log out</a>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Dashboard</h1>
            <p className="dash-sub">Here is how your shop is doing today</p>
          </div>
          <div className="dash-user">
            <div className="avatar">WK</div>
            <div>
              <strong>Wanjiru Kamau</strong>
              <span>Mama Wanjiru Stores</span>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
