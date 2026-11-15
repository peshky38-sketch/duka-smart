import { useState } from "react";
import { CATEGORIES } from "../data/mock";


export default function ProductForm({ product, onSave, onClose }) {
  const [f, setF] = useState(
    product || { emoji: "", name: "", sku: "", category: "Grocery", qty: 0, minStock: 10, price: 0, cost: 0 }
  );
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave({ ...f, qty: Number(f.qty), minStock: Number(f.minStock), price: Number(f.price), cost: Number(f.cost) });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{product ? "Edit product" : "Add product"}</h2>
        {error && <div className="banner">{error}</div>}
        <label>Name<input required value={f.name} onChange={set("name")} /></label>
        <div className="two-col">
          <label>SKU<input required value={f.sku} onChange={set("sku")} /></label>
          <label>Emoji<input value={f.emoji} onChange={set("emoji")} /></label>
        </div>
        <label>Category
          <select value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
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
          <button className="btn">Save product</button>
        </div>
      </form>
    </div>
  );
}
