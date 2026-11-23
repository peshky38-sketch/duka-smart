import { Fragment, useState } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import PageSkeleton from "../components/PageSkeleton";
import { Select, ComboInput } from "../components/Select";
import Status from "../components/Status";
import PayIcon from "../components/PayIcon";
import { useShop } from "../useShop";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Transactions.css";

function Transactions() {
  const shop = useShop();
  // sales are money coming in, expenses are money going out
  const when = (iso) => new Date(iso + "Z");
  const transactions = [
    ...shop.sales.map((x) => ({
      id: "s" + x.id,
      type: "sale",
      ref: "#" + x.number.replace("SALE-", "").slice(0, 5),
      description: x.items.map((i) => (i.quantity > 1 ? i.name + " x" + i.quantity : i.name)).join(", "),
      payment: x.payment,
      amount: x.total,
      stamp: x.createdAt,
    })),
    ...shop.expenses.map((x) => ({
      id: "e" + x.id,
      type: "expense",
      ref: "EXP-" + String(x.id).padStart(3, "0"),
      description: x.name,
      payment: x.payment,
      amount: x.amount,
      stamp: x.createdAt,
    })),
  ]
    .sort((a, b) => (a.stamp < b.stamp ? 1 : -1))
    .map((t) => ({
      ...t,
      date: when(t.stamp).toLocaleDateString("en-CA"),
      time: when(t.stamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    }));

  const [type, setType] = useState("all");
  const [payment, setPayment] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const perPage = 8;

  const shown = transactions.filter((t) => {
    if (type !== "all" && t.type !== type) return false;
    if (payment !== "all" && t.payment !== payment) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    const text = (t.ref + " " + t.description).toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    return true;
  });

  // the totals follow whatever is showing in the list
  const moneyIn = shown
    .filter((t) => t.type === "sale")
    .reduce((sum, t) => sum + t.amount, 0);
  const moneyOut = shown
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const net = moneyIn - moneyOut;

  const pages = Math.max(1, Math.ceil(shown.length / perPage));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * perPage;
  const pageRows = shown.slice(start, start + perPage);

  function downloadCsv() {
    let csv = "Date,Time,Type,Reference,Description,Payment,Amount\n";
    shown.forEach((t) => {
      csv += [t.date, t.time, t.type, t.ref, '"' + t.description + '"', t.payment, t.amount].join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  }

  function clearFilters() {
    setType("all");
    setPayment("all");
    setFrom("");
    setTo("");
    setSearch("");
    setPage(1);
  }

  if (shop.loading) return <PageSkeleton active="Transactions" kind="list" />;

  return (
    <div className="dash">
      <TopNav active="Transactions" />

      <main className="dash-main">
        <Status loading={shop.loading} error={shop.error} />

        <div className="dash-top">
          <div>
            <h1>Transactions</h1>
            <p className="dash-sub">Every sale and expense in one place</p>
          </div>
          <button className="csv-btn" onClick={downloadCsv}>Download CSV</button>
        </div>

        <div className="stat-grid trans-stats">
          <div className="stat-card">
            <span className="stat-label">Money in (sales)</span>
            <span className="stat-value money-in">{formatKES(moneyIn)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Money out (expenses)</span>
            <span className="stat-value money-out">{formatKES(moneyOut)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Net</span>
            <span className={net >= 0 ? "stat-value money-in" : "stat-value money-out"}>
              {net < 0 && "-"}{formatKES(Math.abs(net))}
            </span>
          </div>
        </div>

        <div className="type-tabs">
          <button className={type === "all" ? "selected" : ""} onClick={() => { setType("all"); setPage(1); }}>
            All
          </button>
          <button className={type === "sale" ? "selected" : ""} onClick={() => { setType("sale"); setPage(1); }}>
            Sales
          </button>
          <button className={type === "expense" ? "selected" : ""} onClick={() => { setType("expense"); setPage(1); }}>
            Expenses
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search reference or description"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Select value={payment} onChange={(v) => { setPayment(v); setPage(1); }} options={[{ value: "all", label: "All payment methods" }, { value: "Cash", label: "Cash", icon: <PayIcon method="Cash" /> }, { value: "M-Pesa", label: "M-Pesa", icon: <PayIcon method="M-Pesa" /> }, { value: "Card", label: "Card", icon: <PayIcon method="Card" /> }]} />
          <div className="date-filter">
            <label>From</label>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="date-filter">
            <label>To</label>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
          <button className="clear-btn" onClick={clearFilters}>Clear</button>
        </div>

        <div className="panel table-panel">
          <table className="stack">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <Fragment key={t.id}>
                  <tr className="clickable" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
                    <td data-label="Date">
                      {t.date}
                      <span className="time">{t.time}</span>
                    </td>
                    <td data-label="Type">
                      <span className={t.type === "sale" ? "tag tag-in" : "tag tag-out"}>
                        {t.type === "sale" ? "Sale" : "Expense"}
                      </span>
                    </td>
                    <td data-label="Reference">{t.ref}</td>
                    <td data-label="Description">{t.description}</td>
                    <td data-label="Payment">{t.payment}</td>
                    <td data-label="Amount" className={t.type === "sale" ? "money-in" : "money-out"}>
                      {t.type === "sale" ? "+" : "-"} {formatKES(t.amount)}
                    </td>
                  </tr>
                  {openId === t.id && (
                    <tr className="details-row">
                      <td colSpan="6">
                        <strong>{t.type === "sale" ? "Items sold" : "Expense"}</strong>
                        <ul>
                          {t.description.split(", ").map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <span className="time">
                          Recorded on {t.date} at {t.time}, paid by {t.payment}
                        </span>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="empty">No transactions match these filters.</p>
          )}

          {shown.length > 0 && (
            <div className="pagination">
              <span>
                Showing {start + 1} to {Math.min(start + perPage, shown.length)} of {shown.length}
              </span>
              <div>
                <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </button>
                <span className="page-number">
                  Page {currentPage} of {pages}
                </span>
                <button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Transactions;
