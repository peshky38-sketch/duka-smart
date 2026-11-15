import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Register() {
  const { register } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", shop: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(f);
      nav("/");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="auth">
      <form className="card" onSubmit={submit}>
        <Logo />
        <h1>Start managing for free</h1>
        <p className="muted">Set up your shop in about 5 minutes.</p>
        {error && <div className="banner">{error}</div>}
        <label>Your name<input required value={f.name} onChange={set("name")} /></label>
        <label>Shop name<input required value={f.shop} onChange={set("shop")} /></label>
        <label>Email<input type="email" required value={f.email} onChange={set("email")} /></label>
        <label>Password<input type="password" minLength="6" required value={f.password} onChange={set("password")} /></label>
        <button className="btn full" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
