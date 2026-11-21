import { useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import "../profile.css";

// Crops the picture to a square and shrinks it to 256x256 so it stays small (about 20 KB)
const toAvatar = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 256;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("That file is not a valid image."));
    img.src = url;
  });

export default function Profile() {
  const { user, updateProfile, changePassword } = useApp();
  const fileRef = useRef(null);

  // ----- profile picture -----
  const [photoMsg, setPhotoMsg] = useState(null);

  const pickPhoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoMsg({ ok: false, text: "Please choose an image file." });
    if (file.size > 5 * 1024 * 1024) return setPhotoMsg({ ok: false, text: "That image is too large (maximum 5 MB)." });
    try {
      await updateProfile({ avatar: await toAvatar(file) });
      setPhotoMsg({ ok: true, text: "Photo updated." });
    } catch (err) {
      setPhotoMsg({ ok: false, text: err.message });
    }
  };

  const removePhoto = async () => {
    try {
      await updateProfile({ avatar: null });
      setPhotoMsg({ ok: true, text: "Photo removed." });
    } catch (err) {
      setPhotoMsg({ ok: false, text: err.message });
    }
  };

  // ----- personal details -----
  const [f, setF] = useState({
    name: user.name || "",
    shop: user.shop || "",
    phone: user.phone || "",
    location: user.location || "",
  });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const saveDetails = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(f);
      setMsg({ ok: true, text: "Profile updated." });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
  };

  // ----- password -----
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const setP = (k) => (e) => setPw({ ...pw, [k]: e.target.value });

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: "The new passwords do not match." });
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ ok: true, text: "Password changed." });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });
    }
  };

  const initials = (user.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <div className="top">
        <div>
          <h1>Profile</h1>
          <p className="muted">Your photo, details and password.</p>
        </div>
      </div>

      <div className="profile">
        <div className="card who">
          <div className="avatar">{user.avatar ? <img src={user.avatar} alt="Your profile" /> : initials}</div>
          <div>
            <h2>{user.name}</h2>
            <p className="muted">Owner · {user.shop}</p>
            <p className="muted">{user.email}</p>
            <div className="actions">
              <button type="button" className="btn out" onClick={() => fileRef.current.click()}>
                {user.avatar ? "Change photo" : "Upload photo"}
              </button>
              {user.avatar && <button type="button" className="btn out" onClick={removePhoto}>Remove</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickPhoto} />
            {photoMsg && <div className={"banner" + (photoMsg.ok ? " ok" : "")}>{photoMsg.text}</div>}
          </div>
        </div>

        <form className="card" onSubmit={saveDetails}>
          <b>Personal details</b>
          {msg && <div className={"banner" + (msg.ok ? " ok" : "")}>{msg.text}</div>}
          <label>Your name<input required value={f.name} onChange={set("name")} /></label>
          <label>Shop name<input required value={f.shop} onChange={set("shop")} /></label>
          <label>Email<input value={user.email || ""} disabled /></label>
          <div className="two-col">
            <label>Phone<input type="tel" placeholder="07xx xxx xxx" value={f.phone} onChange={set("phone")} /></label>
            <label>Town or location<input placeholder="e.g. Eldoret" value={f.location} onChange={set("location")} /></label>
          </div>
          <button className="btn">Save changes</button>
        </form>

        <form className="card" onSubmit={savePassword}>
          <b>Change password</b>
          {pwMsg && <div className={"banner" + (pwMsg.ok ? " ok" : "")}>{pwMsg.text}</div>}
          <label>Current password<input type="password" required value={pw.current} onChange={setP("current")} /></label>
          <div className="two-col">
            <label>New password<input type="password" minLength="6" required value={pw.next} onChange={setP("next")} /></label>
            <label>Confirm new password<input type="password" minLength="6" required value={pw.confirm} onChange={setP("confirm")} /></label>
          </div>
          <button className="btn">Change password</button>
        </form>
      </div>
    </>
  );
}
