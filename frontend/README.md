
# Rider Management System – Frontend
This folder contains the frontend of the Rider Management System. The application is built with Angular 14, TypeScript and Tailwind CSS. It provides the interface for managing riders, orders and user settings.

## Tech Stack

| Technology | Purpose |
|---|---|
| Angular 14 | Frontend framework |
| TypeScript 4.7 | Application development |
| Node.js 16.20.2 | JavaScript runtime |
| npm | Package management |
| RxJS | Asynchronous operations and Observables |
| Tailwind CSS | Styling and responsive layouts |
| Lucide Angular | Icons |
| Ngx-Toastr | Application notifications |
| Jasmine and Karma | Unit testing |

The complete dependency list and version details are available in `package.json`.

## Features

- Dashboard with order, rider and delivery metrics.
- Rider management, including rider details, status and profile images.
- Order creation, rider assignment and order status tracking.
- Search, filtering and server-side pagination.
- Login and protected application routes.
- User profile and password management.

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/          # Guards, interceptors, models and API services
│   │   ├── features/      # Auth, Dashboard, Riders, Orders and Settings
│   │   ├── layout/        # Navbar, Sidebar and application layout
│   │   ├── shared/        # Reusable components and dialogs
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   ├── environments/      # Environment configurations
│   └── styles.css         # Global styles and Tailwind directives
├── angular.json
├── package.json
├── package-lock.json
├── proxy.conf.json
└── tailwind.config.js
```

## Prerequisites

Make sure the following tools are installed:

- Node.js **16.20.2** (recommended for this Angular 14 project).
- npm (comes with Node.js).
- Git.

Check the installed versions:
```bash
node -v
npm -v
```
## Node.js Version Setup
This project uses Angular 14, so Node.js 16.20.2 is recommended.
If you already have the required version installed, you can skip this section.

### Windows
NVM for Windows can be used to install and switch between Node.js versions.
1. If you have a separate Node.js installation, uninstall it first to avoid PATH conflicts.
2. Download and install NVM for Windows from the [official releases page](https://github.com/coreybutler/nvm-windows/releases).
3. Close and reopen Command Prompt or PowerShell.
4. Check that NVM is installed:

```powershell
nvm version
```
5. Install and activate Node.js 16.20.2:
```powershell
nvm install 16.20.2
nvm use 16.20.2
```
6. Verify the active versions:
```powershell
node -v
npm -v
```
The Node.js version should show `v16.20.2`.
If `nvm use` gives a permission error, try running the terminal as Administrator.

## Setup
### 1. Navigate to the frontend folder
```bash
cd frontend
```
### 2. Install dependencies
```bash
npm install
```
If the repository includes `package-lock.json`, you can use `npm ci` to install the versions recorded in the lock file:
```bash
npm ci
```
### 3. Configure the backend API URL
Open:
```text
src/environments/environment.ts
```
For local development, make sure the API URL points to your running Flask backend:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### 4. Start the frontend
```bash
npm start
```
Once the application compiles, open:
```text
http://localhost:4200/
```
You can also start the server directly using:
```bash
npx ng serve
```
To stop the development server, press `Ctrl + C`.
Make sure the Flask backend is running before testing features that use the APIs.

## Common Issues
### Node.js Version or Angular CLI Issues
- Check the active Node.js version using `node -v`.
- Make sure Node.js 16.20.2 is active.
- If you use NVM, switch versions with:
```bash
nvm use 16.20.2
```
- Close and reopen the terminal if the active version does not update.
### npm Dependency Installation Issues
- Make sure you are inside the `frontend` folder.
- Check the Node.js and npm versions.
- If `package-lock.json` is available, try:
```bash
npm ci
```
### API or CORS Errors
- Make sure the Flask backend is running.
- Check `apiUrl` in `src/environments/environment.ts`.
- Confirm that the backend allows requests from `http://localhost:4200`.
- If authentication requests return 401 errors, check the backend JWT cookie and CSRF configuration as well.
---

For backend installation, database configuration and API documentation, refer to `backend/README.md`.
