// Acceptance test: drives the real frontend in a browser against the real backend.
// Run it after the backend or frontend changes. It registers a fresh account every time, so it can be repeated.
//
//   npm i -D playwright && npx playwright install chromium     (once)
//   FRONTEND_URL=http://localhost:5173 API_URL=http://localhost:5000 node e2e/flask.e2e.cjs
//
// Start the backend and `npm run dev` (with VITE_USE_API=true) first.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const fs = require("fs");

const BASE = process.env.FRONTEND_URL || "http://localhost:5173";
const API = process.env.API_URL || "http://localhost:5000";
const stamp = String(Date.now());
const EMAIL = `owner+${stamp}@duka.co.ke`;
const SHOP_PHONE = "07" + stamp.slice(-8);
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 }, timezoneId: "Africa/Nairobi", acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const fill = (label, v) => page.fill(`label:has-text("${label}") input`, v);

  // ---- register ----
  await page.goto(BASE + "/register");
  await fill("Your name", "Wanjiru"); await fill("Shop name", "Mama Wanjiru Stores");
  await fill("Shop phone", SHOP_PHONE); await fill("Town", "Eldoret");
  await fill("Email", EMAIL); await fill("Password", "secret123");
  await page.click('button:has-text("Create account")');
  await page.waitForSelector("text=Habari");
  ok((await page.textContent("h1")).includes("Wanjiru"), "registration works and logs in");
  const token = await page.evaluate(() => localStorage.getItem("token"));
  const api = async (path) => (await fetch(API + path, { headers: { Authorization: "Bearer " + token } })).json();

  // ---- a product needs a real supplier: nothing is invented ----
  await page.goto(BASE + "/inventory");
  await page.click('button:has-text("+ Add product")');
  await page.waitForSelector("text=Add a supplier first");
  ok(await page.locator('button:has-text("Save product")').isDisabled(), "with no supplier the product form says so and cannot be saved");
  await page.click('button:has-text("Cancel")');
  ok((await api("/api/suppliers")).suppliers.length === 0, "no fake supplier was created");

  await page.goto(BASE + "/suppliers"); await page.waitForSelector("text=Reorder low-stock items");
  await page.click('button:has-text("+ Add supplier")');
  await fill("Supplier name", "Baraka Foods"); await fill("Phone", "0722111222");
  await page.click('button:has-text("Save supplier")');
  await page.waitForSelector("text=Baraka Foods");
  const sups = (await api("/api/suppliers")).suppliers;
  ok(sups.length === 1 && sups[0].phone_number === "0722111222", "supplier saved with the real phone number the user typed");

  // ---- product with description and that supplier ----
  await page.goto(BASE + "/inventory");
  await page.click('button:has-text("+ Add product")');
  await page.fill('input[placeholder="Scan or type the barcode"]', "6161100000555");
  await fill("Name", "Sugar 1kg"); await fill("Description", "White sugar, 1kg packet"); await fill("SKU", "SUG-001"); await fill("Emoji", "🍬");
  await fill("Selling price", "165"); await fill("Cost price", "130"); await fill("Stock quantity", "10"); await fill("Reorder at", "5");
  await page.click('button:has-text("Save product")');
  await page.waitForSelector("text=Sugar 1kg");
  const product = (await api("/api/products")).products.find((p) => p.name === "Sugar 1kg");
  ok(product.supplier === sups[0].id && product.description === "White sugar, 1kg packet", "product saved with the chosen supplier and its description");
  const row = await page.locator("tbody tr", { hasText: "Sugar 1kg" }).textContent();
  ok(row.includes("White sugar, 1kg packet") && row.includes("🍬") && row.includes("Grocery"), "inventory row shows description, emoji and category");

  // ---- edit ----
  await page.locator("tbody tr", { hasText: "Sugar 1kg" }).locator('button:has-text("Edit")').click();
  await fill("Selling price", "170");
  await page.click('button:has-text("Save product")');
  await page.waitForSelector(".overlay", { state: "detached" });
  ok((await api("/api/products")).products.find((p) => p.name === "Sugar 1kg").selling === 170, "product edit saved on the server");

  // ---- sales ----
  await page.goto(BASE + "/sales"); await page.waitForSelector("button.prod");
  await page.fill(".search", "6161100000555"); await page.press(".search", "Enter");
  await page.locator('.qty button:has-text("+")').click();
  await page.click('.pay button:has-text("Cash")');
  await page.click('button:has-text("Complete sale")');
  await page.waitForSelector(".banner.ok");
  const stock = async () => (await api("/api/products")).products.find((p) => p.name === "Sugar 1kg").quantity;
  ok((await stock()) === 8, "cash sale reduced stock on the server (10 -> 8)");

  await page.locator("button.prod", { hasText: "Sugar 1kg" }).click();
  await page.click('.pay button:has-text("M-Pesa")');
  await page.click('button:has-text("Request M-Pesa payment")');
  await page.fill("input[type=tel]", "0712345678");
  await page.click('button:has-text("Send payment prompt")');
  // With an M-Pesa endpoint on the server this shows the real prompt; without one the cashier confirms by hand.
  await Promise.race([page.waitForSelector("text=not available yet"), page.waitForSelector("text=Waiting for payment")]);
  if (await page.locator('button:has-text("Customer paid: confirm")').count()) await page.click('button:has-text("Customer paid: confirm")');
  await page.waitForSelector("text=M-Pesa receipt", { timeout: 20000 });
  ok((await stock()) === 7, "M-Pesa sale saved (stock 8 -> 7)");

  // ---- dates: UTC from the server shown in Kenya time ----
  await page.goto(BASE + "/"); await page.waitForSelector("text=Recent sales");
  const hourNow = new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi", hour12: false }).slice(0, 2);
  ok((await page.locator(".card", { hasText: "Recent sales" }).textContent()).includes(hourNow + ":"), `sale time shown in Kenya time (hour ${hourNow})`);
  ok(/KES [1-9]/.test(await page.locator(".kpis .card b").first().textContent()), "dashboard counts today's sales");

  // ---- transactions: description in the details, and CSV export ----
  await page.goto(BASE + "/transactions"); await page.waitForSelector("tr.click");
  await page.locator("tr.click").first().click();
  ok((await page.locator("tr.detail").textContent()).includes("White sugar, 1kg packet"), "sale details show the product description");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('button:has-text("Export CSV")')]);
  const csv = fs.readFileSync(await dl.path(), "utf8");
  ok(dl.suggestedFilename().startsWith("transactions-") && csv.includes("Sale number") && csv.includes("Sugar 1kg x") && csv.split("\r\n").length === 3, "Transactions CSV downloaded with header and one row per sale: " + dl.suggestedFilename());

  // ---- expenses: add, edit, CSV, delete ----
  await page.goto(BASE + "/expenses"); await page.waitForSelector("text=Expenses");
  await page.click('button:has-text("+ Add expense")');
  await fill("What was it for", "Boda boda"); await fill("Amount", "300");
  await page.click('button:has-text("Save expense")');
  await page.waitForSelector("text=Boda boda");
  await page.locator("tbody tr", { hasText: "Boda boda" }).locator('button:has-text("Edit")').click();
  await fill("Amount", "350"); await page.click('button:has-text("Save expense")');
  await page.waitForSelector("text=KES 350");
  ok(String((await api("/api/expenses")).expenses[0].amount).startsWith("350"), "expense edited on the server");
  const [dl2] = await Promise.all([page.waitForEvent("download"), page.click('button:has-text("Export CSV")')]);
  ok(fs.readFileSync(await dl2.path(), "utf8").includes("Boda boda,Transport,350"), "Expenses CSV downloaded");
  await page.locator("tbody tr", { hasText: "Boda boda" }).locator('button:has-text("Delete")').click();
  await page.waitForTimeout(600);
  ok((await api("/api/expenses")).expenses.length === 0, "expense deleted on the server");

  // ---- reports ----
  await page.goto(BASE + "/reports"); await page.waitForTimeout(1200);
  ok(!(await page.locator(".banner").count()), "reports load with no error banner");

  const real = errors.filter((e) => !/ERR_NAME_NOT_RESOLVED|Failed to load resource.*(401|400|404|422|409)/.test(e));
  ok(real.length === 0, "no unexpected browser console errors" + (real.length ? ": " + real.join(" || ") : ""));
  await browser.close();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
