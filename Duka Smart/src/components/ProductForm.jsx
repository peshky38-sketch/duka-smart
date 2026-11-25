import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { USE_API } from "../services/api";
import { CATEGORIES } from "../data/mock";
import { lookupBarcode } from "../barcode";
import BarcodeScanner from "./BarcodeScanner.jsx";

// Used for both Add and Edit. Pass `product` to edit. `scan` puts the cursor in the barcode box.
export default function ProductForm({ product, scan, onSave, onClose }) {
  const { suppliers } = useApp();
  const noSupplier = USE_API && suppliers.length === 0; // the backend needs a real supplier for every product
  const [f, setF] = useState(
    product || { emoji: "📦", name: "", description: "", supplier: suppliers[0]?.id ?? "", sku: "", barcode: "", category: "Grocery", qty: 0, minStock: 10, price: 0, cost: 0 }
  );
  const [error, setError] = useState("");
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // Fills the name and category from Open Food Facts
  const lookup = async (code = f.barcode) => {
    if (!code?.trim()) return;
    setBusy(true);
    setNote(null);
    try {
      const info = await lookupBarcode(code);
      if (!info) {
        setNote({ ok: false, text: "Not found in Open Food Facts. Please fill in the details yourself." });
      } else {
        setF((x) => ({ ...x, name: x.name || info.name, category: info.category, sku: x.sku || code }));
        setNote({ ok: true, text: `Found: ${info.name}` });
      }
    } catch {
      setNote({ ok: false, text: "Could not reach Open Food Facts. Check your internet connection." });
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave({ ...f, supplier: f.supplier ? Number(f.supplier) : null, qty: Number(f.qty), minStock: Number(f.minStock), price: Number(f.price), cost: Number(f.cost) });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{product ? "Edit product" : "Add product"}</h2>
        {error && <div className="banner">{error}</div>}

        <label>Barcode (optional)
          <div className="inline">
            <input
              autoFocus={scan}
              value={f.barcode || ""}
              onChange={set("barcode")}
              placeholder="Scan or type the barcode"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookup(); } }}
            />
            <button type="button" className="btn out" onClick={() => setScanning(true)} title="Scan with the camera">📷</button>
            <button type="button" className="btn out" onClick={() => lookup()} disabled={busy}>{busy ? "Looking up..." : "Look up"}</button>
          </div>
        </label>
        {note && <div className={"note " + (note.ok ? "green" : "muted")}>{note.text}</div>}

        <label>Name<input required value={f.name} onChange={set("name")} /></label>
        <label>Description (optional)<input value={f.description || ""} onChange={set("description")} placeholder="e.g. White sugar, 1kg packet" /></label>
        <div className="two-col">
          <label>SKU<input required value={f.sku} onChange={set("sku")} /></label>
          <label>Emoji<input value={f.emoji} onChange={set("emoji")} /></label>
        </div>
        <label>Category
          <select value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        {noSupplier ? (
          <div className="banner">Add a supplier first. Every product needs one. <Link to="/suppliers" onClick={onClose}>Go to Suppliers</Link></div>
        ) : (
          <label>Supplier
            <select required={USE_API} value={f.supplier ?? ""} onChange={set("supplier")}>
              <option value="">{USE_API ? "Choose a supplier" : "None"}</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}
        <div className="two-col">
          <label>Selling price (KES)<input type="number" min="0" required value={f.price} onChange={set("price")} /></label>
          <label>Cost price (KES)<input type="number" min="0" required value={f.cost} onChange={set("cost")} /></label>
        </div>
        <div className="two-col">
          <label>Stock quantity<input type="number" min="0" required value={f.qty} onChange={set("qty")} /></label>
          <label>Reorder at<input type="number" min="0" required value={f.minStock} onChange={set("minStock")} /></label>
        </div>
        <div className="actions">
          <button type="button" className="btn out" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={noSupplier}>Save product</button>
        </div>
      </form>
    </div>
    {scanning && (
      <BarcodeScanner
        onClose={() => setScanning(false)}
        onDetected={(code) => { setScanning(false); setF((x) => ({ ...x, barcode: code })); lookup(code); }}
      />
    )}
    </>
  );
}
