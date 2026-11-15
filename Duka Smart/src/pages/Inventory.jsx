import { useState } from "react";
import { useApp, isLow, isOut } from "../context/AppContext.jsx";
import ProductForm from "../components/ProductForm.jsx";

const TABS = ["All products", "Grocery", "Drinks", "Bakery", "Household"];

export default function Inventory() {
  const { products, saveProduct, deleteProduct } = useApp();
  const [tab, setTab] = useState("All products");
  const [form, setForm] = useState(null); // null = closed, {} = add, product = edit

  const shown = tab === "All products" ? products : products.filter((p) => p.category === tab);
  const low = products.filter(isLow).length;
  const out = products.filter(isOut).length;

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try {
      await deleteProduct(p.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="top">
        <div>
          <h1>Inventory</h1>
          <p className="muted">Everything on your shelves, with alerts when it runs low.</p>
        </div>
        <div className="actions">
          <button className="btn out">Scan barcode</button>
          <button className="btn" onClick={() => setForm({})}>+ Add product</button>
        </div>
      </div>

      <div className="kpis">
        {[
          [products.length, "Products"],
          [products.length - low - out, "In stock"],
          [low, "Low stock"],
          [out, "Out of stock"],
        ].map(([n, label]) => (
          <div className="card" key={label}><b>{n}</b><span className="muted">{label}</span></div>
        ))}
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>PRODUCT</th><th>CATEGORY</th><th>STOCK LEVEL</th><th>REORDER AT</th><th>PRICE</th><th>STATUS</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const tone = isOut(p) ? "out" : isLow(p) ? "low" : "";
              const pct = Math.min(100, (p.qty / (p.minStock * 3)) * 100);
              return (
                <tr key={p.id}>
                  <td>{p.emoji} <b>{p.name}</b><br /><small className="muted">{p.sku}</small></td>
                  <td className="muted">{p.category}</td>
                  <td>
                    <div className="stock">
                      <div className="meter"><i className={tone ? "l" : ""} style={{ width: pct + "%" }} /></div>
                      <b>{p.qty}</b>
                    </div>
                  </td>
                  <td className="muted">{p.minStock}</td>
                  <td><b>KES {p.price}</b></td>
                  <td><span className={"chip " + tone}>{isOut(p) ? "Out of stock" : isLow(p) ? "Low stock" : "In stock"}</span></td>
                  <td className="actions">
                    <button className="link" onClick={() => setForm(p)}>Edit</button>
                    <button className="link red" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {form && (
        <ProductForm
          product={form.id ? form : null}
          onSave={saveProduct}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}
