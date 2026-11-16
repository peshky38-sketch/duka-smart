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

  const categories = ["Rent", "Utilities", "Stock", "Transport", "Wages", "Other"];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Stock");
  const [payment, setPayment] = useState("Cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  function handleAdd(e) {
    e.preventDefault();

    if (!name || !amount) {
      setError("Please enter the expense name and amount");
      return;
    }
    if (Number(amount) <= 0) {
      setError("Amount must be more than 0");
      return;
    }

    const newExpense = {
      id: Date.now(),
      name: name,
      amount: Number(amount),
      category: category,
      payment: payment,
      date: new Date().toISOString().slice(0, 10),
      note: note,
    };

    setExpenses([newExpense, ...expenses]);
    setName("");
    setAmount("");
    setNote("");
    setError("");
    setShowForm(false);
  }

  function handleDelete(id) {
    if (window.confirm("Delete this expense?")) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  }

  const shown = expenses.filter((e) => filter === "all" || e.category === filter);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // work out which category we spend the most on
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  let biggest = "-";
  let biggestAmount = 0;
  for (const c in totals) {
    if (totals[c] > biggestAmount) {
      biggest = c;
      biggestAmount = totals[c];
    }
  }

  return (
    <div className="dash">
      <Sidebar active="Expenses" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Expenses</h1>
            <p className="dash-sub">Keep track of what your shop spends</p>
          </div>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "+ Add expense"}
          </button>
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
          <div className="stat-card">
            <span className="stat-label">Biggest spending</span>
            <span className="stat-value">{biggest}</span>
          </div>
        </div>

        {showForm && (
          <form className="panel expense-form" onSubmit={handleAdd}>
            <h2>New expense</h2>
            <div className="expense-fields">
              <div>
                <label>What was it for?</label>
                <input
                  type="text"
                  placeholder="e.g. Electricity tokens"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label>Amount (KES)</label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Paid with</label>
                <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                  <option>Cash</option>
                  <option>M-Pesa</option>
                  <option>Card</option>
                </select>
              </div>
              <div className="wide">
                <label>Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="add-btn">Save expense</button>
          </form>
        )}

        <div className="filter-row">
          <label>Show:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    {e.note && <span className="note">{e.note}</span>}
                  </td>
                  <td>{e.category}</td>
                  <td>{e.payment}</td>
                  <td>{e.date}</td>
                  <td>KES {e.amount}</td>
                  <td className="row-actions">
                    <button onClick={() => handleDelete(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="empty">No expenses in this category.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Expenses;
