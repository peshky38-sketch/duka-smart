import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../api";
import { Select } from "../components/Select";
import AuthShell, { PasswordField } from "../components/AuthShell";

function Register() {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("Retail shop");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !shopName || !email || !phone || !address || !password || !confirm) {
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
    setBusy(true);
    try {
      await register({
        username: name,
        email: email,
        password: password,
        business_name: shopName,
        business_type: type,
        business_email: email,
        phone_number: phone,
        business_address: address,
        currency: "KES",
      });
      await login(email, password);
      localStorage.setItem("duka_business", shopName);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell wide>
      <div className="au-head">
        <h2>Create your account</h2>
        <p>Set up your shop in about five minutes. It is free to start.</p>
      </div>

      <form className="au-form" onSubmit={handleSubmit} noValidate>
        <div className="au-grid">
          <div className="au-field">
            <label htmlFor="name">Your full name</label>
            <input id="name" type="text" placeholder="e.g. Wanjiru Kamau" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="au-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="au-field">
            <label htmlFor="shop">Shop name</label>
            <input id="shop" type="text" placeholder="e.g. Mama Wanjiru Stores" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="au-field">
            <label htmlFor="type">Type of business</label>
            <Select id="type" value={type} onChange={setType} options={["Retail shop", "Wholesale", "Kiosk", "Salon or barber", "Hardware", "Other"]} />
          </div>

          <div className="au-field">
            <label htmlFor="phone">Business phone</label>
            <input id="phone" type="tel" placeholder="e.g. 0712 345 678" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="au-field">
            <label htmlFor="address">Location</label>
            <input id="address" type="text" placeholder="e.g. Gikomba Market, Nairobi" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="au-field">
            <label htmlFor="password">Password</label>
            <PasswordField id="password" placeholder="At least 8 characters" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="au-field">
            <label htmlFor="confirm">Confirm password</label>
            <PasswordField id="confirm" placeholder="Type it again" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>

        {error && <p className="au-error" role="alert">{error}</p>}

        <button type="submit" className="au-submit" disabled={busy}>
          {busy && <span className="au-spin" />}
          {busy ? "Creating your shop..." : "Create account"}
        </button>
      </form>

      <div className="au-or">Already have an account?</div>
      <Link to="/login" className="au-alt">Log in</Link>
    </AuthShell>
  );
}

export default Register;
