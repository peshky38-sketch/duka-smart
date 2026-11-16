# DukaSmart frontend

Pages and components for the DukaSmart web app (React). The React setup itself (package.json, router) is still to come, so for now this folder only has `src/`.

## What is in src

| Folder | Files |
|---|---|
| `pages/` | Login, Register, Dashboard, Inventory, Sales, Expenses, Transactions, Reports (each with its own .css) |
| `components/` | Sidebar (shared by all the pages after login) |
| `assets/` | logo.svg |

All numbers on the pages are sample data for now. They will be replaced with data from the Flask api.

## Routes the pages expect

`/login`, `/register`, `/dashboard`, `/inventory`, `/sales`, `/expenses`, `/transactions`, `/reports`

The links use plain `<a href>` for now. When react-router is added they can be changed to `<Link>`.

## Responsive layout

Every page was checked at 320px, 375px and 768px wide, and the inventory, sales and transactions pages at 1024px.

- Under 900px (800px for login and register) the sidebar becomes a top bar and everything stacks into one column.
- Under 480px the cards and headings get a bit smaller.
- Tables and the yearly chart scroll sideways inside their card instead of stretching the whole page.
- Inputs are 16px on phones so iPhones do not zoom in when you tap them.
- Buttons and links are at least about 38px tall on phones so they are easy to tap.

Things to remember:

1. `index.html` must have this tag or none of the phone layouts will work:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```
2. All the css files are global (no css modules yet), so give new class names a page-specific name. Charts on the Reports page use `report-chart` for this reason.
3. Money amounts are shown without thousands separators for now (KES 1844400). A small format helper would be good once the real data is in.
