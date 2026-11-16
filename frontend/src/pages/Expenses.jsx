import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./Expenses.css";

function Expenses() {
  // sample expenses for now, will come from the api later
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Shop rent", amount: 15000, category: "Rent", payment: "M-Pesa", date: "2026-11-05", note: "November rent" },
    { id: 2, name: "KPLC tokens", amount: 1500, category: "Utilities", payment: "M-Pesa", date: "2026-11-08", note: "" },
    { id: 3, name: "Stock from Baraka Foods", amount: 8200, category: "Stock", payment: "Cash", date: "2026-11-10", note: "Sugar and unga" },
    { id: 4, name: "Transport to market", amount: 600, category: "Transport", payment: "Cash", date: "2026-11-12", note: "" },
    { id: 5, name: "Shop assistant wages", amount: 4000, category: "Wages", payment: "M-Pesa", date: "2026-11-13", note: "Weekly pay" },
    { id: 6, name: "Carrier bags", amount: 350, category: "Other", payment: "Cash", date: "2026-11-14", note: "" },
  ]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="dash">
      <Sidebar active="Expenses" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Expenses</h1>
            <p className="dash-sub">Keep track of what your shop spends</p>
          </div>
          <button className="add-btn">+ Add expense</button>
        </div>

        <div className="stat-grid expense-stats">
          <div className="stat-card">
            <span className="stat-label">Total this month</span>
            <span className="stat-value">KES {total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Number of expenses</span>
            <span className="stat-value">{expenses.length}</span>
          </div>
        </div>

        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Expense</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    {e.note && <span className="note">{e.note}</span>}
                  </td>
                  <td>{e.category}</td>
                  <td>{e.payment}</td>
                  <td>{e.date}</td>
                  <td>KES {e.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Expenses;
