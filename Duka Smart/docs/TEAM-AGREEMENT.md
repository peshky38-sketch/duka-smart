# Frontend and backend: review, decisions and who does what

Frontend: Bryan. Backend: teammate. This answers the review list point by point, proposes answers to the two open questions, and fixes the contract for each change so both sides can work separately and then connect.

Everything marked **Done** was checked by running the real backend and driving the real frontend in a browser (`e2e/flask.e2e.cjs`, 18 checks, all passing).

## 1. The review list

| # | Point from the review | Status | Owner |
|---|---|---|---|
| F1 | Supplier creation uses a fake phone number | **Confirmed and fixed.** It came from the product code, which invented a "General supplier" (`0000000000`) when none existed. Now the product form asks the user to pick a real supplier, and says "Add a supplier first" if there are none. The Suppliers page always asked for the real phone | Frontend, done. Backend: make `supplier` optional on products so this is never needed (B7) |
| F2 | Expenses need an edit option | **Already in the app** (Edit and Delete on every row, calling `PUT`/`DELETE`). The review may have been of an older copy. Verified against the backend | Frontend, done |
| F3 | Transactions: CSV export and product descriptions | **Not present before, now added.** Transactions and Expenses have **Export CSV** (opens in Excel/Sheets, safe against spreadsheet formulas). Products have a description field, shown in Inventory and in the sale details | Frontend, done |
| F4 | Check dates for sales and expenses | **Checked.** The backend sends UTC times without a `Z`, which the browser reads as local time. The frontend adds the `Z` (verified: the sale time shows in Kenya time). **Open:** the backend ignores the date typed in the expense form (always "now"), and its expense update rejects an unknown field such as `date` with 400 | Frontend done. Backend: B1, B3 |
| B1 | Standardise timestamps | Agreed, see section 3, contract A | Backend |
| B2 | Save the purchase cost on each sale item | Agreed, see contract B. The frontend already uses `cost_price` and `product_name` as soon as the sales response includes them | Backend |
| B3 | Expense date | Agreed, see contract C | Backend |
| B4 | Reports: weekly, monthly, yearly | Agreed, see contract D | Backend, then frontend |
| D | Who calculates the dashboard and reports | Proposal in section 2 | Both decide |

## 2. Who calculates the dashboard and reports

**Proposal: the backend is the source of truth for money figures. The frontend only shows them.**

Why:
- The frontend currently downloads every sale and expense and adds them up in the browser. That works for a demo, but gets slow and wasteful after months of sales.
- There must be one definition of profit. Backend: `gross profit = revenue - cost of goods sold (saved on each sale item)` and `net profit = gross profit - expenses`. The project document states these rules, so the backend should own them.
- Weekly, monthly and yearly breakdowns (B4) are easiest and fastest in the database.

What stays in the frontend: low-stock alerts, notifications, search, and the calculations in demo mode (`VITE_USE_API=false`), so the app still works with no backend.

**Order:** keep the frontend calculation until the backend reports work. Then the frontend switches over (API mode uses the backend numbers, demo mode keeps calculating). If the two ever disagree during the switch, the backend wins and the difference is a bug to find.

## 3. Contracts (so each side can build alone)

### A. Timestamps
- Store in UTC with timezone-aware columns (`DateTime(timezone=True)`, `datetime.now(timezone.utc)`).
- Send ISO 8601 with `Z`, for example `"2026-11-25T07:30:12.543Z"`, for every date field (`created_at`, `date`).
- Day, week and month boundaries are the business's local time, **Africa/Nairobi (UTC+3)**, never UTC. Reports take a `tz` parameter for this (contract D).
- Frontend keeps its safety net that adds a missing `Z`.

### B. Sale items save the cost and name at the time of sale
`sale_items` gets two columns: `cost_price` (the product's buying price when the sale happened) and `product_name`. The sales response returns them for each item:
```json
{ "product_id": 4, "product_name": "Rice Pishori 2kg", "quantity": 3, "unit_price": 480, "cost_price": 370 }
```
Add a migration, and fill old rows from the product's current buying price. Profit reports must use `sale_items.cost_price`, not the product's current price. Also return amounts as JSON numbers, and list sales newest first.

### C. Expenses accept a date
`POST /api/expenses` and `PUT /api/expenses/<id>` accept an optional `date` (ISO 8601). Responses return `date`. The frontend then sends it on create immediately (it already does) and on edit (one line to add).

### D. Reports
Extend the existing report routes or replace them with one:
```
GET /api/reports/summary?start=2026-11-18&end=2026-11-24&group=day&tz=Africa/Nairobi
```
`start` and `end` are local dates, both included. `group` is `day`, `week` (Monday to Sunday, labelled by the Monday's date) or `month` (label `2026-11`). A year is `group=month` over 12 months.
```json
{
  "range": { "start": "2026-11-18", "end": "2026-11-24", "group": "day", "tz": "Africa/Nairobi" },
  "totals": { "revenue": 41320, "cost_of_goods": 31915, "gross_profit": 9405, "expenses": 8150, "net_profit": 1255, "sales_count": 42 },
  "series": [ { "label": "2026-11-18", "revenue": 5200, "expenses": 700 } ],
  "payment_methods": [ { "method": "Cash", "total": 12000 } ],
  "top_products": [ { "product_id": 4, "name": "Rice Pishori 2kg", "quantity": 39, "revenue": 18720 } ]
}
```
The dashboard can use the same route with `start = end = today` and `group=day`, plus `low_stock_count`. Then `/api/dashboard/stats` and this stay consistent.

### E. Other backend changes (not blocking, each unlocks one frontend feature)
| # | Change | Frontend result |
|---|---|---|
| B5 | Login returns `business_name`, `phone_number`, `business_address`, `avatar`. Extend `GET /api/profile` the same way | Shop name and profile load from the server instead of this device |
| B6 | `PATCH /api/profile` (`username, business_name, phone_number, business_address, avatar`) and `POST /api/profile/change-password` (`current_password, new_password`). `avatar` is a text column | Profile page and password change start working (the frontend already calls these) |
| B7 | `supplier` optional on products, and a category **name** accepted (create it if new) | The "pick a supplier first" step and the category lookup can go |
| B8 | `PUT` and `DELETE /api/suppliers/<id>`, `delivery_days` column, `barcode` column on products | Supplier edit/delete and barcode work on every device |
| B9 | M-Pesa endpoints from `docs/MPESA-BACKEND.md` | Real payment prompt instead of manual confirmation |
| B10 | Register: only `business_name`, `email`, `password` required. `username` not unique | The register form can drop the extra fields |

### F. Bugs to fix in the backend
1. `routes/suppliers.py`: adding a supplier without an address returns 500 (`existing_supplier` is defined inside `if address is not None:`).
2. Tokens expire after 15 minutes (library default): set `JWT_ACCESS_TOKEN_EXPIRES` to a few hours.
3. Stock error says `Insufficient stock for 1`: use the product name.
4. `payment_method` accepts any text: limit it to `Cash`, `M-Pesa`, `Card`.
5. Deleting a product that has sales: refused on PostgreSQL, but on SQLite it leaves orphan sale items. B2 (saved name and cost) makes this safe.
6. `stock_movements` is never written. Record a movement on each sale, or remove it.
7. `.env.example` is empty, and `requirements.txt` is UTF-16 (save as UTF-8).

## 4. Who does what

| Frontend (Bryan) | Backend (teammate) |
|---|---|
| Done: real supplier on products, descriptions, CSV export, expense edit, date handling, e2e acceptance test | A, B, C: timestamps, cost and name on sale items, expense date |
| Next, once D is live: switch Reports and Dashboard to the backend numbers (demo mode keeps its own) | D: reports summary route with day/week/month |
| Next, as each lands: remove the workarounds (B5 to B10) | F: the seven bug fixes. E: B5 to B10 in any order |
| Keep the e2e test passing, add a check per feature | Keep Postman collection / pytest for each new route |

## 5. How we connect and test
1. Backend deploys A, B, C first (small and everything else depends on them). Frontend runs the e2e test again.
2. Backend builds D. Frontend switches the Reports page and dashboard, and compares the numbers with the old browser calculation on the same data (they should match, apart from profit on sales made before B).
3. E items one by one.
4. Final run of `e2e/flask.e2e.cjs` plus the manual checklist in `docs/TEST-CHECKLIST.md`.

Run the acceptance test with:
```
npm i -D playwright && npx playwright install chromium     (once)
FRONTEND_URL=http://localhost:5173 API_URL=http://localhost:5000 node e2e/flask.e2e.cjs
```
(Backend running, and `npm run dev` with `VITE_USE_API=true`.)
