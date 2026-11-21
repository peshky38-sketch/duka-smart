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
| `/profile`, `/settings` | Profile, photo, dark mode, log out | extra |
| all pages | Layout, sidebar, top bar | SBRR-17 |
| `services/api.js` | Backend connection | SBRR-26 |

## Folder structure
```
frontend/
├── docs/                    documentation (this file, test checklist, GitHub workflow)
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
│   ├── components/          Layout, Logo, ProductForm
│   ├── context/             AppContext: all shared state and actions
│   ├── data/                mock data for demo mode
│   ├── pages/               one file per screen
│   ├── services/            api.js, profile.js, suppliers.js
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

## Backend endpoints the frontend uses
Core: `POST /api/auth/register`, `POST /api/auth/login`, `GET/POST /api/products`, `PATCH/DELETE /api/products/<id>`, `GET/POST /api/sales`, `GET/POST /api/expenses`.
Extra (needed only for these features): `PATCH /api/auth/me`, `POST /api/auth/change-password`, `GET/POST /api/suppliers`, `PATCH/DELETE /api/suppliers/<id>`.
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
Add screenshots of each page here before submitting (landing, login, dashboard, inventory, sales, expenses, transactions, reports, suppliers, profile, dark mode, mobile view).
