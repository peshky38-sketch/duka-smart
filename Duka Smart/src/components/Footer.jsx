import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import { getUser } from "../api";
import "./Footer.css";

// the bottom of every page: where you are, quick ways to get around, and the shop that is signed in
function Footer() {
  const user = getUser();
  const today = new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-brand">
          <div className="foot-logo">
            <img src={logo} alt="" width="34" height="34" />
            <span>Duka<b>Smart</b></span>
          </div>
          <p>Know your stock. Grow your shop.</p>
        </div>

        <nav className="foot-col" aria-label="Shop">
          <h4>Shop</h4>
          <Link to="/dashboard">Home</Link>
          <Link to="/inventory">Stock</Link>
          <Link to="/sales">Sales</Link>
        </nav>

        <nav className="foot-col" aria-label="Money">
          <h4>Money</h4>
          <Link to="/expenses">Expenses</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/reports">Reports</Link>
        </nav>

        <div className="foot-act">
          <h4>Quick start</h4>
          <Link to="/sales" className="foot-btn">New sale</Link>
          <Link to="/inventory" className="foot-btn ghost">Add a product</Link>
        </div>
      </div>

      <div className="foot-base">
        <span>{today}</span>
        <span>{user.username ? "Signed in as " + user.username : ""}{user.business ? " · " + user.business : ""}</span>
        <span>DukaSmart © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export default Footer;
