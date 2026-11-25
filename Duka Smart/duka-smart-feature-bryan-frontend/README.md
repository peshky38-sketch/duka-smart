 
# DukaSmart – Smart Business Management System

## 1. Project Overview

DukaSmart is a web-based Smart Business Management System designed to help small business owners and shopkeepers manage their daily business operations efficiently.

The system provides a centralized platform for managing inventory, recording sales, tracking expenses, monitoring profits and receiving low-stock alerts.

DukaSmart aims to reduce manual record-keeping, improve business efficiency and help small business owners make informed decisions using accurate business information.

## 2. Problem Statement

Many small businesses rely on manual methods such as notebooks and spreadsheets to manage their daily operations.

These methods can result in:
- Poor inventory management.
- Inaccurate sales records.
- Difficulty tracking business expenses.
- Challenges calculating profits and losses.
- Unexpected stock shortages.
- Limited visibility into overall business performance.

DukaSmart seeks to solve these challenges by providing a simple and centralized digital business management solution.

## 3. Project Objectives

The main objective is to develop a user-friendly web application that simplifies daily business management.

Specific objectives include:

- To provide an inventory management system for tracking products and stock quantities.
- To enable business owners to record and monitor daily sales.
- To provide an expense tracking system.
- To automatically calculate business profits.
- To generate low-stock alerts when products need restocking.
- To provide a dashboard displaying important business statistics.
- To implement secure user authentication.
- To integrate external APIs to improve system functionality.

## 4. Core Features

### 1. User Authentication
- User registration.
- Secure login and logout.
- Password hashing.
- Protected application resources.

### 2. Inventory Management
- Add new products.
- View available products.
- Update product information.
- Delete products.
- Track stock quantities.
- Manage product categories and prices.

### 3. Sales Management
- Record daily sales.
- Automatically calculate sales totals.
- Track products sold.
- Automatically deduct sold quantities from inventory.
- View sales transaction history.

### 4. Expense Management
- Record business expenses.
- Categorize expenses.
- Track daily and monthly spending.
- View expense history.

### 5. Dashboard and Reports
- Display total products.
- Display total sales.
- Display total expenses.
- Calculate estimated profits.
- Display sales and expense charts.

### 6. Low-Stock Alerts
- Identify products with low stock levels.
- Display notifications when products need restocking.
- Highlight products that require attention.

### 7. External API Integration
The system will integrate an external API such as Open Food Facts to retrieve product information where appropriate.

## 5. Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| CSS / Bootstrap | Styling and responsive design |
| Python | Backend programming |
| Flask | REST API development |
| PostgreSQL | Database management |
| SQLAlchemy | Database ORM |
| Flask-JWT-Extended | Authentication |
| Postman | API testing |
| Chart.js | Data visualization |
| Git & GitHub | Version control and collaboration |

## 6. System Architecture

DukaSmart will follow a client-server architecture.

```text
          REACT FRONTEND
                |
             HTTP / JSON
                |
          FLASK REST API
                |
             SQLALCHEMY
                |
          POSTGRESQL DATABASE
```

The frontend communicates with the Flask backend through REST API endpoints. The backend processes requests and interacts with the PostgreSQL database.

External APIs may also be integrated to retrieve additional product information.

## 7. Database Structure

The proposed database will contain the following tables:

| Table | Description |
|---|---|
| Users | Stores user account information. |
| Businesses | Stores business profile information where applicable. |
| Categories | Stores product categories. |
| Products | Stores product details and stock quantities. |
| Sales | Stores sales transactions. |
| SaleItems | Stores products and quantities associated with each sale. |
| Expenses | Stores business expense records. |

Each business record will be associated with its owner to ensure that users can only access authorized information.

## 8. Planned API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/products` | Retrieve all products |
| POST | `/api/products` | Add a product |
| GET | `/api/products/<id>` | Retrieve a specific product |
| PATCH | `/api/products/<id>` | Update product information |
| DELETE | `/api/products/<id>` | Delete a product |
| GET | `/api/sales` | Retrieve sales records |
| POST | `/api/sales` | Record a sale |
| GET | `/api/expenses` | Retrieve expenses |
| POST | `/api/expenses` | Record an expense |
| GET | `/api/dashboard/summary` | Retrieve dashboard statistics |

*Note: These are planned endpoints and will be updated as development progresses.*

## 9. Project Structure

```text
dukasmart/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── __init__.py
│   │
│   ├── tests/
│   ├── config.py
│   ├── requirements.txt
│   └── run.py
│
├── docs/
│   └── DukaSmart_Project_Proposal.docx
│
├── .gitignore
└── README.md
```

## 10. Installation and Setup

### Prerequisites

Ensure you have the following installed:

- Python 3.
- Node.js and npm.
- PostgreSQL.
- Git.

### Step 1: Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/dukasmart.git
cd dukasmart
```

Replace `YOUR-USERNAME` with your GitHub username or organization.

### Step 2: Set up the backend

```bash
cd backend

python3 -m venv .venv

source .venv/Scripts/activate

pip install -r requirements.txt
```

### Step 3: Set up the frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

*Note: These commands assume the React and Flask application files have been created.*

## 11. Environment Variables

The application will use environment variables to protect sensitive configuration information.

Example `.env` file:

```env
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/dukasmart
JWT_SECRET_KEY=your-secret-key
```

Never commit your actual `.env` file, database passwords or secret keys to GitHub.

## 12. Important Business Rules

- Recording a sale must automatically reduce available stock.
- A sale cannot exceed the available stock quantity.
- Low-stock alerts should appear when stock is less than or equal to the minimum stock threshold.
- Gross profit is calculated as revenue minus cost of goods sold.
- Net profit is calculated as gross profit minus operating expenses.
- Users must only access their own authorized business records.
- Sales and inventory updates should be handled safely using database transactions.

## 13. Team Responsibilities

The project will be developed collaboratively by four team members.

| Member | Responsibility |
|---|---|
| Member 1 | Project coordination, GitHub management and integration |
| Member 2 | Frontend development using React |
| Member 3 | Backend development using Flask |
| Member 4 | Database design, API testing and validation |

All members will participate in testing, reviewing code and integrating the different modules.

## 14. GitHub Collaboration Guidelines

To maintain an organized development process, the team will use Git and GitHub.

Each member should:

1. Clone the shared repository.
2. Pull the latest changes from `main`.
3. Create an individual feature branch.
4. Work on assigned tasks.
5. Commit changes regularly.
6. Push changes to GitHub.
7. Create a Pull Request.
8. Request code review before merging into `main`.

Example:

```bash
git checkout main
git pull origin main

git checkout -b feature/inventory-management

git add .

git commit -m "Add inventory management"

git push -u origin feature/inventory-management
```

## 15. Testing

The application will undergo testing to ensure that all features work correctly.

Testing will include:

- User registration and login.
- Inventory CRUD operations.
- Sales recording and stock deduction.
- Expense recording.
- Profit calculations.
- Low-stock notifications.
- API endpoint testing using Postman.
- Frontend and backend integration.
- Authentication and data access security.

## 16. Expected Outcomes

At the end of the project, the team expects to deliver:

- A functional web-based business management system.
- A secure user authentication system.
- An inventory management module.
- A sales and expense tracking system.
- Automated stock updates.
- Low-stock notifications.
- A business performance dashboard.
- A properly structured PostgreSQL database.
- Tested REST API endpoints.
- Complete project documentation.

## 17. Conclusion

DukaSmart aims to provide small business owners with a convenient and reliable platform for managing their daily business operations.

By digitizing inventory, sales and expense management, the system will reduce manual work, improve record accuracy and help business owners make informed decisions.

The project will also allow our team to demonstrate practical software development skills in frontend development, backend development, database management, API integration, testing and collaborative programming.

---

**Project Name:** DukaSmart – Smart Business Management System

**Project Type:** Full-Stack Web Application

**Development Team:** Four Members

**Repository:** GitHub

**Status:** In Development 
