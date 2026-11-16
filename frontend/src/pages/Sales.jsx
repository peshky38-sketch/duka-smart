import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./Sales.css";

function Sales() {
  // sample products for now, will come from the api later
  const [products, setProducts] = useState([
    { id: 1, name: "Sugar 1kg", price: 180, stock: 4 },
    { id: 2, name: "Unga Jogoo 2kg", price: 220, stock: 7 },
    { id: 3, name: "Cooking oil 1L", price: 310, stock: 3 },
    { id: 4, name: "Bar soap", price: 60, stock: 0 },
    { id: 5, name: "Milk 500ml", price: 65, stock: 48 },
    { id: 6, name: "Bread (white)", price: 65, stock: 22 },
    { id: 7, name: "Eggs (tray)", price: 450, stock: 12 },
    { id: 8, name: "Tea leaves 250g", price: 110, stock: 35 },
  ]);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const shown = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product) {
    if (product.stock === 0) return;

    const inCart = cart.find((item) => item.id === product.id);
    if (inCart) {
      if (inCart.qty >= product.stock) return;
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, qty: 1 }]);
    }
  }

  function changeQty(id, change) {
    const product = products.find((p) => p.id === id);
    setCart(
      cart
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.qty + change;
          if (newQty > product.stock) return item;
          return { ...item, qty: newQty };
        })
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(id) {
    setCart(cart.filter((item) => item.id !== id));
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="dash">
      <Sidebar active="Sales" />

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <h1>New sale</h1>
            <p className="dash-sub">Tap a product to add it to the sale</p>
          </div>
        </div>

        <div className="sale-layout">
          <div className="panel">
            <input
              className="sale-search"
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="product-grid">
              {shown.map((p) => (
                <button
                  key={p.id}
                  className={p.stock === 0 ? "product-btn disabled" : "product-btn"}
                  onClick={() => addToCart(p)}
                >
                  <strong>{p.name}</strong>
                  <span className="price">KES {p.price}</span>
                  <span className="stock">
                    {p.stock === 0 ? "Out of stock" : p.stock + " in stock"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel cart">
            <h2>Current sale</h2>

            {cart.length === 0 && (
              <p className="empty">No items yet</p>
            )}

            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-name">
                  <strong>{item.name}</strong>
                  <span>KES {item.price} each</span>
                </div>
                <div className="qty">
                  <button onClick={() => changeQty(item.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
                <div className="line-total">KES {item.price * item.qty}</div>
                <button className="remove" onClick={() => removeItem(item.id)}>x</button>
              </div>
            ))}

            <div className="cart-total">
              <span>Total</span>
              <strong>KES {total}</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Sales;
