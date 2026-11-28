import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import { useShop } from "../useShop";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Account.css";

// notifications are worked out from the shop's own data, so they are always up to date
function Notifications() {
  const { products, sales, expenses, loading, error } = useShop();

  if (loading) return <PageSkeleton active="Dashboard" kind="list" />;

  const today = new Date().toDateString();
  const isToday = (iso) => iso && new Date(iso).toDateString() === today;

  const items = [];

  products
    .filter((p) => p.quantity === 0)
    .forEach((p) => items.push({ id: "out" + p.id, level: "out", title: p.name + " is out of stock", text: "Restock it before the next customer asks.", link: "/inventory", action: "Open stock" }));

  products
    .filter((p) => p.quantity > 0 && p.quantity <= p.threshold)
    .forEach((p) => items.push({ id: "low" + p.id, level: "low", title: p.name + " is running low", text: p.quantity + " left (alert level " + p.threshold + ").", link: "/inventory", action: "Open stock" }));

  const todaySales = sales.filter((s) => isToday(s.createdAt));
  if (todaySales.length > 0) {
    const sum = todaySales.reduce((t, s) => t + s.total, 0);
    items.push({ id: "sales", level: "good", title: todaySales.length + (todaySales.length === 1 ? " sale" : " sales") + " today", text: formatKES(sum) + " taken so far.", link: "/transactions", action: "View transactions" });
  }

  const todayExpenses = expenses.filter((e) => isToday(e.createdAt));
  if (todayExpenses.length > 0) {
    const sum = todayExpenses.reduce((t, e) => t + e.amount, 0);
    items.push({ id: "exp", level: "info", title: formatKES(sum) + " spent today", text: todayExpenses.length + (todayExpenses.length === 1 ? " expense" : " expenses") + " recorded.", link: "/expenses", action: "View expenses" });
  }

  if (products.length === 0) {
    items.push({ id: "start", level: "info", title: "Add your first product", text: "Your stock list is empty.", link: "/inventory", action: "Add a product" });
  }

  return (
    <div className="dash">
      <TopNav active="Notifications" />
      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Notifications</h1>
            <p className="dash-sub">Stock alerts and today's activity</p>
          </div>
        </div>

        <Status error={error} />

        <div className="panel note-list">
          {items.length === 0 && <p className="empty">You are all caught up. Nothing needs your attention.</p>}
          {items.map((n) => (
            <div className={"note note-" + n.level} key={n.id}>
              <span className="note-dot" />
              <div className="note-body">
                <strong>{n.title}</strong>
                <span>{n.text}</span>
              </div>
              <Link to={n.link} className="note-link">{n.action}</Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Notifications;
