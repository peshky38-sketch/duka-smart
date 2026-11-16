import { useState } from "react";
import Sidebar from "../components/Sidebar";
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

  return (
    <div className="dash">
      <Sidebar active="Transactions" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Transactions</h1>
            <p className="dash-sub">Every sale and expense in one place</p>
          </div>
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
              {transactions.map((t) => (
                <tr key={t.id}>
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
                    {t.type === "sale" ? "+" : "-"} KES {t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Transactions;
