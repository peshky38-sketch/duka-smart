// Product lookup by barcode using the free Open Food Facts API
const CATEGORY_HINTS = [
  [/beverage|drink|water|juice|milk|tea|coffee|soda/, "Drinks"],
  [/bread|bakery|biscuit|cake|pastr/, "Bakery"],
  [/clean|soap|hygiene|detergent|household|paper/, "Household"],
];

export async function lookupBarcode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code.trim())}.json?fields=product_name,quantity,categories_tags`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Lookup failed");
  const data = await res.json();
  const p = data.product;
  if (data.status !== 1 || !p?.product_name) return null;

  const tags = (p.categories_tags || []).join(" ").toLowerCase();
  const hint = CATEGORY_HINTS.find(([re]) => re.test(tags));
  return {
    name: p.product_name + (p.quantity ? " " + p.quantity : ""),
    category: hint ? hint[1] : "Grocery",
  };
}
