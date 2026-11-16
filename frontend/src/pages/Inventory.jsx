import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./Inventory.css";

function Inventory() {
  // sample products for now, will come from the api later
  const products = [
    { id: 1, name: "Sugar 1kg", sku: "SUG-001", category: "Groceries", supplier: "Baraka Foods", buying: 150, selling: 180, quantity: 4, threshold: 25 },
    { id: 2, name: "Unga Jogoo 2kg", sku: "UNG-002", category: "Groceries", supplier: "Baraka Foods", buying: 190, selling: 220, quantity: 7, threshold: 20 },
    { id: 3, name: "Cooking oil 1L", sku: "OIL-003", category: "Groceries", supplier: "Mwananchi Traders", buying: 260, selling: 310, quantity: 3, threshold: 15 },
    { id: 4, name: "Bar soap", sku: "SOP-004", category: "Household", supplier: "Mwananchi Traders", buying: 40, selling: 60, quantity: 0, threshold: 30 },
    { id: 5, name: "Milk 500ml", sku: "MLK-005", category: "Dairy", supplier: "Fresh Dairy Ltd", buying: 55, selling: 65, quantity: 48, threshold: 20 },
    { id: 6, name: "Bread (white)", sku: "BRD-006", category: "Bakery", supplier: "Daily Bakers", buying: 55, selling: 65, quantity: 22, threshold: 10 },
    { id: 7, name: "Eggs (tray)", sku: "EGG-007", category: "Dairy", supplier: "Fresh Dairy Ltd", buying: 380, selling: 450, quantity: 12, threshold: 5 },
    { id: 8, name: "Tea leaves 250g", sku: "TEA-008", category: "Groceries", supplier: "Baraka Foods", buying: 85, selling: 110, quantity: 35, threshold: 15 },
  ];

  function getStatus(p) {
    if (p.quantity === 0) return "out";
    if (p.quantity <= p.threshold) return "low";
    return "in";
  }

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
          <button className="add-btn">+ Add product</button>
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
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Inventory;
