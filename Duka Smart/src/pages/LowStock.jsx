import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import PageSkeleton from "../components/PageSkeleton";
import Status from "../components/Status";
import { Icon } from "../components/Icons";
import { useShop } from "../useShop";
import { useToast } from "../components/Toast";
import { get } from "../api";
import { productIcon } from "../utils/productIcon";

function LowStock() {
  const shop = useShop();
  const toast = useToast();
  const [phones, setPhones] = useState({});

  // supplier phone numbers, so the reorder list can go straight to the right person
  useEffect(() => {
    get("/api/suppliers")
      .then((d) => {
        const m = {};
        (d.suppliers || []).forEach((s) => (m[s.id] = s.phone_number));
        setPhones(m);
      })
      .catch(() => {});
  }, []);

  if (shop.loading) return <PageSkeleton active="Inventory" kind="list" />;

  const low = shop.products
    .filter((p) => p.quantity <= p.threshold)
    .sort((a, b) => a.quantity / (a.threshold || 1) - b.quantity / (b.threshold || 1));

  // the supplier most of these items come from
  const counts = {};
  low.forEach((p) => p.supplierId && (counts[p.supplierId] = (counts[p.supplierId] || 0) + 1));
  const topId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const topSupplier = topId ? shop.suppliers.find((s) => String(s.id) === topId) : null;
  const topPhone = topId ? phones[topId] : "";
  const realPhone = topPhone && !String(topPhone).startsWith("not given") ? topPhone : "";

  const message = () =>
    "Hello, I would like to reorder:\n" +
    low.map((p) => `- ${p.name}: ${Math.max(1, p.threshold * 2 - p.quantity)} (I have ${p.quantity})`).join("\n");

  function whatsapp(toSupplier) {
    const num = toSupplier && realPhone ? String(realPhone).replace(/\D/g, "").replace(/^0/, "254") : "";
    window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(message()), "_blank", "noopener");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message());
      toast("Reorder list copied");
    } catch {
      toast("Could not copy the list", "error");
    }
  }

  return (
    <div className="dash">
      <TopNav active="Inventory" />
      <main className="dash-main">
        <div className="page-head">
          <div>
            <h1>Low stock <span className="pill amber" style={{ verticalAlign: "middle", marginLeft: 8 }}>{low.length} {low.length === 1 ? "item" : "items"}</span></h1>
            <p>Reorder these before they run out.</p>
          </div>
        </div>

        <Status error={shop.error} />

        <div className="card2 low-list">
          {low.length === 0 && <p className="empty2">Everything is well stocked.</p>}
          {low.map((p) => (
            <div className="alert-row" key={p.id}>
              <span className="emoji-tile">{productIcon(p)}</span>
              <div><b>{p.name}</b><small>{p.quantity === 0 ? "Out of stock" : p.quantity + " left"} · reorder at {p.threshold}</small></div>
              <span className={"pill " + (p.quantity === 0 ? "red" : "amber")}>{p.quantity === 0 ? "Out" : "Low"}</span>
            </div>
          ))}
        </div>

        {low.length > 0 && (
          <>
            {topSupplier && (
              <div className="sup-card">
                <span className="emoji-tile">🚚</span>
                <div><b>{topSupplier.name}</b><small>Your usual supplier for these items{realPhone ? " · " + realPhone : ""}</small></div>
              </div>
            )}
            <div className="stack-btns">
              <button className="solid-btn" onClick={() => whatsapp(true)}><Icon name="phone" />Reorder all {low.length} {low.length === 1 ? "item" : "items"}</button>
              <button className="ghost-btn" onClick={() => whatsapp(false)}>Send list on WhatsApp</button>
              <button className="ghost-btn" onClick={copy}>Copy the list</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default LowStock;
