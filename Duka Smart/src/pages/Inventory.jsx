import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TopNav from "../components/TopNav";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import BarcodeScanner from "../components/BarcodeScanner";
import { Icon } from "../components/Icons";
import { ComboInput } from "../components/Select";
import { useShop } from "../useShop";
import { useToast } from "../components/Toast";
import { del, ensureCategory, ensureSupplier, post, put } from "../api";
import { formatKES } from "../utils/formatMoney";
import { productIcon } from "../utils/productIcon";

// common duka categories, offered in the form and added in one click
const COMMON_CATEGORIES = [
  "Groceries", "Beverages", "Dairy", "Bakery", "Cooking Oil & Fats", "Flour & Grains",
  "Sugar & Sweeteners", "Snacks & Sweets", "Household", "Cleaning & Soap",
  "Personal Care", "Airtime & Mobile", "Stationery", "Fresh Produce", "Other",
];

const STATUS_FILTERS = [
  { value: "all", label: "All stock levels" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

function Inventory() {
  const { products, categories: categoryList, suppliers, loading, error, reload } = useShop();
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const search = params.get("q") || "";
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [scanning, setScanning] = useState(false);

  const categories = categoryList.map((c) => c.name);
  const categoryChoices = [...categories, ...COMMON_CATEGORIES.filter((n) => !categories.some((c) => c.toLowerCase() === n.toLowerCase()))];
  const [addingCats, setAddingCats] = useState(false);

  // close the small menus when the person clicks elsewhere
  useEffect(() => {
    const close = () => { setMenuId(null); setFilterOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  async function addCommonCategories() {
    setAddingCats(true);
    try {
      for (const name of COMMON_CATEGORIES) {
        if (!categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
          await post("/api/categories", { category_name: name });
        }
      }
      await reload();
      toast("Categories added");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setAddingCats(false);
    }
  }

  const emptyForm = { name: "", sku: "", category: "", supplier: "", buying: "", selling: "", quantity: "", threshold: "" };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function openAdd(sku = "") {
    setForm({ ...emptyForm, sku });
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
    if (![form.quantity, form.threshold].every((v) => Number.isInteger(Number(v)) && Number(v) >= 0)) {
      setFormError("Quantity and low-stock level must be whole numbers");
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
      if (editingId) await put("/api/products/" + editingId, body);
      else await post("/api/products", body);
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

  // a scanned code: open the product if the SKU is known, otherwise start adding it
  function onScanned(code) {
    setScanning(false);
    const found = products.find((p) => p.sku.toLowerCase() === code.toLowerCase());
    if (found) {
      setParams({ q: code });
      toast("Found " + found.name);
    } else {
      toast("New product code. Fill in its details.");
      openAdd(code);
    }
  }

  const shown = products.filter((p) => {
    const text = (p.name + " " + p.sku).toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (statusFilter !== "all" && getStatus(p) !== statusFilter) return false;
    return true;
  });

  const total = products.length;
  const inStock = products.filter((p) => getStatus(p) !== "out").length;
  const lowStock = products.filter((p) => getStatus(p) === "low").length;
  const outOfStock = products.filter((p) => getStatus(p) === "out").length;
  // the longest bar is the product with the most stock, so bars are easy to compare
  const biggest = Math.max(1, ...products.map((p) => p.quantity), ...products.map((p) => p.threshold * 2));

  if (loading) return <PageSkeleton active="Inventory" kind="list" />;

  return (
    <div className="dash">
      <TopNav active="Inventory" />

      <main className="dash-main">
        <div className="page-head">
          <div>
            <h1>Inventory</h1>
            <p>Everything on your shelves, with alerts when it runs low.</p>
          </div>
          <div className="page-actions">
            <button className="ghost-btn" onClick={() => setScanning(true)}><Icon name="scan" />Scan barcode</button>
            <button className="solid-btn" onClick={() => openAdd()}><Icon name="plus" />Add product</button>
          </div>
        </div>

        <Status error={error} />

        <div className="tile-grid">
          <div className="card2 itile"><span className="kcard-ic"><Icon name="box" className="" /></span><div><b>{total}</b><small>Products</small></div></div>
          <div className="card2 itile"><span className="kcard-ic"><Icon name="check" className="" /></span><div><b>{inStock}</b><small>In stock</small></div></div>
          <div className="card2 itile"><span className="kcard-ic amber"><Icon name="alert" className="" /></span><div><b>{lowStock}</b><small>Low stock</small></div></div>
          <div className="card2 itile"><span className="kcard-ic red"><Icon name="minus" className="" /></span><div><b>{outOfStock}</b><small>Out of stock</small></div></div>
        </div>

        {categories.length === 0 && (
          <div className="card2 cat-hint">
            <span>No categories yet. Add the common ones to start quickly, or type your own when adding a product.</span>
            <button className="solid-btn" onClick={addCommonCategories} disabled={addingCats}>{addingCats ? "Adding..." : "Add common categories"}</button>
          </div>
        )}

        <div className="card2 inv-panel">
          <div className="inv-bar">
            <div className="chipbar">
              <button className={"chip2" + (categoryFilter === "all" ? " on" : "")} onClick={() => setCategoryFilter("all")}>All products</button>
              {categories.map((c) => (
                <button key={c} className={"chip2" + (categoryFilter === c ? " on" : "")} onClick={() => setCategoryFilter(c)}>{c}</button>
              ))}
            </div>
            <div className="filter-pop" onClick={(e) => e.stopPropagation()}>
              <button className="ghost-btn" onClick={() => setFilterOpen(!filterOpen)}><Icon name="filter" />{statusFilter === "all" ? "Filter" : STATUS_FILTERS.find((f) => f.value === statusFilter).label}</button>
              {filterOpen && (
                <div className="filter-menu">
                  {STATUS_FILTERS.map((f) => (
                    <button key={f.value} className={statusFilter === f.value ? "on" : ""} onClick={() => { setStatusFilter(f.value); setFilterOpen(false); }}>{f.label}{statusFilter === f.value ? " ✓" : ""}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {search && (
            <p className="dash-sub" style={{ padding: "0 18px 10px", margin: 0 }}>
              Showing results for "{search}". <button className="link-sm" style={{ background: "none", border: 0, cursor: "pointer", padding: 0, font: "inherit" }} onClick={() => setParams({})}>Clear</button>
            </p>
          )}

          <table className="inv-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th className="hide-m">CATEGORY</th>
                <th>STOCK LEVEL</th>
                <th className="hide-m">REORDER AT</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const st = getStatus(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="pcell"><span className="emoji-tile">{productIcon(p)}</span><div><b>{p.name}</b><small>{p.sku}</small></div></div>
                    </td>
                    <td className="hide-m">{p.category}</td>
                    <td>
                      <div className="lvl">
                        <span className="lvl-track"><i className={st === "in" ? "" : st} style={{ width: Math.max(st === "out" ? 3 : 6, (p.quantity / biggest) * 100) + "%" }} /></span>
                        <b>{p.quantity}</b>
                      </div>
                    </td>
                    <td className="hide-m">{p.threshold}</td>
                    <td><b>{formatKES(p.selling)}</b></td>
                    <td><span className={"pill" + (st === "low" ? " amber" : st === "out" ? " red" : "")}>{st === "in" ? "In stock" : st === "low" ? "Low stock" : "Out of stock"}</span></td>
                    <td className="dots-cell">
                      <div className="dots" onClick={(e) => e.stopPropagation()}>
                        <button aria-label={"Options for " + p.name} onClick={() => setMenuId(menuId === p.id ? null : p.id)}>⋯</button>
                        {menuId === p.id && (
                          <div className="dots-menu">
                            <button onClick={() => { setMenuId(null); openEdit(p); }}>Edit</button>
                            <button className="danger" onClick={() => { setMenuId(null); setDeleteId(p.id); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="empty2">{total === 0 ? "No products yet. Add your first one." : "No products match."}</p>}
        </div>
      </main>

      {scanning && <BarcodeScanner onDetected={onScanned} onClose={() => setScanning(false)} />}

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
                <ComboInput name="category" placeholder="Pick or type a new one" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categoryChoices} />
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
