import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useApp } from "../context/AppContext.jsx";

const STATS = [["5 min", "to set up your first shop"], ["3 ways", "to pay: cash, M-Pesa, card"], ["Live", "stock count after every sale"], ["1 click", "to see your daily profit"]];
const FEATURES = [
  ["📦", "Real-time inventory", "Know what is in stock, what is running low and what to reorder, instantly."],
  ["🛒", "Effortless sales", "Record a sale in seconds with cash, M-Pesa or card."],
  ["🧾", "Expenses and profit", "Log rent, transport and stock costs. See your true profit."],
  ["🔔", "Low-stock alerts", "Get a message before the shelf is empty, not after."],
];
const STEPS = [
  ["Add your products", "Type them in or scan their barcodes."],
  ["Record every sale", "Cash, M-Pesa or card. Stock goes down automatically."],
  ["See your real profit", "Sales, costs and expenses in one clear number, every day."],
];

export default function Landing() {
  const { user } = useApp();
  return (
    <div className="land">
      <header className="land-nav">
        <Logo />
        <nav>
          <a className="plain" href="#features">Features</a>
          <a className="plain" href="#how">How it works</a>
          {user ? (
            <Link className="btn" to="/">Open app</Link>
          ) : (
            <>
              <Link className="btn out" to="/login">Log in</Link>
              <Link className="btn" to="/register">Start free</Link>
            </>
          )}
        </nav>
      </header>

      <section className="land-hero">
        <div>
          <span className="chip">BUILT FOR SHOP OWNERS ACROSS AFRICA</span>
          <h1 style={{ marginTop: 14 }}>Know your stock.<br /><span>Grow your shop.</span></h1>
          <p className="lead">DukaSmart helps you track stock, record sales and expenses, and see your profit, all from your phone or computer. You also get an alert before you run out.</p>
          <Link className="btn" to={user ? "/" : "/register"} style={{ padding: "14px 22px" }}>Start managing for free →</Link>
        </div>
        <div className="land-art">
          🏪
          <div className="float a"><span className="muted">Today's sales</span><br /><b>KES 48,250</b> <span className="chip">+12%</span></div>
          <div className="float b">⚠️ <b>Sugar 1kg is running low</b><br /><small className="muted">4 left · reorder at 25</small></div>
        </div>
      </section>

      <section className="land-stats">
        {STATS.map(([big, small]) => (
          <div key={big}><b>{big}</b><span className="muted">{small}</span></div>
        ))}
      </section>

      <section className="land-sec" id="features">
        <h2>Run your shop with <span className="green">confidence</span></h2>
        <div className="kpis">
          {FEATURES.map(([icon, title, text]) => (
            <div className="card" key={title}><h3>{icon} {title}</h3><p className="muted" style={{ marginTop: 6 }}>{text}</p></div>
          ))}
        </div>
      </section>

      <section className="land-sec" id="how">
        <h2>How it works</h2>
        <div className="land-steps">
          {STEPS.map(([title, text], i) => (
            <div className="step" key={title}>
              <i>{i + 1}</i>
              <div><b>{title}</b><p className="muted">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="land-cta">
        <div><h2>Ready to take control of your stock?</h2><p style={{ opacity: 0.8 }}>Free to start. No card needed.</p></div>
        <Link className="btn" to={user ? "/" : "/register"}>Start managing for free</Link>
      </section>

      <footer className="land-foot">DukaSmart · Smart Business Management System · Final year project</footer>
    </div>
  );
}
