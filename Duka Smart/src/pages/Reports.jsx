import { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { useApp } from "../context/AppContext.jsx";
import { kes, sum, sameDay, daysBack, startOfDay, saleCost } from "../utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const RANGES = [["Last 7 days", 7], ["Last 30 days", 30]];

export default function Reports() {
  const { sales, expenses } = useApp();
  const [range, setRange] = useState(7);

  const days = daysBack(range);
  const from = startOfDay(days[0]);
  const mySales = sales.filter((s) => new Date(s.date) >= from);
  const myExp = expenses.filter((e) => new Date(e.date) >= from);

  // profit rules: gross = revenue - cost of goods, net = gross - expenses
  const revenue = sum(mySales, (s) => s.total);
  const gross = revenue - sum(mySales, saleCost);
  const spent = sum(myExp, (e) => e.amount);
  const net = gross - spent;

  const labels = days.map((d) => d.toLocaleDateString("en-KE", { day: "numeric", month: "short" }));
  const barData = {
    labels,
    datasets: [
      { label: "Sales", data: days.map((d) => sum(mySales.filter((s) => sameDay(s.date, d)), (s) => s.total)), backgroundColor: "#3EB489", borderRadius: 6 },
      { label: "Expenses", data: days.map((d) => sum(myExp.filter((e) => sameDay(e.date, d)), (e) => e.amount)), backgroundColor: "#F2A93B", borderRadius: 6 },
    ],
  };

  const methods = ["Cash", "M-Pesa", "Card"];
  const payData = {
    labels: methods,
    datasets: [{ data: methods.map((m) => sum(mySales.filter((s) => s.method === m), (s) => s.total)), backgroundColor: ["#0B3D2E", "#3EB489", "#F2A93B"] }],
  };

  // top selling products
  const totals = {};
  mySales.forEach((s) => s.items.forEach((i) => {
    totals[i.name] = totals[i.name] || { name: i.name, emoji: i.emoji, qty: 0, revenue: 0 };
    totals[i.name].qty += i.qty;
    totals[i.name].revenue += i.qty * i.price;
  }));
  const top = Object.values(totals).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const cards = [
    ["Revenue", revenue, ""],
    ["Gross profit", gross, "Revenue minus cost of goods"],
    ["Expenses", spent, ""],
    ["Net profit", net, "Gross profit minus expenses"],
  ];
  const opts = { responsive: true, maintainAspectRatio: false };

  return (
    <>
      <div className="top">
        <div>
          <h1>Reports</h1>
          <p className="muted">How your shop is performing.</p>
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {RANGES.map(([label, n]) => (
            <button key={n} className={n === range ? "on" : ""} onClick={() => setRange(n)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="kpis">
        {cards.map(([label, value, note]) => (
          <div className="card" key={label}>
            <span className="muted">{label}</span>
            <b style={{ color: value < 0 ? "#a02a14" : undefined }}>{kes(value)}</b>
            {note && <small className="muted">{note}</small>}
          </div>
        ))}
      </div>

      <div className="two">
        <div className="card">
          <b>Sales and expenses</b>
          <div className="chartbox"><Bar data={barData} options={opts} /></div>
        </div>
        <div className="card">
          <b>Payment methods</b>
          <div className="chartbox"><Doughnut data={payData} options={opts} /></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <b>Top selling products</b>
        {top.length === 0 && <p className="muted" style={{ paddingTop: 12 }}>No sales in this period.</p>}
        {top.map((p, n) => (
          <div className="row" key={p.name}>
            <span>{n + 1}. {p.emoji} <b>{p.name}</b> <small className="muted">· {p.qty} sold</small></span>
            <b>{kes(p.revenue)}</b>
          </div>
        ))}
      </div>
    </>
  );
}
