import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import { useShop } from "../useShop";
import { getUser, logout } from "../api";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Inventory.css";
import "./Account.css";

function Profile() {
  const navigate = useNavigate();
  const user = getUser();
  const { products, sales, expenses, loading, error } = useShop();
  const initials = (user.username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return <PageSkeleton active="Dashboard" kind="list" />;

  const revenue = sales.reduce((t, s) => t + s.total, 0);
  const spent = expenses.reduce((t, e) => t + e.amount, 0);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="dash">
      <TopNav active="Profile" />
      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>My profile</h1>
            <p className="dash-sub">Your account and shop at a glance</p>
          </div>
        </div>

        <Status error={error} />

        <div className="panel profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <h2>{user.username || "Shop owner"}</h2>
            <p>{user.business || "Shop name not set"}</p>
          </div>
          <button className="cancel-btn" onClick={handleLogout}>Log out</button>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><span className="stat-label">Products</span><span className="stat-value">{products.length}</span></div>
          <div className="stat-card"><span className="stat-label">Sales made</span><span className="stat-value">{sales.length}</span></div>
          <div className="stat-card"><span className="stat-label">Total sales</span><span className="stat-value">{formatKES(revenue)}</span></div>
          <div className="stat-card"><span className="stat-label">Total spent</span><span className="stat-value">{formatKES(spent)}</span></div>
        </div>

        <div className="panel profile-details">
          <h2>Account details</h2>
          <div className="detail-row"><span>Name</span><b>{user.username || "-"}</b></div>
          <div className="detail-row"><span>Shop</span><b>{user.business || "-"}</b></div>
          <div className="detail-row"><span>Currency</span><b>Kenya Shilling (KES)</b></div>
          <p className="dash-sub">Editing these details needs a profile update route on the backend, so they are read-only for now.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
