import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TopNav from "../components/TopNav";
import Status from "../components/Status";
import { Icon } from "../components/Icons";
import { useToast } from "../components/Toast";
import { get, post } from "../api";

function Suppliers() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(params.get("q") || "");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier_name: "", phone_number: "", email: "", address: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await get("/api/suppliers");
      setList(d.suppliers || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(e) {
    e.preventDefault();
    if (!form.supplier_name.trim()) {
      setFormError("Please enter the supplier's name");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await post("/api/suppliers", {
        supplier_name: form.supplier_name.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim(),
      });
      await load();
      setShowForm(false);
      setForm({ supplier_name: "", phone_number: "", email: "", address: "" });
      toast("Supplier added");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const shown = list.filter((s) => (s.supplier_name + " " + (s.phone_number || "")).toLowerCase().includes(search.toLowerCase()));
  const waLink = (phone) => "https://wa.me/" + String(phone || "").replace(/\D/g, "").replace(/^0/, "254");

  return (
    <div className="dash">
      <TopNav active="Suppliers" />
      <main className="dash-main">
        <div className="page-head">
          <div>
            <h1>Suppliers</h1>
            <p>The people you buy your stock from.</p>
          </div>
          <div className="page-actions">
            <button className="solid-btn" onClick={() => setShowForm(true)}><Icon name="plus" />Add supplier</button>
          </div>
        </div>

        <Status loading={loading} error={error} />

        <div className="card2 inv-panel">
          <div className="inv-bar">
            <div className="sale-search" style={{ margin: 0, width: "100%", maxWidth: 380 }}>
              <div className="box">
                <Icon name="search" className="" />
                <input placeholder="Search suppliers" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search suppliers" />
              </div>
            </div>
          </div>
          <table className="inv-table sup-table">
            <thead><tr><th>SUPPLIER</th><th className="hide-m">PHONE</th><th className="hide-m">ADDRESS</th><th></th></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td><div className="pcell"><span className="emoji-tile">🚚</span><div><b>{s.supplier_name}</b><small>{s.email || ""}</small></div></div></td>
                  <td className="hide-m">{s.phone_number && !s.phone_number.startsWith("not given") ? s.phone_number : "-"}</td>
                  <td className="hide-m">{s.address || "-"}</td>
                  <td>{s.phone_number && !s.phone_number.startsWith("not given") && <a className="link-sm" href={waLink(s.phone_number)} target="_blank" rel="noreferrer">WhatsApp</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && shown.length === 0 && <p className="empty2">{list.length === 0 ? "No suppliers yet. Add one, or type a new supplier when adding a product." : "No suppliers match."}</p>}
        </div>
      </main>

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>Add supplier</h2>
            <div className="form-grid">
              <div className="full"><label>Supplier name</label><input value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} /></div>
              <div><label>Phone (optional)</label><input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></div>
              <div><label>Email (optional)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="full"><label>Address (optional)</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            {formError && <p className="auth-error">{formError}</p>}
            <div className="modal-buttons">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="add-btn" disabled={saving}>{saving ? "Saving..." : "Save supplier"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
