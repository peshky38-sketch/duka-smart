import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getTheme, applyTheme } from "../theme";

const THEMES = [
  ["light", "☀️", "Light", "Bright and clear, best in daylight"],
  ["dark", "🌙", "Dark", "Easier on the eyes at night"],
];

export default function Settings() {
  const { user, logout } = useApp();
  const [theme, setTheme] = useState(getTheme());

  const choose = (t) => {
    applyTheme(t);
    setTheme(t);
  };

  return (
    <>
      <div className="top">
        <div>
          <h1>Settings</h1>
          <p className="muted">Choose how DukaSmart looks and manage your account.</p>
        </div>
      </div>

      <div className="settings">
        <div className="card">
          <b>Appearance</b>
          <div className="themes">
            {THEMES.map(([key, icon, label, note]) => (
              <button key={key} className={"theme" + (theme === key ? " on" : "")} onClick={() => choose(key)}>
                <span>{icon}</span>
                <b>{label}</b>
                <small className="muted">{note}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <b>Account</b>
          <div className="row"><span className="muted">Name</span><b>{user.name}</b></div>
          <div className="row"><span className="muted">Shop</span><b>{user.shop}</b></div>
          <div className="row"><span className="muted">Email</span><b>{user.email}</b></div>
          <button className="btn danger" style={{ marginTop: 16 }} onClick={logout}>Log out</button>
        </div>
      </div>
    </>
  );
}
