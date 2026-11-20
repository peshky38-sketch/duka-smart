import { Fragment, useState } from "react";
import Sidebar from "../components/Sidebar";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Transactions.css";

function Transactions() {
  // sample transactions for now, will come from the api later
  // sales are money coming in, expenses are money going out
  const [transactions] = useState([
    { id: 1, type: "sale", ref: "#1042", description: "Sugar, Unga, Milk", payment: "Cash", amount: 640, date: "2026-11-16", time: "10:42 am" },
    { id: 2, type: "sale", ref: "#1041", description: "Cooking oil, Rice", payment: "M-Pesa", amount: 880, date: "2026-11-16", time: "10:15 am" },
    { id: 3, type: "expense", ref: "EXP-006", description: "Carrier bags", payment: "Cash", amount: 350, date: "2026-11-14", time: "4:30 pm" },
    { id: 4, type: "sale", ref: "#1040", description: "Bread, Eggs", payment: "Cash", amount: 310, date: "2026-11-14", time: "9:50 am" },
    { id: 5, type: "expense", ref: "EXP-005", description: "Shop assistant wages", payment: "M-Pesa", amount: 4000, date: "2026-11-13", time: "6:00 pm" },
    { id: 6, type: "sale", ref: "#1039", description: "Tea leaves, Sugar", payment: "Cash", amount: 275, date: "2026-11-13", time: "9:21 am" },
    { id: 7, type: "sale", ref: "#1038", description: "Milk x6", payment: "M-Pesa", amount: 390, date: "2026-11-12", time: "5:05 pm" },
    { id: 8, type: "expense", ref: "EXP-004", description: "Transport to market", payment: "Cash", amount: 600, date: "2026-11-12", time: "7:40 am" },
    { id: 9, type: "sale", ref: "#1037", description: "Unga x2, Cooking oil", payment: "Card", amount: 750, date: "2026-11-11", time: "1:12 pm" },
    { id: 10, type: "expense", ref: "EXP-003", description: "Stock from Baraka Foods", payment: "Cash", amount: 8200, date: "2026-11-10", time: "11:00 am" },
    { id: 11, type: "sale", ref: "#1036", description: "Bar soap x3, Bread", payment: "Cash", amount: 245, date: "2026-11-10", time: "10:20 am" },
    { id: 12, type: "sale", ref: "#1035", description: "Eggs (tray), Milk", payment: "M-Pesa", amount: 515, date: "2026-11-09", time: "3:48 pm" },
    { id: 13, type: "expense", ref: "EXP-002", description: "KPLC tokens", payment: "M-Pesa", amount: 1500, date: "2026-11-08", time: "8:15 am" },
    { id: 14, type: "expense", ref: "EXP-001", description: "Shop rent", payment: "M-Pesa", amount: 15000, date: "2026-11-05", time: "9:00 am" },
  ]);

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

  return (
    <div className="dash">
      <Sidebar active="Transactions" />

      <main className="dash-main">
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
          <select value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }}>
            <option value="all">All payment methods</option>
            <option>Cash</option>
            <option>M-Pesa</option>
            <option>Card</option>
          </select>
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
          <table>
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
                    <td>
                      {t.date}
                      <span className="time">{t.time}</span>
                    </td>
                    <td>
                      <span className={t.type === "sale" ? "tag tag-in" : "tag tag-out"}>
                        {t.type === "sale" ? "Sale" : "Expense"}
                      </span>
                    </td>
                    <td>{t.ref}</td>
                    <td>{t.description}</td>
                    <td>{t.payment}</td>
                    <td className={t.type === "sale" ? "money-in" : "money-out"}>
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
    </div>
  );
}

export default Transactions;
