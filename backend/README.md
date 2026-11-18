
# Rider Management System – Backend

This folder contains the backend of the Rider Management System. It is built with Flask and PostgreSQL and provides the APIs used by the Angular frontend.

## Tech Stack
| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| Flask | REST API development |
| PostgreSQL | Relational database |
| SQLAlchemy | Database ORM |
| Flask-JWT-Extended | JWT authentication and cookie management |
| Marshmallow | Request validation and serialization |
| Cloudinary | Profile image storage |
| Swagger / Flasgger | API documentation |

## Features
- User authentication using JWT cookies and CSRF protection.
- Rider creation and management, including profile image uploads.
- Order creation, rider assignment and order status management.
- Server-side pagination and filtering.
- User profile and password management.
- Swagger UI for API documentation.

## Project Structure
```text
backend/
├── config/          # Database connection and SQLAlchemy setup
├── controllers/     # Business logic for authentication, users, riders and orders
├── middleware/      # JWT authentication middleware
├── models/          # SQLAlchemy models
├── routes/          # Flask Blueprints and API routes
├── schemas/         # Marshmallow validation schemas
├── utils/           # Cloudinary helpers and validation utilities
├── .env.example     # Environment variable template
├── app.py           # Application entry point
└── requirements.txt # Python dependencies
```

## Prerequisites
Before running the backend, make sure you have:
- Python 3.x installed.
- PostgreSQL installed or access to a hosted PostgreSQL database.
- Git installed.
- A Cloudinary account for image uploads.

## Setup
### 1. Navigate to the backend folder
```bash
cd backend
```
### 2. Create and activate a virtual environment
**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
### 3. Install dependencies
```bash
pip install -r requirements.txt
```
### 4. Configure environment variables
Create a `.env` file using the existing `.env.example` file.

**Windows:**
```powershell
Copy-Item .env.example .env
```
### 5. Create the PostgreSQL database
Create the database in PostgreSQL and make sure the database name and connection details match the values configured in `.env`.
The current application calls `db.create_all()` from `app.py` when the server starts. Make sure the database is available before starting the application.

### 6. Run the backend
```bash
python app.py
```
The backend will be available at:
```text
http://localhost:5000
```
Keep the backend terminal running while using the frontend.
## API Documentation
After starting the backend, open Swagger UI:
- **Swagger UI:** http://localhost:5000/docs
- **OpenAPI specification:** http://localhost:5000/static/openapi.json
All backend API routes use the `/api` prefix.

### Authentication Endpoints
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and issue JWT cookies | No |
| GET | `/api/auth/csrf-token` | Retrieve the CSRF token | No |
| GET | `/api/auth/logout` | Invalidate session cookies | Yes |

For complete API details, request parameters and response schemas, refer to Swagger UI.

## Common Issues
### PostgreSQL Connection Error
- Make sure the PostgreSQL service is running.
- Check the database name, username and password in `.env`.
- Verify that the connection string is correct.
- If the password contains special characters, URL-encode them in the connection string.

### CORS or 401 Unauthorized
- Check that the backend CORS configuration allows the frontend URL.
- Verify the API URL configured in the frontend.
- Check the JWT cookie settings for your environment.
- For local cookie authentication, check:
```text
JWT_COOKIE_SECURE=False
JWT_COOKIE_SAMESITE=Lax
```
- Make sure the CSRF token is generated and sent with protected requests.

### Cloudinary Image Upload Error
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env`.
- Verify that the Cloudinary credentials are correct.
- Check the request payload size. The current application configuration uses a 3 MB limit.
---
For frontend installation and setup, refer to `frontend/README.md`.
