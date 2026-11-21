# DukaSmart frontend test checklist

Covers section 15 of the project document. Run it once in mock mode (`VITE_USE_API=false`) and once against the real backend (`VITE_USE_API=true`). Mark Pass or Fail, add a screenshot as evidence, and note the date and who tested.

Tested by: ____________  Date: ____________  Mode: mock / API

## Automated tests
```
npm install -D vitest@^2        (once)
npm test
```
These check the business rules: low-stock rule, profit formula, percentage change, and the WhatsApp reorder message.

## Manual tests

| ID | Area | Steps | Expected result | Pass / Fail | Evidence |
|---|---|---|---|---|---|
| T01 | Registration | Open /register, fill all fields, submit | Account created, dashboard opens | | |
| T02 | Registration | Submit with a password under 6 characters | Browser blocks it with a message | | |
| T03 | Login | Log in with correct details | Dashboard opens, name shows in top bar | | |
| T04 | Login | Log in with a wrong password (API mode) | Red error message from the backend | | |
| T05 | Protected pages | Log out, then open /inventory | Redirected to the home page, no data shown | | |
| T06 | Logout | Click Log out (top bar or Settings) | Session ends, home page shows | | |
| T07 | Inventory | Open Inventory | All products show with stock bars and status | | |
| T08 | Inventory | Add a product with the form | It appears in the table, counts update | | |
| T09 | Inventory | Edit a product's price | New price shows in the table | | |
| T10 | Inventory | Delete a product and confirm | It disappears from the table | | |
| T11 | Barcode | Add product, type a real barcode, press Look up | Name and category fill in (needs internet) | | |
| T12 | Barcode | Look up a made-up barcode | "Not found" message, form still usable | | |
| T13 | Sales | Add products to a sale, press Complete | Success message, sale appears in Transactions | | |
| T14 | Sales | Try to add more units than are in stock | Quantity stops at the stock available | | |
| T15 | Sales | Complete a sale, open Inventory | Stock reduced by the quantity sold | | |
| T16 | Sales | Out-of-stock product | Its card is disabled and cannot be added | | |
| T17 | Low stock | Open Dashboard | Products at or below reorder level are listed, "Out" for zero | | |
| T18 | Low stock | Sell until a product reaches its reorder level | It appears in the low-stock alerts | | |
| T19 | Expenses | Add an expense | It shows in the list, today's total updates | | |
| T20 | Profit | Note today's sales, cost of goods and expenses, then compare with the Dashboard profit | Profit = sales - cost of goods - expenses | | |
| T21 | Transactions | Filter by M-Pesa, search a sale number | List narrows correctly, rows expand to show items | | |
| T22 | Reports | Switch between 7 and 30 days | Charts and the four totals update | | |
| T23 | Suppliers | Add a supplier, then reorder low-stock items | WhatsApp opens with the item list filled in | | |
| T24 | Profile | Upload a photo, edit details, change password | Photo and details save, mismatched passwords are rejected | | |
| T25 | Settings | Switch to Dark and refresh | Dark mode stays on after refresh | | |
| T26 | Responsive | Resize to phone width (F12, device toolbar) | No sideways scrolling, buttons reachable, tables scroll inside their card | | |
| T27 | API errors | Stop the backend and refresh | Red banner shows, the app does not crash | | |
| T28 | Token expiry | Delete the token in browser storage, then click a page (API mode) | Sent back to login | | |

## Defects found

| # | Test ID | What happened | Fixed? |
|---|---|---|---|
| | | | |
