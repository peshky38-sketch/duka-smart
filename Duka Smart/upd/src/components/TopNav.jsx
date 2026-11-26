import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { get, getUser, logout } from "../api";
import "./TopNav.css";


const icons = {
  Dashboard: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  Inventory: <path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" />,
  Sales: <path d="M4 6h16l-1.5 9h-13L4 6zM4 6L3 3H1M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z" />,
  Expenses: <path d="M3 7h18v12H3V7zM3 7l3-3h12l3 3M16 13h2" />,
  Transactions: <path d="M4 8h14l-3-3M20 16H6l3 3" />,
  Reports: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  Bell: <path d="M6 17V11a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4" />,
  Plus: <path d="M12 5v14M5 12h14" />,
  More: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  Out: <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />,
};

const links = [
  { name: "Dashboard", label: "Home", href: "/dashboard" },
  { name: "Inventory", label: "Stock", href: "/inventory" },
  { name: "Sales", label: "Sales", href: "/sales" },
  { name: "Expenses", label: "Expenses", href: "/expenses" },
  { name: "Transactions", label: "Transactions", href: "/transactions" },
  { name: "Reports", label: "Reports", href: "/reports" },
];

const Icon = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;


function useOutside(ref, close) {
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, close]);
}

function TopNav({ active }) {
  const navigate = useNavigate();
  const user = getUser();
  const initials = (user.username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const [low, setLow] = useState([]);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);
  useOutside(bellRef, () => setBell(false));
  useOutside(menuRef, () => setMenu(false));

  
  useEffect(() => {
    let alive = true;
    get("/api/products/low-stock")
      .then((d) => alive && setLow(d.low_stock_products || []))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    logout();
    navigate("/login");
  }

  const tabs = links.filter((l) => l.name !== "Transactions" && l.name !== "Reports");

  return (
    <>
      <header className="topnav">
        <div className="tn-inner">
          <Link to="/dashboard" className="tn-logo">
            <img src={logo} alt="" width="34" height="34" />
            <span>Duka<b>Smart</b></span>
          </Link>

          <nav className="tn-tabs" aria-label="Main">
            {links.map((l) => (
              <Link key={l.name} to={l.href} className={active === l.name ? "on" : ""}>
                <Icon name={l.name} />
                <span>{l.label}</span>
                {l.name === "Inventory" && low.length > 0 && <em className="tn-badge">{low.length}</em>}
              </Link>
            ))}
          </nav>

          <div className="tn-right">
            {active !== "Sales" && (
              <Link to="/sales" className="tn-new"><Icon name="Plus" /><span>New sale</span></Link>
            )}

            <div className="tn-pop" ref={bellRef}>
              <button className="tn-icon" onClick={() => { setBell(!bell); setMenu(false); }} aria-label="Low stock alerts" aria-expanded={bell}>
                <Icon name="Bell" />
                {low.length > 0 && <em className="tn-badge">{low.length}</em>}
              </button>
              {bell && (
                <div className="tn-card bell-card">
                  <strong>Running low</strong>
                  {low.length === 0 && <p>Nothing is running low.</p>}
                  {low.slice(0, 6).map((p) => (
                    <div className="tn-row" key={p.id}>
                      <span>{p.name}</span>
                      <b className={p.quantity === 0 ? "out" : "low"}>{p.quantity === 0 ? "Out" : p.quantity + " left"}</b>
                    </div>
                  ))}
                  <Link to="/notifications" onClick={() => setBell(false)} className="tn-more">See all notifications</Link>
                </div>
              )}
            </div>

            <div className="tn-pop" ref={menuRef}>
              <button className="tn-avatar" onClick={() => { setMenu(!menu); setBell(false); }} aria-label="Account" aria-expanded={menu}>{initials}</button>
              {menu && (
                <div className="tn-card me-card">
                  <div className="tn-me">
                    <div className="tn-avatar big">{initials}</div>
                    <div>
                      <strong>{user.username || "Your shop"}</strong>
                      <span>{user.business || "Signed in"}</span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setMenu(false)} className="tn-more">My profile</Link>
                  <a href="/login" onClick={handleLogout} className="tn-out"><Icon name="Out" />Log out</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* phones: a floating bar at the bottom with Sell raised in the middle */}
      <nav className="tabbar" aria-label="Main">
        <Link to="/dashboard" className={active === "Dashboard" ? "tab on" : "tab"}><Icon name="Dashboard" /><span>Home</span></Link>
        <Link to="/inventory" className={active === "Inventory" ? "tab on" : "tab"}>
          <Icon name="Inventory" /><span>Stock</span>
          {low.length > 0 && <em className="tn-badge">{low.length}</em>}
        </Link>
        <Link to="/sales" className={active === "Sales" ? "tab sell on" : "tab sell"} aria-label="Sell"><span className="sell-btn"><Icon name="Sales" /></span><span>Sell</span></Link>
        <Link to="/expenses" className={active === "Expenses" ? "tab on" : "tab"}><Icon name="Expenses" /><span>Costs</span></Link>
        <button className={active === "Transactions" || active === "Reports" || more ? "tab on" : "tab"} onClick={() => setMore(!more)}>
          <Icon name="More" /><span>More</span>
        </button>
      </nav>

      {more && (
        <div className="more-backdrop" onClick={() => setMore(false)}>
          <div className="more-sheet" onClick={(e) => e.stopPropagation()}>
            <Link to="/transactions" onClick={() => setMore(false)}>Transactions</Link>
            <Link to="/reports" onClick={() => setMore(false)}>Reports</Link>
            <Link to="/notifications" onClick={() => setMore(false)}>Notifications</Link>
            <Link to="/profile" onClick={() => setMore(false)}>Profile</Link>
            <a href="/login" onClick={handleLogout}>Log out</a>
          </div>
        </div>
      )}
    </>
  );
}

export default TopNav;
