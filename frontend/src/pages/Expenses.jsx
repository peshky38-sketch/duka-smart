import { useState } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import { Select, ComboInput } from "../components/Select";
import Status from "../components/Status";
import PayIcon from "../components/PayIcon";
import { useShop } from "../useShop";
import { useToast } from "../components/Toast";
import { del, post } from "../api";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Expenses.css";

function Expenses() {
  const { expenses: raw, loading, error, reload } = useShop();
  // the pages show a plain date, the backend sends a timestamp in UTC
  const expenses = raw.map((x) => ({ ...x, date: new Date(x.createdAt + "Z").toLocaleDateString("en-CA") }));
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const categories = ["Rent", "Utilities", "Stock", "Transport", "Wages", "Other"];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Stock");
  const [payment, setPayment] = useState("Cash");
  const [note, setNote] = useState("");
  const [formError, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function handleAdd(e) {
    e.preventDefault();

    if (!name || !amount) {
      setError("Please enter the expense name and amount");
      return;
    }
    if (Number(amount) <= 0) {
      setError("Amount must be more than 0");
      return;
    }

    setSaving(true);
    try {
      await post("/api/expenses", {
        expense_name: name,
        amount: Number(amount),
        category: category,
        payment_method: payment,
        note: note,
      });
      await reload();
      toast("Expense added");
      setName("");
      setAmount("");
      setNote("");
      setError("");
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await del("/api/expenses/" + id);
      await reload();
      toast("Expense deleted");
    } catch (err) {
      toast(err.message, "error");
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
      <TopNav active="Expenses" />

      <main className="dash-main">
        <Status loading={loading} error={error} />

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
            <span className="stat-value">{formatKES(total)}</span>
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
                <Select value={category} onChange={setCategory} options={categories} />
              </div>
              <div>
                <label>Paid with</label>
                <Select value={payment} onChange={setPayment} options={[{ value: "Cash", label: "Cash", icon: <PayIcon method="Cash" /> }, { value: "M-Pesa", label: "M-Pesa", icon: <PayIcon method="M-Pesa" /> }, { value: "Card", label: "Card", icon: <PayIcon method="Card" /> }]} />
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

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" className="add-btn" disabled={saving}>{saving ? "Saving..." : "Save expense"}</button>
          </form>
        )}

        <div className="filter-row">
          <label>Show:</label>
          <Select value={filter} onChange={setFilter} options={[{ value: "all", label: "All categories" }, ...categories]} />
        </div>

        <div className="panel table-panel">
          <table className="stack">
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
                  <td data-label="Expense">
                    <strong>{e.name}</strong>
                    {e.note && <span className="note">{e.note}</span>}
                  </td>
                  <td data-label="Category">{e.category}</td>
                  <td data-label="Payment">{e.payment}</td>
                  <td data-label="Date">{e.date}</td>
                  <td data-label="Amount">{formatKES(e.amount)}</td>
                  <td data-label="" className="row-actions">
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

      <Footer />
    </div>
  );
}

export default Expenses;
