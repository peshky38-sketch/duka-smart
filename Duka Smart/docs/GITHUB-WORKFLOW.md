# GitHub workflow for the DukaSmart frontend

Follows section 14 of the project document: one feature branch per task, a pull request for each, and a code review before merging into `main`.

## One-time setup
```
git clone https://github.com/YOUR-USERNAME/dukasmart.git
cd dukasmart
```
The repo root already holds `frontend/` and `backend/`. Your work lives in `frontend/`.

Check `.gitignore` contains these lines (never commit them):
```
node_modules
dist
.env
```
Commit `.env.example`, never `.env`.

## For every task
```
git checkout main
git pull origin main
git checkout -b feature/<branch-name>

# ...work, then...
git add .
git commit -m "<message>"
git push -u origin feature/<branch-name>
```
Open a Pull Request on GitHub, ask a teammate to review, then merge.

## Branch names and commit messages for your Jira tasks

| Task | Branch | Commit message |
|---|---|---|
| SBRR-16 Set up React application | `feature/SBRR-16-react-setup` | `SBRR-16 Set up React app with Vite and routing` |
| SBRR-17 Navbar and sidebar | `feature/SBRR-17-navbar-sidebar` | `SBRR-17 Add reusable layout, sidebar and top bar` |
| SBRR-18 Login and registration UI | `feature/SBRR-18-auth-ui` | `SBRR-18 Build login and registration pages` |
| SBRR-19 Dashboard | `feature/SBRR-19-dashboard` | `SBRR-19 Build dashboard with KPIs and weekly chart` |
| SBRR-20 Inventory interface | `feature/SBRR-20-inventory` | `SBRR-20 Build inventory table with stock levels` |
| SBRR-21 Product forms | `feature/SBRR-21-product-forms` | `SBRR-21 Add, edit and delete product forms` |
| SBRR-22 Sales recording | `feature/SBRR-22-sales` | `SBRR-22 Build sales recording screen` |
| SBRR-23 Expenses | `feature/SBRR-23-expenses` | `SBRR-23 Build expenses page` |
| SBRR-24 Transaction history | `feature/SBRR-24-transactions` | `SBRR-24 Build transaction history page` |
| SBRR-25 Reports | `feature/SBRR-25-reports` | `SBRR-25 Build reports with Chart.js` |
| SBRR-26 Connect to backend | `feature/SBRR-26-api-integration` | `SBRR-26 Connect frontend to FastAPI` |
| Extras | `feature/profile-settings`, `feature/suppliers`, `feature/landing-page` | `Add profile and settings pages` and so on |

Use the Jira key in the branch name and commit message so Jira links the work automatically.

## Pull request template
```
## What this does
(one or two sentences)

## Task
SBRR-XX

## How to test
1. npm install && npm run dev
2. (steps)

## Screenshots
(drag images here)
```

## If you hit a merge conflict
```
git checkout main
git pull origin main
git checkout feature/<branch-name>
git merge main
# fix the files git marks, then
git add .
git commit
```
