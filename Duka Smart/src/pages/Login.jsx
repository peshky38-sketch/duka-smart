import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import AuthShell, { PasswordField } from "../components/AuthShell";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="au-head">
        <h2>Welcome back</h2>
        <p>Log in to manage your shop.</p>
      </div>

      <form className="au-form" onSubmit={handleSubmit} noValidate>
        <div className="au-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="au-field">
          <label htmlFor="password">Password</label>
          <PasswordField id="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="au-error" role="alert">{error}</p>}

        <button type="submit" className="au-submit" disabled={busy}>
          {busy && <span className="au-spin" />}
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="au-or">New to DukaSmart?</div>
      <Link to="/register" className="au-alt">Create an account</Link>
    </AuthShell>
  );
}

export default Login;
