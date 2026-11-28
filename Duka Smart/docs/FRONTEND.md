# DukaSmart frontend documentation

React 18 + Vite single-page app. It talks to the FastAPI backend over REST/JSON and works on its own with mock data.

## Run it
```
cd frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
npm test             # business-rule tests (needs: npm install -D vitest@^2)
npm run build        # production build in dist/
```

## Settings (.env)
| Variable | Meaning |
|---|---|
| `VITE_USE_API` | `false` = mock data, `true` = use the FastAPI backend |
| `VITE_LOGIN_FORM` | `true` if login expects form data (username, password) |
| `VITE_API_URL` | API address for production only. In development Vite proxies `/api` to port 8000 |

## Pages
| Route | Page | Jira task |
|---|---|---|
| `/welcome` | Public home page | extra |
| `/login`, `/register` | Authentication | SBRR-18 |
| `/` | Dashboard | SBRR-19 |
| `/inventory` | Inventory, add/edit/delete products, barcode lookup | SBRR-20, 21 |
| `/sales` | Record a sale | SBRR-22 |
| `/expenses` | Expenses | SBRR-23 |
| `/transactions` | Sales history | SBRR-24 |
| `/reports` | Reports and charts | SBRR-25 |
| `/suppliers` | Suppliers and WhatsApp reorder | extra |
| `/notifications` | Low-stock and new-sale notifications | extra |
| `/profile`, `/settings` | Profile, photo, dark mode, log out | extra |
| any other address | Page not found | extra |
| all pages | Layout, sidebar, top bar | SBRR-17 |
| `services/api.js` | Backend connection | SBRR-26 |

## Folder structure
```
frontend/
├── docs/                    documentation: this file, ARCHITECTURE, USER-GUIDE, TEST-CHECKLIST,
│                            GITHUB-WORKFLOW, MPESA-BACKEND, plus screenshots/ and diagrams/
├── scripts/seed.mjs         fills the backend with demo data
├── src/
│   ├── main.jsx             starts the app, applies the saved theme
│   ├── App.jsx              all routes, protected pages
│   ├── index.css            main styles and the light/dark colour variables
│   ├── extras.css           landing page, suppliers, barcode, mobile styles
│   ├── theme.js             saves light/dark choice
│   ├── utils.js             money, dates, profit helpers
│   ├── whatsapp.js          builds the supplier reorder message and link
│   ├── barcode.js           Open Food Facts lookup
│   ├── components/          Layout, Logo, SearchBar, ProductForm, BarcodeScanner, MpesaModal
│   ├── context/             AppContext: all shared state and actions
│   ├── data/                mock data for demo mode
│   ├── pages/               one file per screen
│   ├── services/            api.js, profile.js, suppliers.js, expenses.js, mpesa.js
│   └── __tests__/           automated tests
└── package.json
```

## How data flows
Pages never call the backend directly. They call functions from `AppContext` (`saveProduct`, `completeSale`, `addExpense`...). In mock mode these change local state. In API mode they call `services/api.js` first, then update the screen. This is why switching modes needs no page changes.

## Business rules in the code
| Rule (project doc) | Where |
|---|---|
| A sale reduces stock automatically | `completeSale` in `AppContext.jsx` |
| A sale cannot exceed available stock | `add` and `change` in `pages/Sales.jsx` |
| Low stock when quantity <= minimum | `isLow` in `AppContext.jsx` |
| Gross profit = revenue - cost of goods | `saleCost` in `utils.js`, used by Dashboard and Reports |
| Net profit = gross profit - expenses | Dashboard and Reports pages |
| Users only see their own data | JWT sent in `services/api.js`, enforced by the backend |

## External API
Open Food Facts (`world.openfoodfacts.org`) fills in a product name and category from its barcode. See `src/barcode.js`. It is optional: if the lookup fails, the form still works.

## Barcode scanning
Three ways to enter a barcode: type it, use a USB or Bluetooth scanner (it types the code and presses Enter), or use the phone camera (`BarcodeScanner.jsx`, built on `@zxing/browser`). The camera works only on https pages or `localhost`.

## Backend endpoints the frontend uses
Core: `POST /api/auth/register`, `POST /api/auth/login`, `GET/POST /api/products`, `PATCH/DELETE /api/products/<id>`, `GET/POST /api/sales`, `GET/POST /api/expenses`.
Extra (needed only for these features): `PATCH /api/auth/me`, `POST /api/auth/change-password`, `GET/POST /api/suppliers`, `PATCH/DELETE /api/suppliers/<id>`, `PATCH/DELETE /api/expenses/<id>`, and the three M-Pesa endpoints in `MPESA-BACKEND.md`.
Product fields also include an optional `barcode`.

## Common problems
| Message | Cause and fix |
|---|---|
| Failed to resolve import | Wrong file name capitals, or a package is missing: run `npm install` |
| does not provide an export named 'request' | `export` is missing in front of `async function request` in `api.js` |
| updateProfile is not a function | `AppContext.jsx` is an old version: replace it |
| Blank page after login | Open the browser console (F12) and read the first red error |
| Every request fails | Backend not running, or on a different port than the one in `vite.config.js` |

## Screenshots
Taken from the running app in demo mode. Retake them with your own data before submitting.

**Landing page**

![Landing page](screenshots/01-landing.png)

**Login**

![Login](screenshots/02-login.png)

**Register**

![Register](screenshots/03-register.png)

**Dashboard**

![Dashboard](screenshots/04-dashboard.png)

**Inventory**

![Inventory](screenshots/05-inventory.png)

**Add product form with barcode lookup**

![Add product form with barcode lookup](screenshots/06-add-product.png)

**Sales**

![Sales](screenshots/07-sales.png)

**M-Pesa payment prompt**

![M-Pesa payment prompt](screenshots/08-mpesa-prompt.png)

**Sale completed with M-Pesa receipt**

![Sale completed with M-Pesa receipt](screenshots/09-sale-completed.png)

**Expenses**

![Expenses](screenshots/10-expenses.png)

**Transactions**

![Transactions](screenshots/11-transactions.png)

**Reports**

![Reports](screenshots/12-reports.png)

**Suppliers and WhatsApp reorder**

![Suppliers and WhatsApp reorder](screenshots/13-suppliers.png)

**Notifications**

![Notifications](screenshots/14-notifications.png)

**Profile**

![Profile](screenshots/15-profile.png)

**Search**

![Search](screenshots/16-search.png)

**Page not found**

![Page not found](screenshots/17-not-found.png)

**Dashboard in dark mode**

![Dashboard in dark mode](screenshots/18-dashboard-dark.png)

**Settings in dark mode**

![Settings in dark mode](screenshots/19-settings-dark.png)

**Phone: dashboard**

![Phone: dashboard](screenshots/20-mobile-dashboard.png)

**Phone: sales**

![Phone: sales](screenshots/21-mobile-sales.png)

**Phone: inventory**

![Phone: inventory](screenshots/22-mobile-inventory.png)

