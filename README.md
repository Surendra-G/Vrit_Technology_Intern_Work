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


UI of the System
Front Page
![image](https://github.com/user-attachments/assets/d3e1522e-9b25-4f82-9d11-e30c32c8c00f)

Register Page
![image](https://github.com/user-attachments/assets/58d1a366-cbfb-4b26-9762-e6faa2f395c6)

Login Page
![image](https://github.com/user-attachments/assets/06574a3a-856e-46f5-9dd6-7c0843ccfea9)
![image](https://github.com/user-attachments/assets/ec3efe13-abe8-4002-a032-e93371edb765)

Expenses Page
![image](https://github.com/user-attachments/assets/fde68249-6961-4544-8f3c-9badc47906bf)



![image](https://github.com/user-attachments/assets/79e1aa7e-dc21-409b-838b-edf7671086af)
![image](https://github.com/user-attachments/assets/bcc7d2ea-7d43-4758-9031-ef1caa6ef6df)


