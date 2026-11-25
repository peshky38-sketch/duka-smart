import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { EXPENSE_CATEGORIES } from "../data/mock";
import { kes, sum, sameDay, fmtDate, downloadCsv, isoDay } from "../utils";

// Used for both Add and Edit. Pass `expense` to edit.
function ExpenseForm({ expense, onSave, onClose }) {
  const [f, setF] = useState(
    expense
      ? { description: expense.description, category: expense.category, amount: expense.amount, date: new Date(expense.date).toLocaleDateString("en-CA") }
      : { description: "", category: "Transport", amount: "", date: new Date().toLocaleDateString("en-CA") } // YYYY-MM-DD in local time
  );
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave({
        ...(expense ? { id: expense.id } : {}),
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
        <h2>{expense ? "Edit expense" : "Add expense"}</h2>
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
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [form, setForm] = useState(null); // null = closed, {} = add, expense = edit
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

  const exportCsv = () =>
    downloadCsv(`expenses-${isoDay(new Date())}.csv`, [
      ["Date", "Description", "Category", "Amount (KES)"],
      ...shown.map((e) => [isoDay(e.date), e.description, e.category, e.amount]),
    ]);

  const remove = async (e) => {
    if (!window.confirm(`Delete "${e.description}"?`)) return;
    try {
      await deleteExpense(e.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="top">
        <div>
          <h1>Expenses</h1>
          <p className="muted">Log rent, transport and other costs to see your true profit.</p>
        </div>
        <div className="actions">
          <button className="btn out" disabled={shown.length === 0} onClick={exportCsv}>Export CSV</button>
          <button className="btn" onClick={() => setForm({})}>+ Add expense</button>
        </div>
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
              <thead><tr><th>DATE</th><th>DESCRIPTION</th><th>CATEGORY</th><th style={{ textAlign: "right" }}>AMOUNT</th><th></th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    <td className="muted">{fmtDate(e.date)}</td>
                    <td><b>{e.description}</b></td>
                    <td><span className="chip">{e.category}</span></td>
                    <td style={{ textAlign: "right" }}><b>{kes(e.amount)}</b></td>
                    <td className="actions">
                      <button className="link" onClick={() => setForm(e)}>Edit</button>
                      <button className="link red" onClick={() => remove(e)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan="5" className="muted">No expenses yet.</td></tr>}
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

      {form && (
        <ExpenseForm
          expense={form.id ? form : null}
          onSave={(e) => (e.id ? updateExpense(e) : addExpense(e))}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}
