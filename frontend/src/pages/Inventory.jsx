import { useState } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import { Select, ComboInput } from "../components/Select";
import Status from "../components/Status";
import { useShop } from "../useShop";
import { useToast } from "../components/Toast";
import { del, ensureCategory, ensureSupplier, post, put } from "../api";
import { formatKES } from "../utils/formatMoney";
import "./Dashboard.css";
import "./Inventory.css";

function Inventory() {
  const { products, categories: categoryList, suppliers, loading, error, reload } = useShop();
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const categories = categoryList.map((c) => c.name);

  const emptyForm = {
    name: "",
    sku: "",
    category: "",
    supplier: "",
    buying: "",
    selling: "",
    quantity: "",
    threshold: "",
  };

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(p) {
    setForm({ ...p });
    setEditingId(p.id);
    setFormError("");
    setShowForm(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.name || !form.sku || !form.supplier) {
      setFormError("Please fill in the name, SKU and supplier");
      return;
    }
    if (form.buying === "" || form.selling === "" || form.quantity === "" || form.threshold === "") {
      setFormError("Please fill in the prices and quantities");
      return;
    }
    if (Number(form.selling) < Number(form.buying)) {
      setFormError("Selling price is lower than the buying price");
      return;
    }

    if (!form.category) {
      setFormError("Please choose or type a category");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name,
        sku: form.sku,
        description: form.description || "",
        buying: Number(form.buying),
        selling: Number(form.selling),
        quantity: Number(form.quantity),
        threshold: Number(form.threshold),
        category: await ensureCategory(form.category, categoryList),
        supplier: await ensureSupplier(form.supplier, suppliers),
      };
      if (editingId) {
        await put("/api/products/" + editingId, body);
      } else {
        await post("/api/products", body);
      }
      await reload();
      setShowForm(false);
      toast(editingId ? "Product updated" : "Product added");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await del("/api/products/" + deleteId);
      await reload();
      toast("Product deleted");
    } catch (err) {
      toast(err.message, "error");
    }
    setDeleteId(null);
  }

  function getStatus(p) {
    if (p.quantity === 0) return "out";
    if (p.quantity <= p.threshold) return "low";
    return "in";
  }

  const shown = products.filter((p) => {
    const text = (p.name + " " + p.sku).toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (statusFilter !== "all" && getStatus(p) !== statusFilter) return false;
    return true;
  });

  const total = products.length;
  const inStock = products.filter((p) => getStatus(p) === "in").length;
  const lowStock = products.filter((p) => getStatus(p) === "low").length;
  const outOfStock = products.filter((p) => getStatus(p) === "out").length;

  return (
    <div className="dash">
      <TopNav active="Inventory" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Inventory</h1>
            <p className="dash-sub">Manage your products and stock levels</p>
          </div>
          <button className="add-btn" onClick={openAdd}>+ Add product</button>
        </div>

        <Status loading={loading} error={error} />

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Total products</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">In stock</span>
            <span className="stat-value">{inStock}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Low stock</span>
            <span className="stat-value">{lowStock}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Out of stock</span>
            <span className="stat-value">{outOfStock}</span>
          </div>
        </div>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by name or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={categoryFilter} onChange={setCategoryFilter} options={[{ value: "all", label: "All categories" }, ...categories]} />
          <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All stock levels" }, { value: "in", label: "In stock" }, { value: "low", label: "Low stock" }, { value: "out", label: "Out of stock" }]} />
        </div>

        <div className="panel table-panel">
          <table className="stack">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Buying price</th>
                <th>Selling price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td data-label="Product">
                    <strong>{p.name}</strong>
                    <span className="sku">{p.sku}</span>
                  </td>
                  <td data-label="Category">{p.category}</td>
                  <td data-label="Supplier">{p.supplier}</td>
                  <td data-label="Buying price">{formatKES(p.buying)}</td>
                  <td data-label="Selling price">{formatKES(p.selling)}</td>
                  <td data-label="Quantity">{p.quantity}</td>
                  <td data-label="Status">
                    <span className={"tag tag-" + getStatus(p)}>
                      {getStatus(p) === "in" && "In stock"}
                      {getStatus(p) === "low" && "Low stock"}
                      {getStatus(p) === "out" && "Out of stock"}
                    </span>
                  </td>
                  <td data-label="" className="row-actions">
                    <button onClick={() => openEdit(p)}>Edit</button>
                    <button className="danger" onClick={() => setDeleteId(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="empty">No products match your search.</p>
          )}
        </div>
      </main>

      <Footer />

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <h2>{editingId ? "Edit product" : "Add product"}</h2>

            <div className="form-grid">
              <div className="full">
                <label>Product name</label>
                <input name="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label>SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} />
              </div>
              <div>
                <label>Category</label>
                <ComboInput name="category" placeholder="Pick or type a new one" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categories} />
              </div>
              <div className="full">
                <label>Supplier</label>
                <ComboInput name="supplier" placeholder="Pick or type a new one" value={form.supplier} onChange={(v) => setForm({ ...form, supplier: v })} options={suppliers.map((x) => x.name)} />
              </div>
              <div>
                <label>Buying price (KES)</label>
                <input name="buying" type="number" min="0" value={form.buying} onChange={handleChange} />
              </div>
              <div>
                <label>Selling price (KES)</label>
                <input name="selling" type="number" min="0" value={form.selling} onChange={handleChange} />
              </div>
              <div>
                <label>Quantity</label>
                <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
              </div>
              <div>
                <label>Low stock alert at</label>
                <input name="threshold" type="number" min="0" value={form.threshold} onChange={handleChange} />
              </div>
            </div>

            {formError && <p className="auth-error">{formError}</p>}

            <div className="modal-buttons">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="add-btn" disabled={saving}>{saving ? "Saving..." : "Save product"}</button>
            </div>
          </form>
        </div>
      )}

      {deleteId && (
        <div className="overlay" onClick={() => setDeleteId(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <h2>Delete product?</h2>
            <p>This will remove the product from your inventory.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
