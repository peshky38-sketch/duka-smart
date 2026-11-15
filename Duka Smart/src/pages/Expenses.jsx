import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { EXPENSE_CATEGORIES } from "../data/mock";
import { kes, sum, sameDay, fmtDate } from "../utils";

function ExpenseForm({ onSave, onClose }) {
  const [f, setF] = useState({
    description: "",
    category: "Transport",
    amount: "",
    date: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD in local time
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave({
        description: f.description,
        category: f.category,
        amount: Number(f.amount),
        date: new Date(f.date + "T12:00:00").toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Add expense</h2>
        {error && <div className="banner">{error}</div>}
        <label>What was it for?<input required value={f.description} onChange={set("description")} placeholder="e.g. Transport to wholesaler" /></label>
        <label>Category
          <select value={f.category} onChange={set("category")}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div className="two-col">
          <label>Amount (KES)<input type="number" min="1" required value={f.amount} onChange={set("amount")} /></label>
          <label>Date<input type="date" required value={f.date} onChange={set("date")} /></label>
        </div>
        <div className="actions">
          <button type="button" className="btn out" onClick={onClose}>Cancel</button>
          <button className="btn">Save expense</button>
        </div>
      </form>
    </div>
  );
}

export default function Expenses() {
  const { expenses, addExpense } = useApp();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("All");

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const todayTotal = sum(expenses.filter((e) => sameDay(e.date, now)), (e) => e.amount);
  const monthTotal = sum(thisMonth, (e) => e.amount);
  const byCat = EXPENSE_CATEGORIES
    .map((c) => [c, sum(thisMonth.filter((e) => e.category === c), (e) => e.amount)])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const shown = expenses
    .filter((e) => cat === "All" || e.category === cat)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <div className="top">
        <div>
          <h1>Expenses</h1>
          <p className="muted">Log rent, transport and other costs to see your true profit.</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>+ Add expense</button>
      </div>

      <div className="kpis">
        <div className="card"><span className="muted">Spent today</span><b>{kes(todayTotal)}</b></div>
        <div className="card"><span className="muted">Spent this month</span><b>{kes(monthTotal)}</b></div>
        <div className="card"><span className="muted">Entries this month</span><b>{thisMonth.length}</b></div>
      </div>

      <div className="two">
        <div>
          <div className="tabs">
            {["All", ...EXPENSE_CATEGORIES].map((c) => (
              <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="card" style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>DATE</th><th>DESCRIPTION</th><th>CATEGORY</th><th style={{ textAlign: "right" }}>AMOUNT</th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    <td className="muted">{fmtDate(e.date)}</td>
                    <td><b>{e.description}</b></td>
                    <td><span className="chip">{e.category}</span></td>
                    <td style={{ textAlign: "right" }}><b>{kes(e.amount)}</b></td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan="4" className="muted">No expenses yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ alignSelf: "start" }}>
          <b>This month by category</b>
          {byCat.length === 0 && <p className="muted" style={{ paddingTop: 12 }}>Nothing recorded this month.</p>}
          {byCat.map(([c, v]) => (
            <div key={c} style={{ marginTop: 14 }}>
              <div className="row nb"><span>{c}</span><b>{kes(v)}</b></div>
              <div className="meter" style={{ width: "100%" }}><i style={{ width: (v / monthTotal) * 100 + "%" }} /></div>
            </div>
          ))}
        </div>
      </div>

      {open && <ExpenseForm onSave={addExpense} onClose={() => setOpen(false)} />}
    </>
  );
}
