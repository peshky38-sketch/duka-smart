# DukaSmart Backend

DukaSmart is a shop management system designed to make everyday business operations easier. The backend handles user authentication, inventory, sales, expenses, and business reports.

## Tech Stack

- Python and Flask
- Flask-SQLAlchemy
- PostgreSQL
- Flask-Migrate
- JWT Authentication

## API Endpoints

Base URL: `http://127.0.0.1:5000`

### Authentication

- `POST /api/register` – Register a user
- `POST /api/login` – Log in
- `GET /api/profile` – Get the logged-in user's profile

### Products

- `POST /api/products` – Add a product
- `GET /api/products` – List products
- `GET /api/products/low-stock` – View low-stock products
- `GET /api/products/<product_id>` – Get a product
- `PUT /api/products/<product_id>` – Update a product
- `DELETE /api/products/<product_id>` – Delete a product

### Categories

- `POST /api/categories` – Add a category
- `GET /api/categories` – List categories

### Suppliers

- `POST /api/suppliers` – Add a supplier
- `GET /api/suppliers` – List suppliers

### Sales

- `POST /api/sales` – Record a sale
- `GET /api/sales` – View sales

### Expenses

- `POST /api/expenses` – Record an expense
- `GET /api/expenses` – List expenses
- `GET /api/expenses/<expense_id>` – View an expense
- `PUT /api/expenses/<expense_id>` – Update an expense
- `DELETE /api/expenses/<expense_id>` – Delete an expense

### Dashboard

- `GET /api/dashboard/stats` – Get dashboard statistics

### Reports

- `GET /api/reports/sales` – View sales reports
- `GET /api/reports/profit` – View profit reports

## Setup

1. Clone the repository and navigate into `backend`.
2. Create and activate a virtual environment.
3. Install dependencies:

   `pip install -r requirements.txt`

4. Create a `.env` file containing:
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `DATABASE_URL` (PostgreSQL connection URL)

5. Apply database migrations:

   `flask --app run.py db upgrade`

6. Start the server:

   `python run.py`

The API will be available at `http://127.0.0.1:5000`.

## Authentication

Protected endpoints require a JWT access token. Include it in the request header:

`Authorization: Bearer <your_access_token>`

---

**DukaSmart — Simplifying everyday shop management.**