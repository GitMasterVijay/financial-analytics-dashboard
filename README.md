
# Financial Analytics Dashboard

A full-stack financial analytics dashboard built as a technical assignment for analyzing transaction data through interactive visualizations, advanced filtering, sorting, pagination, and configurable CSV export.

The application uses a React + TypeScript frontend, Node.js + Express backend, MongoDB for data storage, and JWT-based authentication.

---

## 📌 Project Overview

The Financial Analytics Dashboard helps financial analysts monitor and analyze company transaction records through a centralized and interactive interface.

The application provides:

- Secure JWT-based authentication
- Financial summary metrics
- Revenue vs. expense trend visualization
- Transaction category analysis
- Transaction search and filtering
- Amount and date range filtering
- User and status filtering
- Server-side sorting
- Server-side pagination
- Configurable CSV export
- Responsive dashboard interface
- API-level error handling
- Loading and empty states

The application follows a client-server architecture where the React frontend communicates with REST APIs provided by the Express backend.

---

## ✨ Key Features

### 🔐 Authentication

- JWT-based login
- Protected frontend routes
- Protected backend APIs
- Secure password hashing using bcrypt
- Session restoration after page refresh
- Logout functionality
- Automatic handling of expired/invalid sessions

### 📊 Financial Dashboard

The dashboard provides:

- Total Revenue
- Total Expenses
- Balance
- Savings
- Revenue vs. Expense trends
- Category-based transaction breakdown
- Recent transactions
- Date-based analytics
- User-based filtering

### 💳 Transaction Management

The Transactions page provides:

- Transaction listing
- Real-time search/filter input
- Date filtering
- Minimum amount filtering
- Maximum amount filtering
- Category filtering
- Status filtering
- User filtering
- Column sorting
- Ascending/descending sorting
- Server-side pagination
- Configurable records per page
- Refresh functionality
- Loading states
- Empty states
- Error handling

### 📥 CSV Export

Users can export transaction records as CSV.

The export functionality supports:

- Current transaction filters
- Configurable CSV columns
- Proper CSV headers
- Filtered transaction export
- Direct browser download

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Frontend development/build tool |
| Material UI | UI components |
| Tailwind CSS | Layout and styling |
| React Router | Client-side routing |
| Axios | API communication |
| Recharts | Financial data visualization |
| React Hook Form | Form handling |
| Zod | Form validation |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| TypeScript | Type safety |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| dotenv | Environment configuration |
| CORS | Cross-origin request handling |

### Development Tools

- Git
- GitHub
- MongoDB Compass
- MongoDB Shell
- Postman

---

## 🏗️ Application Architecture

```text
                    ┌──────────────────────┐
                    │      React App       │
                    │   TypeScript + Vite  │
                    └──────────┬───────────┘
                               │
                               │ Axios / REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    │   Node.js + TS       │
                    └──────────┬───────────┘
                               │
                               │ Mongoose
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │  Transaction Data    │
                    └──────────────────────┘



financial-analytics-dashboard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── sampledata/
│   │   └── transactions.json
│   │
│   ├── package.json
│   └── ...
│
├── .env.example
├── .gitignore
└── README.md


# API Documentation

Base URL:

http://localhost:5000/api

All protected APIs require:

Authorization: Bearer <JWT_TOKEN>

---

## 1. Health Check

### GET /health

Checks whether the backend server is running.

Authentication: Not required

Example:

GET http://localhost:5000/api/health

---

## 2. User Login

### POST /auth/login

Authenticates the user and returns a JWT token.

Authentication: Not required

Request Body:

```json
{
  "email": "your-email",
  "password": "your-password"
}