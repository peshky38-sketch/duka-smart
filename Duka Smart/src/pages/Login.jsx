import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
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
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your shop.</p>
        {error && <div className="banner">{error}</div>}
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
