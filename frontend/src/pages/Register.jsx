import { useState } from "react";
import logo from "../assets/logo.svg";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !shopName || !email || !password || !confirm) {
      setError("Please fill in all the fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    // api call will go here once the backend is ready
    console.log("register", name, shopName, email, password);
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

        <h1>Set up your shop in 5 minutes.</h1>
        <p>Add your products, record sales and get an alert before you run out of stock.</p>
      </div>

      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <p className="auth-sub">It's free to start</p>

          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Wanjiru Kamau"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="shop">Shop name</label>
          <input
            id="shop"
            type="text"
            placeholder="e.g. Mama Wanjiru Stores"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            placeholder="Type the password again"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn">
            Create account
          </button>

          <p className="auth-switch">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
