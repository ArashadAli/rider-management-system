# 🚚 Rider Management System

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Angular](https://img.shields.io/badge/Frontend-Angular%2014-DD0031.svg?logo=angular&logoColor=white)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5.svg?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

A modern, full-stack **Rider & Logistics Management System** built with **Angular 14** and **Flask**. Designed for delivery businesses, dispatchers, and fleet managers to monitor riders, manage orders, assign deliveries, analyze performance metrics in real-time, and handle secure user profiles.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start / Setup Guide](#-quick-start--setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup (Flask & PostgreSQL)](#2-backend-setup-flask--postgresql)
  - [3. Frontend Setup (Angular & Tailwind CSS)](#3-frontend-setup-angular--tailwind-css)
- [Environment Variables Reference](#-environment-variables-reference)
- [API Reference](#-api-reference)
- [Common Troubleshooting](#-common-troubleshooting)
- [License](#-license)

---

## ✨ Key Features

### 📊 Real-Time Operations Dashboard
- High-level KPI metrics: Total Orders, Pending, Delivered, Assigned, and Cancelled orders.
- Financial tracking: Aggregated total order value and revenue metrics.
- Fleet metrics: Active vs. inactive riders, available vs. busy delivery personnel.
- Efficiency calculations: Real-time delivery success rate percentage.

### 🚴 Rider Fleet Management
- **Add & Onboard Riders**: Capture rider name, contact info, vehicle type, vehicle registration number, and profile image.
- **Availability & Status Toggle**: Easily switch rider status (`active`/`inactive`) and live availability (`available`/`busy`).
- **Pagination & Search**: Efficient server-side pagination with query filtering.
- **Cloud Media Sync**: Cloudinary integration for rider avatar uploads and automatic cleanup upon deletion.

### 📦 Order & Dispatch Management
- **Order Creation**: Create delivery orders with pickup & drop-off addresses, order items, customer contact, and price.
- **Rider Assignment**: Assign active, available riders to pending orders with immediate status synchronization.
- **Status Lifecycles**: Track orders through state transitions (`pending` ➔ `assigned` ➔ `delivered` / `cancelled`).
- **Server-Side Pagination & Filtering**: Filter orders by status with dynamic pagination controls.

### 🔐 Security & User Settings
- **JWT-Protected Sessions**: Stored in HTTP-only cookies with CSRF protection (`X-CSRF-TOKEN`).
- **Angular Guards & Interceptors**: Client-side protected routes (`AuthGuard`) and automatic header/credential injection (`AuthInterceptor`).
- **Profile & Credential Management**: Update user profile details, change avatars, and update passwords with secure Werkzeug hashing.

---

## 🛠 System Architecture & Tech Stack

```
+--------------------------------------------------------------+
|                    Angular 14 Frontend                       |
|   Tailwind CSS | Lucide Icons | ngx-toastr | Standalone Components |
+------------------------------+-------------------------------+
                               |
                        HTTP / REST APIs
                     (CORS & JWT / Cookies)
                               |
                               v
+--------------------------------------------------------------+
|                     Flask 3.1 Backend                        |
| Flask-JWT-Extended | Marshmallow | SQLAlchemy ORM | Gunicorn |
+------------------------------+-------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
+-------------------------------+             +-----------------+
|      PostgreSQL Database      |             |  Cloudinary API |
|   Users | Riders | Orders     |             |  (Image Assets) |
+-------------------------------+             +-----------------+
```

- **Frontend**:
  - **Framework**: Angular 14 (TypeScript 4.7, RxJS 7.5)
  - **Styles**: Tailwind CSS 3.4, PostCSS, Autoprefixer
  - **Icons & UI**: Lucide Angular (`lucide-angular`), `ngx-toastr`
- **Backend**:
  - **Framework**: Flask 3.1 (Python 3.9+)
  - **Database ORM**: Flask-SQLAlchemy 3.1 / SQLAlchemy 2.1
  - **Validation**: Marshmallow 4.3 schemas
  - **Authentication**: Flask-JWT-Extended (Cookies & Bearer tokens, CSRF support)
  - **Image Processing**: Cloudinary SDK & Pillow
- **Database**:
  - PostgreSQL (via `psycopg2-binary`)

---

## 📂 Project Directory Structure

```text
rider-management-system/
├── backend/
│   ├── config/              # Database connection & SQLAlchemy setup
│   ├── controllers/         # Business logic (Auth, Users, Riders, Orders)
│   ├── middleware/          # JWT auth verification middleware
│   ├── models/              # SQLAlchemy models (User, Rider, Order)
│   ├── routes/              # Flask Blueprints (auth, user, order, rider)
│   ├── schemas/             # Marshmallow request validation schemas
│   ├── utils/               # Cloudinary helpers & validation utilities
│   ├── .env.example         # Template for backend environment variables
│   ├── app.py               # Application entry point & configuration
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Guards, interceptors, models, API services
│   │   │   ├── features/    # Auth, Dashboard, Riders, Orders, Settings
│   │   │   ├── layout/      # Navbar, Sidebar, and App Shell layout
│   │   │   ├── shared/      # Reusable UI components & dialogs
│   │   │   ├── app-routing.module.ts
│   │   │   └── app.module.ts
│   │   ├── environments/    # Environment configurations (API URL)
│   │   └── styles.css       # Global styles & Tailwind directives
│   ├── angular.json         # Angular workspace configuration
│   ├── package.json         # Frontend dependencies and npm scripts
│   ├── proxy.conf.json      # Dev proxy configuration
│   └── tailwind.config.js   # Tailwind CSS styling configuration
├── requirements.txt         # Root Python requirements
└── README.md                # Project documentation
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Git**: [Download Git](https://git-scm.com/)
2. **Node.js**: `v16.x` or `v18.x` recommended (compatible with Angular 14) — [Download Node.js](https://nodejs.org/)
3. **Python**: `3.9` to `3.12` — [Download Python](https://www.python.org/)
4. **PostgreSQL**: A running PostgreSQL instance (Local or hosted on [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)
5. **Cloudinary Account**: Free tier account for profile image storage — [Sign up on Cloudinary](https://cloudinary.com/)

---

## 🚀 Quick Start / Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/ArashadAli/rider-management-system.git
cd rider-management-system
```

---

### 2. Backend Setup (Flask & PostgreSQL)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **On Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **On macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**:
   Copy the `.env.example` file to create a new `.env` file:
   - **Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **macOS / Linux**:
     ```bash
     cp .env.example .env
     ```

   Open `.env` in an editor and fill in your values:
   ```env
   # PostgreSQL Connection URI
   # Format: postgresql://<user>:<password>@<host>:<port>/<dbname>
   POSTGRE_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/rider_db

   # JWT & Security Configuration
   SECRET_KEY=your_super_secret_jwt_key_here
   SECRET_KEY_EXPIRY=86400
   JWT_COOKIE_SECURE=False
   JWT_COOKIE_SAMESITE=Lax

   # Cloudinary Media Storage (from Cloudinary Dashboard)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Initialize Database Tables**:
   The backend automatically invokes `db.create_all()` inside `app.py` when the server starts. Ensure your PostgreSQL database exists before launching.

6. **Start the Flask Backend Server**:
   ```bash
   python app.py
   ```
   > 🚀 The backend will start on: **`http://localhost:5000`**

---

### 3. Frontend Setup (Angular & Tailwind CSS)

1. **Open a new terminal and navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```
   *(Note: If you run into dependency resolution issues on newer npm versions, run `npm install --legacy-peer-deps`)*

3. **Verify API Environment**:
   Ensure `frontend/src/environments/environment.ts` points to your backend URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'
   };
   ```

4. **Start the Angular Development Server**:
   ```bash
   npm start
   # or: npx ng serve
   ```
   > 🌐 Open your browser and navigate to: **`http://localhost:4200`**

---

## 🔑 Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `POSTGRE_CONNECTION_STRING` | Full PostgreSQL database connection URL | `postgresql://user:pass@localhost:5432/rider_db` |
| `SECRET_KEY` | Secret key used for signing JWT tokens | `super-secret-key-change-in-prod` |
| `SECRET_KEY_EXPIRY` | Token expiration time in seconds | `86400` (24 hours) |
| `JWT_COOKIE_SECURE` | Set to `True` in HTTPS production, `False` for local HTTP | `False` |
| `JWT_COOKIE_SAMESITE` | Cookie SameSite policy | `Lax` (or `None` for cross-site HTTPS) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz` |

---

## 📡 API Reference

All backend routes are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login user & issue JWT cookies | No |
| `GET` | `/api/auth/csrf-token` | Retrieve CSRF token for request signing | No |
| `GET` | `/api/auth/logout` | Invalidate session cookies | Yes |

### 👤 User & Dashboard (`/api/users`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/users/dashboard` | Fetch KPI stats, orders, and rider analytics | Yes |
| `GET` | `/api/users/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/users/update-profile`| Update profile info and avatar | Yes |
| `PUT` | `/api/users/change-password` | Update account password | Yes |

### 🚴 Riders (`/api/riders`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/riders/create` | Register a new rider with vehicle & photo | Yes |
| `GET` | `/api/riders/paginate` | Paginated & filtered list of riders | Yes |
| `GET` | `/api/riders/allRiders` | Get complete list of riders | Yes |
| `GET` | `/api/riders/rider/:id` | Get details of a single rider | Yes |
| `PATCH`| `/api/riders/rider-action/:id`| Toggle rider active/inactive or availability | Yes |
| `POST` | `/api/riders/active-riders` | Query currently active riders | Yes |
| `PUT` | `/api/riders/rider/:id` | Update rider profile details | Yes |
| `DELETE`| `/api/riders/rider/:id` | Delete rider and clean up Cloudinary image | Yes |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/orders/create` | Create a new delivery order | Yes |
| `GET` | `/api/orders/pagination` | Paginated & status-filtered order list | Yes |
| `GET` | `/api/orders/allOrders` | Get list of all orders | Yes |
| `GET` | `/api/orders/single-order/:id` | Get details for an individual order | Yes |
| `POST` | `/api/orders/assign-rider/:id`| Assign a rider to a pending order | Yes |
| `POST` | `/api/orders/update-order-status/:id` | Transition order status (`pending`, `delivered`, etc.) | Yes |
| `DELETE`| `/api/orders/order/:id` | Remove order record | Yes |

---

## ❓ Common Troubleshooting

<details>
<summary><b>1. Database connection fails (`OperationalError` or `psycopg2` errors)</b></summary>

- Verify PostgreSQL service is active:
  - Windows: Check Services (`services.msc`) -> `postgresql-x64` is Running.
  - Linux: `sudo systemctl status postgresql`
- Ensure database name matches what you wrote in `POSTGRE_CONNECTION_STRING`.
- If using special characters in your password, ensure they are URL-encoded.
</details>

<details>
<summary><b>2. CORS or 401 Unauthorized errors on API calls</b></summary>

- Confirm `origins` list in `backend/app.py` includes `http://localhost:4200`.
- For cookie authentication on `localhost`:
  - Ensure `JWT_COOKIE_SECURE=False` in your backend `.env` file during local development.
  - Set `JWT_COOKIE_SAMESITE=Lax`.
</details>

<details>
<summary><b>3. Node.js version conflict with Angular 14</b></summary>

- Angular 14 officially supports Node.js versions `14.15.0+`, `16.10.0+`, and `18.x`.
- If you have Node.js 20+ installed, you can use `nvm` (Node Version Manager) to switch:
  ```bash
  nvm use 18
  ```
- Or run npm install with:
  ```bash
  npm install --legacy-peer-deps
  ```
</details>

<details>
<summary><b>4. Image upload issues with Cloudinary</b></summary>

- Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly configured in `.env`.
- Ensure images are under the request payload limit (configured to 3MB in `app.py`).
</details>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
