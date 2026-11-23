import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Status from "../components/Status";
import { useShop } from "../useShop";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Reports.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// builds the week, month and year figures from the real sales and expenses
function buildData(shop) {
  const when = (iso) => new Date(iso + "Z");
  const now = new Date();
  const buying = {};
  shop.products.forEach((p) => (buying[p.id] = p.buying));

  const sales = shop.sales.map((x) => ({
    date: when(x.createdAt),
    total: x.total,
    payment: x.payment,
    cost: x.items.reduce((sum, i) => sum + (buying[i.productId] || 0) * i.quantity, 0),
    items: x.items,
  }));
  const expenses = shop.expenses.map((x) => ({ date: when(x.createdAt), amount: x.amount, category: x.category }));

  function period(title, labels, inRange, bucket) {
    const out = { title, labels, sales: labels.map(() => 0), cost: labels.map(() => 0), expenses: labels.map(() => 0) };
    const units = {};
    const cats = {};
    const pay = {};
    sales.filter((x) => inRange(x.date)).forEach((x) => {
      const i = bucket(x.date);
      out.sales[i] += x.total;
      out.cost[i] += x.cost;
      pay[x.payment] = (pay[x.payment] || 0) + 1;
      x.items.forEach((it) => (units[it.name] = (units[it.name] || 0) + it.quantity));
    });
    expenses.filter((x) => inRange(x.date)).forEach((x) => {
      out.expenses[bucket(x.date)] += x.amount;
      cats[x.category] = (cats[x.category] || 0) + x.amount;
    });
    out.topProducts = Object.entries(units)
      .map(([name, u]) => ({ name, units: u }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
    out.expenseCategories = Object.entries(cats).map(([name, amount]) => ({ name, amount }));
    const count = Object.values(pay).reduce((a, b) => a + b, 0);
    out.payments = Object.entries(pay).map(([name, n]) => ({ name, percent: Math.round((n / count) * 100) }));
    return out;
  }

  // Monday of this week
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const weekLabels = DAYS;
  const monthWeeks = Math.ceil(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() / 7);

  return {
    week: period("This week", weekLabels, (d) => d >= monday, (d) => (d.getDay() + 6) % 7),
    month: period(
      "This month",
      Array.from({ length: monthWeeks }, (_, i) => "Week " + (i + 1)),
      (d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(),
      (d) => Math.floor((d.getDate() - 1) / 7)
    ),
    year: period(
      "This year",
      MONTHS.slice(0, now.getMonth() + 1),
      (d) => d.getFullYear() === now.getFullYear(),
      (d) => d.getMonth()
    ),
  };
}

function sum(list) {
  return list.reduce((a, b) => a + b, 0);
}

function Reports() {
  const shop = useShop();
  const data = buildData(shop);
  const [period, setPeriod] = useState("month");
  const d = data[period];

  const revenue = sum(d.sales);
  const cost = sum(d.cost);
  const grossProfit = revenue - cost;
  const expenses = sum(d.expenses);
  const netProfit = grossProfit - expenses;

  // the tallest bar decides how tall the others are
  const maxValue = Math.max(1, ...d.sales, ...d.expenses);

  // profit for each day / week / month, for the line chart
  const profits = d.sales.map((sale, i) => sale - d.cost[i] - d.expenses[i]);
  const top = Math.max(...profits, 0);
  const bottom = Math.min(...profits, 0);
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 30;

  function getX(i) {
    if (profits.length === 1) return chartWidth / 2;
    return padding + (i * (chartWidth - padding * 2)) / (profits.length - 1);
  }

  function getY(value) {
    const range = top - bottom || 1;
    return padding + ((top - value) * (chartHeight - padding * 2)) / range;
  }

  // best sellers
  const mostSold = Math.max(1, ...d.topProducts.map((p) => p.units));

  // expense breakdown for the donut chart
  const colours = ["#12805c", "#3eb489", "#b7ead3", "#f2a93b", "#d9482b"];
  const expenseTotal = sum(d.expenseCategories.map((c) => c.amount));
  let startAt = 0;
  const slices = d.expenseCategories.map((c, i) => {
    const share = (c.amount / expenseTotal) * 100;
    const slice = colours[i % colours.length] + " " + startAt + "% " + (startAt + share) + "%";
    startAt += share;
    return slice;
  });
  const donutStyle = { background: "conic-gradient(" + slices.join(", ") + ")" };

  const points = profits.map((p, i) => getX(i) + "," + getY(p)).join(" ");

  return (
    <div className="dash">
      <Sidebar active="Reports" />

      <main className="dash-main">
        <Status loading={shop.loading} error={shop.error} />

        <div className="dash-top">
          <div>
            <h1>Reports</h1>
            <p className="dash-sub">See how your business is doing</p>
          </div>
          <button className="print-btn" onClick={() => window.print()}>
            Print report
          </button>
        </div>

        <p className="print-title">{d.title}</p>

        <div className="period-tabs">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              className={period === p ? "selected" : ""}
              onClick={() => setPeriod(p)}
            >
              {data[p].title}
            </button>
          ))}
        </div>

        <div className="stat-grid report-stats">
          <div className="stat-card">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">{formatKES(revenue)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Gross profit</span>
            <span className="stat-value">{formatKES(grossProfit)}</span>
            <span className="stat-note">Revenue minus cost of goods sold</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Expenses</span>
            <span className="stat-value">{formatKES(expenses)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Net profit</span>
            <span className={netProfit >= 0 ? "stat-value profit" : "stat-value loss"}>
              {netProfit < 0 && "-"}{formatKES(Math.abs(netProfit))}
            </span>
            <span className="stat-note">Gross profit minus expenses</span>
          </div>
        </div>

        <div className="panel chart-panel report-chart">
          <div className="chart-head">
            <h2>Sales and expenses</h2>
            <div className="legend">
              <span><i className="dot dot-sales"></i>Sales</span>
              <span><i className="dot dot-expenses"></i>Expenses</span>
            </div>
          </div>

          <div className="chart">
            {d.labels.map((label, i) => (
              <div className="chart-day" key={label}>
                <div className="bars">
                  <div
                    className="bar bar-sales"
                    style={{ height: (d.sales[i] / maxValue) * 100 + "%" }}
                    title={"Sales: " + formatKES(d.sales[i])}
                  ></div>
                  <div
                    className="bar bar-expenses"
                    style={{ height: (d.expenses[i] / maxValue) * 100 + "%" }}
                    title={"Expenses: " + formatKES(d.expenses[i])}
                  ></div>
                </div>
                <span className="chart-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="chart-note">Tallest bar is {formatKES(maxValue)}. Hover a bar to see its amount.</p>
        </div>

        <div className="panel chart-panel">
          <div className="chart-head">
            <h2>Net profit</h2>
            <div className="legend">
              <span><i className="dot dot-sales"></i>Profit after costs and expenses</span>
            </div>
          </div>

          <svg className="line-chart" viewBox={"0 0 " + chartWidth + " " + chartHeight}>
            <line
              x1={padding}
              x2={chartWidth - padding}
              y1={getY(0)}
              y2={getY(0)}
              className="zero-line"
            />
            <text x={padding} y={getY(0) - 6} className="axis-text">KES 0</text>
            <polyline points={points} className="profit-line" />
            {profits.map((p, i) => (
              <g key={d.labels[i]}>
                <circle
                  cx={getX(i)}
                  cy={getY(p)}
                  r="5"
                  className={p >= 0 ? "dot-up" : "dot-down"}
                >
                  <title>{d.labels[i] + ": " + formatKES(p)}</title>
                </circle>
                <text x={getX(i)} y={chartHeight - 6} textAnchor="middle" className="axis-text">
                  {d.labels[i]}
                </text>
              </g>
            ))}
          </svg>
          <p className="chart-note">Dots below the line mean a loss for that {period === "year" ? "month" : period === "month" ? "week" : "day"}.</p>
        </div>

        <div className="report-row">
          <div className="panel">
            <h2>Best selling products</h2>
            {d.topProducts.map((p, i) => (
              <div className="rank-row" key={p.name}>
                <span className="rank-number">{i + 1}</span>
                <div className="rank-info">
                  <div className="rank-top">
                    <strong>{p.name}</strong>
                    <span>{p.units} sold</span>
                  </div>
                  <div className="rank-track">
                    <div
                      className="rank-fill"
                      style={{ width: (p.units / mostSold) * 100 + "%" }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Where the money goes</h2>
            <div className="donut-wrap">
              <div className="donut" style={donutStyle}>
                <div className="donut-hole">
                  <span>Total</span>
                  <strong>{formatKES(expenseTotal)}</strong>
                </div>
              </div>
              <ul className="donut-legend">
                {d.expenseCategories.map((c, i) => (
                  <li key={c.name}>
                    <i style={{ background: colours[i] }}></i>
                    <span>{c.name}</span>
                    <strong>{Math.round((c.amount / expenseTotal) * 100)}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="panel pay-panel">
          <h2>How customers pay</h2>
          <div className="pay-bar">
            {d.payments.map((p, i) => (
              <div
                key={p.name}
                style={{ width: p.percent + "%", background: colours[i] }}
                title={p.name + ": " + p.percent + "%"}
              ></div>
            ))}
          </div>
          <div className="pay-legend">
            {d.payments.map((p, i) => (
              <span key={p.name}>
                <i style={{ background: colours[i] }}></i>
                {p.name} {p.percent}%
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Reports;
