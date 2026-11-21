import { useState } from "react";
import { useApp, isLow, isOut } from "../context/AppContext.jsx";
import { reorderMessage, whatsappLink } from "../whatsapp";

function SupplierForm({ supplier, onSave, onClose }) {
  const [f, setF] = useState(supplier || { name: "", phone: "", deliveryDays: 1, notes: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave({ ...f, deliveryDays: Number(f.deliveryDays) });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{supplier ? "Edit supplier" : "Add supplier"}</h2>
        {error && <div className="banner">{error}</div>}
        <label>Supplier name<input required value={f.name} onChange={set("name")} /></label>
        <div className="two-col">
          <label>Phone (WhatsApp)<input type="tel" required placeholder="07xx xxx xxx" value={f.phone} onChange={set("phone")} /></label>
          <label>Delivers in (days)<input type="number" min="0" required value={f.deliveryDays} onChange={set("deliveryDays")} /></label>
        </div>
        <label>What they supply<input value={f.notes} onChange={set("notes")} placeholder="e.g. Unga, sugar, rice" /></label>
        <div className="actions">
          <button type="button" className="btn out" onClick={onClose}>Cancel</button>
          <button className="btn">Save supplier</button>
        </div>
      </form>
    </div>
  );
}

export default function Suppliers() {
  const { suppliers, saveSupplier, deleteSupplier, products, user } = useApp();
  const [form, setForm] = useState(null); // null = closed, {} = add, supplier = edit
  const [supId, setSupId] = useState("");
  const [off, setOff] = useState({}); // products the owner unticked
  const [qty, setQty] = useState({}); // quantities the owner changed
  const [err, setErr] = useState("");

  const needs = products.filter((p) => isLow(p) || isOut(p)).sort((a, b) => a.qty - b.qty);
  const suggested = (p) => Math.max(p.minStock * 2 - p.qty, 1); // enough to get back above the reorder level
  const amount = (p) => Number(qty[p.id] ?? suggested(p));
  const chosen = needs.filter((p) => !off[p.id]);
  const supplier = suppliers.find((s) => String(s.id) === String(supId)) || suppliers[0];

  const send = () => {
    if (!supplier || chosen.length === 0) return;
    const text = reorderMessage(user.shop, supplier.name, chosen.map((p) => ({ name: p.name, qty: amount(p) })));
    window.open(whatsappLink(supplier.phone, text), "_blank");
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}?`)) return;
    try {
      await deleteSupplier(s.id);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <div className="top">
        <div>
          <h1>Suppliers</h1>
          <p className="muted">Who you buy from, and a quick way to reorder what is running low.</p>
        </div>
        <button className="btn" onClick={() => setForm({})}>+ Add supplier</button>
      </div>

      {err && <div className="banner">{err}</div>}

      <div className="sup-grid">
        {suppliers.map((s) => (
          <div className="card sup" key={s.id}>
            <b>{s.name}</b>
            <span className="muted">📞 {s.phone}</span>
            <span className="muted">🚚 Delivers in {s.deliveryDays} day{s.deliveryDays === 1 ? "" : "s"}</span>
            {s.notes && <span className="muted">{s.notes}</span>}
            <div>
              <button className="link" onClick={() => setForm(s)}>Edit</button>
              <button className="link red" onClick={() => remove(s)}>Delete</button>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && <p className="muted">No suppliers yet. Add your first one.</p>}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row">
          <b>Reorder low-stock items</b>
          <span className="chip low">{needs.length} items</span>
        </div>
        {needs.length === 0 && <p className="muted" style={{ paddingTop: 12 }}>Nothing to reorder. Everything is well stocked.</p>}
        {needs.map((p) => (
          <div className="rr" key={p.id}>
            <input type="checkbox" checked={!off[p.id]} onChange={() => setOff({ ...off, [p.id]: !off[p.id] })} />
            <span className="grow">{p.emoji} <b>{p.name}</b><br />
              <small className="muted">{p.qty === 0 ? "Out of stock" : `${p.qty} left`} · reorder at {p.minStock}</small>
            </span>
            <input type="number" min="1" value={amount(p)} onChange={(e) => setQty({ ...qty, [p.id]: e.target.value })} />
          </div>
        ))}
        {needs.length > 0 && (
          <>
            <label>Send to
              <select value={supplier?.id ?? ""} onChange={(e) => setSupId(e.target.value)}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <button className="btn" disabled={!supplier || chosen.length === 0} onClick={send}>
              Send list on WhatsApp ({chosen.length})
            </button>
          </>
        )}
      </div>

      {form && (
        <SupplierForm supplier={form.id ? form : null} onSave={saveSupplier} onClose={() => setForm(null)} />
      )}
    </>
  );
}
