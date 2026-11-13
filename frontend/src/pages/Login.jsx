import { useState } from "react";
import logo from "../assets/logo.svg";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setError("");
    // api call will go here once the backend is ready
    console.log("login", email, password);
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-brand">
          <img src={logo} alt="DukaSmart logo" width="44" height="44" />
          <span className="brand-name">
            Duka<span className="brand-light">Smart</span>
          </span>
        </div>

        <h1>Know your stock. Grow your shop.</h1>
        <p>
          Track your products, record sales and see your profit every day, all
          in one place.
        </p>
      </div>

      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="auth-sub">Log in to manage your shop</p>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn">
            Log in
          </button>

          <p className="auth-switch">
            Don't have an account? <a href="/register">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
