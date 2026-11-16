# 🚚 Rider Management System

A modern, full-stack **Rider & Logistics Management System** built with **Angular 14** and **Flask**. Designed for delivery businesses, dispatchers, and fleet managers to monitor riders, manage orders, assign deliveries, analyze performance metrics, and handle secure user profiles.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start / Setup Guide](#-quick-start--setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup-flask--postgresql)
  - [3. Frontend Setup](#3-frontend-setup-angular--tailwind-css)
- [API Reference & Swagger Documentation](#-api-reference--swagger-documentation)
- [Common Troubleshooting](#-common-troubleshooting)

---

## ✨ Key Features

### 📊 Real-Time Operations Dashboard

- High-level KPI metrics: Total Orders, Pending, Delivered, Assigned, and Cancelled orders.
- Financial tracking: Aggregated total order value and revenue metrics.
- Fleet metrics: Active vs. inactive riders, available vs. busy delivery personnel.
- Efficiency calculations: Real-time delivery success rate percentage.

### 🚴 Rider Fleet Management

- **Add & Onboard Riders:** Capture rider name, contact information, vehicle type, vehicle registration number, and profile image.
- **Availability & Status Toggle:** Switch rider status (`active` / `inactive`) and availability (`available` / `busy`).
- **Pagination & Search:** Server-side pagination with search and filtering.
- **Cloud Media Sync:** Cloudinary integration for rider profile image uploads and automatic cleanup upon deletion.

### 📦 Order & Dispatch Management

- **Order Creation:** Create delivery orders with pickup and drop-off addresses, order items, customer contact, and price.
- **Rider Assignment:** Assign active and available riders to pending orders.
- **Order Status Management:** Track orders through their lifecycle (`pending`, `assigned`, `delivered`, `cancelled`).
- **Server-Side Pagination & Filtering:** Filter orders by status with dynamic pagination controls.

### 🔐 Security & User Settings

- **JWT-Protected Sessions:** Authentication using HTTP-only cookies with CSRF protection.
- **Angular Guards & Interceptors:** Protected routes and automatic authentication handling.
- **Profile Management:** Update user profile information and profile images.
- **Password Management:** Secure password updates using Werkzeug password hashing.

---

## 🛠️ System Architecture & Tech Stack

| Technology | Purpose |
|---|---|
| Angular 14 | Frontend application |
| TypeScript | Frontend programming language |
| Tailwind CSS | UI styling and responsive design |
| RxJS | Asynchronous operations and data handling |
| Flask | Backend REST API |
| Python | Backend programming language |
| PostgreSQL | Relational database |
| SQLAlchemy | Database ORM |
| Flask-JWT-Extended | Authentication and JWT management |
| Marshmallow | Request validation and serialization |
| Cloudinary | Profile image storage |
| Swagger / Flasgger | API documentation |

---

## 📂 Project Directory Structure

```text
rider-management-system/
│
├── backend/
│   ├── config/              # Database connection & SQLAlchemy setup
│   ├── controllers/         # Business logic (Auth, Users, Riders, Orders)
│   ├── middleware/          # JWT authentication middleware
│   ├── models/              # SQLAlchemy models (User, Rider, Order)
│   ├── routes/              # Flask Blueprints
│   ├── schemas/             # Marshmallow validation schemas
│   ├── utils/               # Cloudinary helpers & validation utilities
│   ├── .env.example         # Backend environment variable template
│   ├── app.py               # Application entry point
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Guards, interceptors, models, API services
│   │   │   ├── features/    # Auth, Dashboard, Riders, Orders, Settings
│   │   │   ├── layout/      # Navbar, Sidebar and application layout
│   │   │   ├── shared/      # Reusable components and dialogs
│   │   │   ├── app-routing.module.ts
│   │   │   └── app.module.ts
│   │   ├── environments/    # Environment configurations
│   │   └── styles.css       # Global styles and Tailwind directives
│   │
│   ├── angular.json         # Angular workspace configuration
│   ├── package.json         # Frontend dependencies and scripts
│   ├── package-lock.json    # Locked dependency versions (if included)
│   ├── proxy.conf.json      # Development proxy configuration
│   └── tailwind.config.js   # Tailwind CSS configuration
│
├── requirements.txt         # Root Python requirements
└── README.md                # Project documentation
```

---

## ⚙️ Prerequisites

Before setting up the project, make sure the following tools are available on your system:

| Tool | Version / Requirement |
|---|---|
| Git | Latest stable version |
| Node.js | 16.20.2 (recommended for frontend) |
| npm | Installed automatically with Node.js |
| Python | Compatible Python 3.x version |
| PostgreSQL | Local or hosted database |
| Cloudinary | Account for image storage |

Useful links:

- Git: https://git-scm.com/
- Node.js: https://nodejs.org/
- Python: https://www.python.org/
- PostgreSQL: https://www.postgresql.org/
- Cloudinary: https://cloudinary.com/
- NVM for Windows: https://github.com/coreybutler/nvm-windows/releases

---

## 🚀 Quick Start / Setup Guide

### 1. Clone the Repository

Open a terminal and clone the project:

```bash
git clone https://github.com/ArashadAli/rider-management-system.git

cd rider-management-system
```

---

### 2. Backend Setup (Flask & PostgreSQL)

Follow these steps to configure and run the backend.

**Step 1: Navigate to the backend directory**

```bash
cd backend
```

**Step 2: Create and activate a virtual environment**

For Windows (PowerShell):

```powershell
python -m venv venv

.\venv\Scripts\Activate.ps1
```

For macOS / Linux:

```bash
python3 -m venv venv

source venv/bin/activate
```

**Step 3: Install backend dependencies**

```bash
pip install -r requirements.txt
```

**Step 4: Configure environment variables**

Create a `.env` file using the provided `.env.example` file.

For Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

For macOS / Linux:

```bash
cp .env.example .env
```

Make sure all required environment variables are correctly configured before starting the backend.

**Step 5: Initialize database tables**

The backend automatically invokes `db.create_all()` inside `app.py` when the server starts.

Make sure your PostgreSQL database already exists and the connection details are correct.

**Step 6: Start the Flask backend**

```bash
python app.py
```

The backend will start at:

```text
http://localhost:5000
```

Keep this terminal running while setting up and using the frontend.

---

### 3. Frontend Setup (Angular & Tailwind CSS)

The frontend is developed using Angular 14, TypeScript and Tailwind CSS.

Before installing frontend dependencies, first check the Node.js version available on your local system.

#### Step 1: Check Node.js and npm Versions

Open Command Prompt or PowerShell and execute:

```bash
node -v
npm -v
```

This project uses Angular 14. For this project, **Node.js v16.20.2** is recommended.

- If Node.js v16.20.2 is already installed, you can directly proceed to Step 3.
- If Node.js is not installed or an incompatible version is installed, follow Step 2.

#### Step 2: Install and Configure NVM (If Required)

NVM (Node Version Manager) allows you to install and switch between multiple Node.js versions without manually uninstalling and reinstalling them.

**For Windows:**

1. If you already have a standalone Node.js installation, uninstall it from Windows Settings > Apps > Installed Apps to avoid PATH conflicts.
2. Open the official NVM for Windows releases page:

   https://github.com/coreybutler/nvm-windows/releases

3. Download and install the latest `nvm-setup.exe`.
4. Once installation is complete, close and reopen Command Prompt or PowerShell.
5. Verify NVM installation:

```powershell
nvm version
```

6. Install Node.js v16.20.2:

```powershell
nvm install 16.20.2
```

7. Switch to the installed Node.js version:

```powershell
nvm use 16.20.2
```

8. Verify the active Node.js and npm versions:

```powershell
node -v
npm -v
```

The Node.js version should now display:

```text
v16.20.2
```

**Note:** If you encounter permission-related issues while executing `nvm use`, open Command Prompt or PowerShell as Administrator and execute the command again.

**For macOS / Linux:**

Install NVM by following the official instructions:

https://github.com/nvm-sh/nvm

After installation, execute:

```bash
nvm install 16.20.2

nvm use 16.20.2

node -v
npm -v
```

#### Step 3: Navigate to the Frontend Directory

From the project root directory, navigate to the frontend folder:

```bash
cd frontend
```

Make sure the `package.json` file is available inside this directory.

#### Step 4: Install Frontend Dependencies

Install all required frontend packages using:

```bash
npm install
```

This command reads the dependencies from `package.json` and installs them inside the `node_modules` directory.

If the repository contains a `package-lock.json` file, you can also use:

```bash
npm ci
```

`npm ci` installs the dependency versions recorded in the lock file, making it suitable for setting up the project consistently.

**Note:** Do not delete the `package-lock.json` file unnecessarily. If dependency resolution issues occur, first verify the Node.js and npm versions. Use `npm install --legacy-peer-deps` only if a peer dependency conflict requires it.

#### Step 5: Configure the Backend API URL

Before running the frontend, make sure it is pointing to the correct backend API.

Open the following file:

```text
src/environments/environment.ts
```

For local development, configure the API URL as follows:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

If your backend is running on a different host or port, update the URL accordingly.

Make sure the Flask backend is running before testing API-based functionalities.

#### Step 6: Start the Angular Development Server

Once all dependencies are installed and the API URL is configured, start the frontend application:

```bash
npm start
```

This command internally executes `ng serve` using the script defined in `package.json`.

After successful compilation, open your browser and navigate to:

```text
http://localhost:4200/
```

The Angular application should now be running locally.

You can also start the application directly using:

```bash
npx ng serve
```

To stop the development server, press:

```text
Ctrl + C
```

#### Available Frontend Commands

The following commands are available inside the frontend directory:

| Command | Description |
|---|---|
| `npm start` | Starts the Angular development server. |
| `npm run build` | Builds the Angular application. |
| `npm run watch` | Builds the application in development watch mode. |
| `npm test` | Runs unit tests using Karma and Jasmine. |
| `npx ng version` | Displays installed Angular and CLI versions. |

#### Frontend Technology & Dependencies

The frontend uses the following main technologies and libraries:

- **Angular 14:** Main framework used to develop the application.
- **TypeScript 4.7:** Programming language used for Angular development.
- **Node.js 16.20.2:** Runtime environment used for frontend development.
- **npm:** Package manager used to install and manage project dependencies.
- **RxJS:** Used for handling asynchronous operations and Observables.
- **Tailwind CSS:** Used for styling and responsive layouts.
- **Lucide Angular:** Used for icons throughout the application.
- **Ngx-Toastr:** Used for displaying application notifications.
- **Jasmine & Karma:** Used for unit testing.

The complete dependency configuration and declared versions are available in `frontend/package.json`.

**Important:** Avoid upgrading Angular, Angular CLI or TypeScript packages independently without checking their compatibility with Angular 14.

---

## 📡 API Reference & Swagger Documentation

Interactive API documentation and schema exploration are available through Swagger UI.

- **Swagger UI:** http://localhost:5000/docs
- **OpenAPI Specification:** http://localhost:5000/static/openapi.json

All backend routes are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user and issue JWT cookies | No |
| GET | `/api/auth/csrf-token` | Retrieve CSRF token | No |
| GET | `/api/auth/logout` | Invalidate session cookies | Yes |

---

## ❓ Common Troubleshooting

### 1. Node.js Version Compatibility Issues

If you encounter Angular CLI or dependency installation errors:

- Check your current Node.js version using `node -v`.
- Make sure Node.js v16.20.2 is active.
- If you have multiple Node.js versions installed, switch using NVM:

```bash
nvm use 16.20.2
```

- Close and reopen the terminal if the updated version is not reflected.

### 2. npm Dependency Installation Issues

If `npm install` fails:

- Verify the active Node.js and npm versions.
- Make sure you are inside the frontend directory.
- If the project contains `package-lock.json`, try:

```bash
npm ci
```

- If a peer dependency conflict occurs, try:

```bash
npm install --legacy-peer-deps
```

### 3. Database Connection Errors

If you encounter `OperationalError` or `psycopg2` errors:

- Verify that the PostgreSQL service is running.
- Check the database name and connection string in the backend `.env` file.
- Make sure the database credentials are correct.
- If your password contains special characters, ensure they are URL-encoded in the connection string.

### 4. CORS or 401 Unauthorized Errors

If frontend API requests return CORS or 401 errors:

- Confirm that the backend CORS configuration allows `http://localhost:4200`.
- Make sure the frontend API URL is correct.
- Verify JWT cookie configuration for local development.
- For local cookie authentication, check that:

```text
JWT_COOKIE_SECURE=False
JWT_COOKIE_SAMESITE=Lax
```

- Make sure the CSRF token is correctly generated and sent with protected requests.

### 5. Cloudinary Image Upload Issues

If profile or rider image uploads fail:

- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend `.env` file.
- Make sure the Cloudinary credentials are correct.
- Check the configured request payload size limit. The current application configuration uses a 3 MB limit.

---