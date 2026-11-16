import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./Inventory.css";

function Inventory() {
  // sample products for now, will come from the api later
  const [products, setProducts] = useState([
    { id: 1, name: "Sugar 1kg", sku: "SUG-001", category: "Groceries", supplier: "Baraka Foods", buying: 150, selling: 180, quantity: 4, threshold: 25 },
    { id: 2, name: "Unga Jogoo 2kg", sku: "UNG-002", category: "Groceries", supplier: "Baraka Foods", buying: 190, selling: 220, quantity: 7, threshold: 20 },
    { id: 3, name: "Cooking oil 1L", sku: "OIL-003", category: "Groceries", supplier: "Mwananchi Traders", buying: 260, selling: 310, quantity: 3, threshold: 15 },
    { id: 4, name: "Bar soap", sku: "SOP-004", category: "Household", supplier: "Mwananchi Traders", buying: 40, selling: 60, quantity: 0, threshold: 30 },
    { id: 5, name: "Milk 500ml", sku: "MLK-005", category: "Dairy", supplier: "Fresh Dairy Ltd", buying: 55, selling: 65, quantity: 48, threshold: 20 },
    { id: 6, name: "Bread (white)", sku: "BRD-006", category: "Bakery", supplier: "Daily Bakers", buying: 55, selling: 65, quantity: 22, threshold: 10 },
    { id: 7, name: "Eggs (tray)", sku: "EGG-007", category: "Dairy", supplier: "Fresh Dairy Ltd", buying: 380, selling: 450, quantity: 12, threshold: 5 },
    { id: 8, name: "Tea leaves 250g", sku: "TEA-008", category: "Groceries", supplier: "Baraka Foods", buying: 85, selling: 110, quantity: 35, threshold: 15 },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const categories = ["Groceries", "Household", "Dairy", "Bakery"];

  const emptyForm = {
    name: "",
    sku: "",
    category: "Groceries",
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

  function handleSave(e) {
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

    const product = {
      ...form,
      buying: Number(form.buying),
      selling: Number(form.selling),
      quantity: Number(form.quantity),
      threshold: Number(form.threshold),
    };

    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? { ...product, id: editingId } : p)));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setShowForm(false);
  }

  function handleDelete() {
    setProducts(products.filter((p) => p.id !== deleteId));
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
      <Sidebar active="Inventory" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>Inventory</h1>
            <p className="dash-sub">Manage your products and stock levels</p>
          </div>
          <button className="add-btn" onClick={openAdd}>+ Add product</button>
        </div>

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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All stock levels</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        <div className="panel table-panel">
          <table>
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
                  <td>
                    <strong>{p.name}</strong>
                    <span className="sku">{p.sku}</span>
                  </td>
                  <td>{p.category}</td>
                  <td>{p.supplier}</td>
                  <td>KES {p.buying}</td>
                  <td>KES {p.selling}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <span className={"tag tag-" + getStatus(p)}>
                      {getStatus(p) === "in" && "In stock"}
                      {getStatus(p) === "low" && "Low stock"}
                      {getStatus(p) === "out" && "Out of stock"}
                    </span>
                  </td>
                  <td className="row-actions">
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
                <select name="category" value={form.category} onChange={handleChange}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="full">
                <label>Supplier</label>
                <input name="supplier" value={form.supplier} onChange={handleChange} />
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
              <button type="submit" className="add-btn">Save product</button>
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
