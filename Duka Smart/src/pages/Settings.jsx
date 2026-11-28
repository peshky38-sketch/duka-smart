import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import { getTheme, setTheme } from "../colorMode";
import { logout } from "../api";
import "./Dashboard.css";
import "./Account.css";

const MODES = [
  { id: "light", name: "Light", note: "Bright and warm, best in daylight." },
  { id: "dark", name: "Dark", note: "Easier on the eyes at night." },
  { id: "system", name: "Match my device", note: "Switches with your phone or computer." },
];

function Settings() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(getTheme());

  function choose(id) {
    setTheme(id);
    setMode(id);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="dash">
      <TopNav active="Settings" />
      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Settings</h1>
            <p className="dash-sub">Make DukaSmart look the way you like</p>
          </div>
        </div>

        <section className="panel settings-block">
          <h2>Appearance</h2>
          <div className="theme-grid" role="radiogroup" aria-label="Theme">
            {MODES.map((m) => (
              <button key={m.id} role="radio" aria-checked={mode === m.id} className={"theme-opt" + (mode === m.id ? " on" : "")} onClick={() => choose(m.id)}>
                <span className={"theme-preview " + m.id}>
                  <i /><i /><i />
                </span>
                <strong>{m.name}</strong>
                <small>{m.note}</small>
              </button>
            ))}
          </div>
          <p className="dash-sub">Saved on this device. Other devices keep their own choice.</p>
        </section>

        <section className="panel settings-block">
          <h2>Account</h2>
          <div className="detail-row"><span>Name, shop and profile picture</span><Link to="/profile" className="note-link">Open profile</Link></div>
          <div className="detail-row"><span>Stock and sales alerts</span><Link to="/notifications" className="note-link">Open notifications</Link></div>
          <div className="detail-row"><span>Sign out of this device</span><button className="cancel-btn" onClick={handleLogout}>Log out</button></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Settings;
