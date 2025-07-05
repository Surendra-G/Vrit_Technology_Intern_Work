# Vrit_Technology_Intern_Work

# Expense Tracker API

A Django REST API for tracking expenses and income with JWT authentication.

## Features

- User registration and login with JWT with  UI
- CRUD operations for expense/income records
- Tax calculations (flat or percentage)
- Paginated responses
- User-specific data access (admin can access all)

## Setup

1. Create a virtual environment: `python -m venv venv`
2. Activate the environment: `source venv/bin/activate` 
3. Install dependencies: `pip install -r requirements.txt`
4. Run migrations: `python manage.py migrate`
5. Start the server: `python manage.py runserver`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh JWT token

### Expenses/Income
- `GET /api/expenses/` - List all records (paginated)
- `POST /api/expenses/` - Create a new record
- `GET /api/expenses/{id}/` - Retrieve a specific record
- `PUT /api/expenses/{id}/` - Update a record
- `DELETE /api/expenses/{id}/` - Delete a record

