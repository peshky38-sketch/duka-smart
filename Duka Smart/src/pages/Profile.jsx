import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import { useToast } from "../components/Toast";
import { useShop } from "../useShop";
import { getUser, getProfile, logout, rememberProfile, saveProfile } from "../api";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Inventory.css";
import "./Account.css";

// shrinks the chosen photo to a small square so it is quick to save and load
function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not a picture"));
    };
    img.src = url;
  });
}

function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const { products, sales, expenses, loading, error } = useShop();

  const saved = getUser();
  const [picture, setPicture] = useState(saved.picture);
  const [form, setForm] = useState({ username: saved.username, business_name: saved.business, business_address: "", phone_number: "" });
  const [info, setInfo] = useState({ email: "", currency: "" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  // fresh details from the server
  useEffect(() => {
    getProfile()
      .then((p) => {
        rememberProfile(p);
        if (typeof p.picture === "string" && p.picture.startsWith("data:image/")) setPicture(p.picture);
        setForm({ username: p.username || "", business_name: p.business_name || "", business_address: p.business_address || "", phone_number: p.phone_number || "" });
        setInfo({ email: p.email || "", currency: p.currency || "" });
      })
      .catch(() => {});
  }, []);

  const initials = (form.username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  async function choosePhoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const data = await shrinkPhoto(file);
      await saveProfile({ picture: data });
      setPicture(data);
      toast("Photo updated");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    setBusy(true);
    try {
      await saveProfile({ picture: "" });
      setPicture("");
      toast("Photo removed");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    if (!form.username.trim() || !form.business_name.trim()) {
      setFormError("Please fill in your name and shop name");
      return;
    }
    setBusy(true);
    try {
      const changes = { username: form.username, business_name: form.business_name };
      if (form.business_address.trim()) changes.business_address = form.business_address;
      if (form.phone_number.trim()) changes.phone_number = form.phone_number;
      const data = await saveProfile(changes);
      setForm({ username: data.username, business_name: data.business_name, business_address: data.business_address, phone_number: data.phone_number });
      toast("Profile saved");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) return <PageSkeleton active="Dashboard" kind="list" />;

  const revenue = sales.reduce((t, s) => t + s.total, 0);
  const spent = expenses.reduce((t, x) => t + x.amount, 0);

  return (
    <div className="dash">
      <TopNav active="Profile" />
      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>My profile</h1>
            <p className="dash-sub">Your account and shop details</p>
          </div>
        </div>

        <Status error={error} />

        <div className="panel profile-card">
          <div className="profile-avatar">{picture ? <img src={picture} alt="Profile" /> : initials}</div>
          <div className="profile-info">
            <h2>{form.username || "Shop owner"}</h2>
            <p>{form.business_name || "Shop name not set"}</p>
            <div className="photo-actions">
              <input ref={fileRef} type="file" accept="image/*" onChange={choosePhoto} hidden />
              <button className="add-btn" onClick={() => fileRef.current.click()} disabled={busy}>{picture ? "Change photo" : "Add photo"}</button>
              {picture && <button className="cancel-btn" onClick={removePhoto} disabled={busy}>Remove</button>}
            </div>
          </div>
          <button className="cancel-btn" onClick={handleLogout}>Log out</button>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><span className="stat-label">Products</span><span className="stat-value">{products.length}</span></div>
          <div className="stat-card"><span className="stat-label">Sales made</span><span className="stat-value">{sales.length}</span></div>
          <div className="stat-card"><span className="stat-label">Total sales</span><span className="stat-value">{formatKES(revenue)}</span></div>
          <div className="stat-card"><span className="stat-label">Total spent</span><span className="stat-value">{formatKES(spent)}</span></div>
        </div>

        <form className="panel profile-details" onSubmit={handleSave}>
          <h2>Account details</h2>
          <div className="profile-fields">
            <div>
              <label htmlFor="pf-name">Your name</label>
              <input id="pf-name" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label htmlFor="pf-shop">Shop name</label>
              <input id="pf-shop" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="pf-addr">Shop address</label>
              <input id="pf-addr" value={form.business_address} onChange={(e) => setForm({ ...form, business_address: e.target.value })} />
            </div>
            <div>
              <label htmlFor="pf-phone">Shop phone</label>
              <input id="pf-phone" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div>
              <label>Email</label>
              <input value={info.email} disabled />
            </div>
            <div>
              <label>Currency</label>
              <input value={info.currency || "KES"} disabled />
            </div>
          </div>
          {formError && <p className="auth-error">{formError}</p>}
          <div className="modal-buttons">
            <button type="submit" className="add-btn" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
