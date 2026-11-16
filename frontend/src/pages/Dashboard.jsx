import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

function Dashboard() {
  // sample numbers for now, will come from the api later
  const stats = [
    { label: "Total products", value: "148" },
    { label: "Sales today", value: "KES 48,250" },
    { label: "Expenses today", value: "KES 12,400" },
    { label: "Estimated profit", value: "KES 35,850" },
  ];

  const lowStock = [
    { name: "Sugar 1kg", left: 4, reorder: 25 },
    { name: "Unga Jogoo 2kg", left: 7, reorder: 20 },
    { name: "Cooking oil 1L", left: 3, reorder: 15 },
    { name: "Bar soap", left: 0, reorder: 30 },
  ];

  const recentSales = [
    { id: "#1042", items: "Sugar, Unga, Milk", total: 640, time: "10:42 am" },
    { id: "#1041", items: "Cooking oil, Rice", total: 880, time: "10:15 am" },
    { id: "#1040", items: "Bread, Eggs", total: 310, time: "9:50 am" },
    { id: "#1039", items: "Tea leaves, Sugar", total: 275, time: "9:21 am" },
  ];

  const week = [
    { day: "Mon", sales: 32, expenses: 14 },
    { day: "Tue", sales: 28, expenses: 10 },
    { day: "Wed", sales: 41, expenses: 18 },
    { day: "Thu", sales: 36, expenses: 12 },
    { day: "Fri", sales: 52, expenses: 20 },
    { day: "Sat", sales: 60, expenses: 22 },
    { day: "Sun", sales: 48, expenses: 12 },
  ];
  const maxValue = 60;

  return (
    <div className="dash">
      <Sidebar active="Dashboard" />

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

        <div className="panel chart-panel">
          <div className="chart-head">
            <h2>Sales and expenses this week</h2>
            <div className="legend">
              <span><i className="dot dot-sales"></i>Sales</span>
              <span><i className="dot dot-expenses"></i>Expenses</span>
            </div>
          </div>

          <div className="chart">
            {week.map((d) => (
              <div className="chart-day" key={d.day}>
                <div className="bars">
                  <div
                    className="bar bar-sales"
                    style={{ height: (d.sales / maxValue) * 100 + "%" }}
                    title={"Sales: KES " + d.sales + "k"}
                  ></div>
                  <div
                    className="bar bar-expenses"
                    style={{ height: (d.expenses / maxValue) * 100 + "%" }}
                    title={"Expenses: KES " + d.expenses + "k"}
                  ></div>
                </div>
                <span className="chart-label">{d.day}</span>
              </div>
            ))}
          </div>
          <p className="chart-note">KES thousands</p>
        </div>

        <div className="dash-row">
          <div className="panel">
            <h2>Low stock alerts</h2>
            {lowStock.map((p) => (
              <div className="alert-item" key={p.name}>
                <div>
                  <strong>{p.name}</strong>
                  <span>Reorder at {p.reorder}</span>
                </div>
                <span className={p.left === 0 ? "tag tag-out" : "tag tag-low"}>
                  {p.left === 0 ? "Out of stock" : p.left + " left"}
                </span>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Recent sales</h2>
            <table>
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.items}</td>
                    <td>KES {s.total}</td>
                    <td>{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
