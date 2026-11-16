import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./Reports.css";

// sample numbers for now, will come from the api later
const data = {
  week: {
    title: "This week",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sales: [5200, 4600, 6100, 5400, 8200, 9300, 7000],
    cost: [3400, 3000, 4000, 3500, 5300, 6000, 4500],
    expenses: [900, 600, 1100, 700, 1500, 800, 600],
    topProducts: [
      { name: "Unga Jogoo 2kg", units: 62 },
      { name: "Sugar 1kg", units: 48 },
      { name: "Milk 500ml", units: 44 },
      { name: "Bread (white)", units: 39 },
      { name: "Cooking oil 1L", units: 21 },
    ],
    expenseCategories: [
      { name: "Wages", amount: 2000 },
      { name: "Utilities", amount: 1500 },
      { name: "Transport", amount: 1100 },
      { name: "Other", amount: 1600 },
    ],
    payments: [
      { name: "Cash", percent: 52 },
      { name: "M-Pesa", percent: 41 },
      { name: "Card", percent: 7 },
    ],
  },
  month: {
    title: "This month",
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    sales: [41000, 46500, 43200, 55700],
    cost: [26600, 30100, 28100, 36400],
    expenses: [16500, 3200, 4100, 5850],
    topProducts: [
      { name: "Unga Jogoo 2kg", units: 268 },
      { name: "Sugar 1kg", units: 205 },
      { name: "Milk 500ml", units: 190 },
      { name: "Bread (white)", units: 166 },
      { name: "Cooking oil 1L", units: 92 },
    ],
    expenseCategories: [
      { name: "Rent", amount: 15000 },
      { name: "Wages", amount: 8000 },
      { name: "Transport", amount: 2400 },
      { name: "Utilities", amount: 1500 },
      { name: "Other", amount: 2750 },
    ],
    payments: [
      { name: "Cash", percent: 49 },
      { name: "M-Pesa", percent: 44 },
      { name: "Card", percent: 7 },
    ],
  },
  year: {
    title: "This year",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    sales: [150000, 142000, 168000, 159000, 171000, 163000, 177000, 181000, 169000, 178000, 186400],
    cost: [97500, 92300, 109200, 103400, 111100, 106000, 115000, 117700, 109900, 115700, 121200],
    expenses: [27000, 26500, 31000, 28000, 29500, 28800, 30200, 31500, 29000, 30100, 29650],
    topProducts: [
      { name: "Unga Jogoo 2kg", units: 2810 },
      { name: "Sugar 1kg", units: 2240 },
      { name: "Milk 500ml", units: 2050 },
      { name: "Bread (white)", units: 1790 },
      { name: "Cooking oil 1L", units: 980 },
    ],
    expenseCategories: [
      { name: "Rent", amount: 165000 },
      { name: "Wages", amount: 88000 },
      { name: "Transport", amount: 26400 },
      { name: "Utilities", amount: 16500 },
      { name: "Other", amount: 25350 },
    ],
    payments: [
      { name: "Cash", percent: 47 },
      { name: "M-Pesa", percent: 46 },
      { name: "Card", percent: 7 },
    ],
  },
};

function sum(list) {
  return list.reduce((a, b) => a + b, 0);
}

function Reports() {
  const [period, setPeriod] = useState("month");
  const d = data[period];

  const revenue = sum(d.sales);
  const cost = sum(d.cost);
  const grossProfit = revenue - cost;
  const expenses = sum(d.expenses);
  const netProfit = grossProfit - expenses;

  // the tallest bar decides how tall the others are
  const maxValue = Math.max(...d.sales, ...d.expenses);

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

  const points = profits.map((p, i) => getX(i) + "," + getY(p)).join(" ");

  return (
    <div className="dash">
      <Sidebar active="Reports" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Reports</h1>
            <p className="dash-sub">See how your business is doing</p>
          </div>
        </div>

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
            <span className="stat-value">KES {revenue}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Gross profit</span>
            <span className="stat-value">KES {grossProfit}</span>
            <span className="stat-note">Revenue minus cost of goods sold</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Expenses</span>
            <span className="stat-value">KES {expenses}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Net profit</span>
            <span className={netProfit >= 0 ? "stat-value profit" : "stat-value loss"}>
              {netProfit < 0 && "-"}KES {Math.abs(netProfit)}
            </span>
            <span className="stat-note">Gross profit minus expenses</span>
          </div>
        </div>

        <div className="panel chart-panel">
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
                    title={"Sales: KES " + d.sales[i]}
                  ></div>
                  <div
                    className="bar bar-expenses"
                    style={{ height: (d.expenses[i] / maxValue) * 100 + "%" }}
                    title={"Expenses: KES " + d.expenses[i]}
                  ></div>
                </div>
                <span className="chart-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="chart-note">Tallest bar is KES {maxValue}. Hover a bar to see its amount.</p>
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
                  <title>{d.labels[i] + ": KES " + p}</title>
                </circle>
                <text x={getX(i)} y={chartHeight - 6} textAnchor="middle" className="axis-text">
                  {d.labels[i]}
                </text>
              </g>
            ))}
          </svg>
          <p className="chart-note">Dots below the line mean a loss for that {period === "year" ? "month" : period === "month" ? "week" : "day"}.</p>
        </div>
      </main>
    </div>
  );
}

export default Reports;
