# LoanWise Frontend (React + TypeScript + Vite)

A production-ready **React frontend** for the LoanWise peer-to-peer loan platform.  
This project is structured and built to demonstrate **senior software engineering practices**, with focus on scalability, maintainability, and clean architecture.

---

## ✨ Features Implemented

- **Vite + React + TypeScript**: Fast build toolchain with type safety.
- **Tailwind CSS v4**: Utility-first styling with custom design tokens (light/dark theme).
- **State Management**:
  - **Redux Toolkit** for application state (auth, profile).
  - **TanStack React Query** for server state, caching, retries.
- **Authentication**:
  - Register, Login, JWT + Refresh token flow.
  - Persisted auth state (localStorage).
  - Axios interceptors for automatic token injection & refresh.
- **Routing**:
  - React Router DOM v6 with `createBrowserRouter`.
  - `ProtectedRoute` for role-based access (Borrower, Lender, Admin).
  - Lazy loading of feature pages.
- **Feature Modules**:
  - **Auth**: Register, Login, Me (profile page).
  - **Loans**: Open Loans list (restricted to Lender/Admin).
  - **Notifications**: List & mark-as-read actions.
- **Project Hygiene**:
  - ESLint + Prettier integrated for consistent style.
  - Strict TypeScript config with path aliases (`@ → src`).
  - Organized, feature-sliced folder structure.

---

## 📂 Project Structure

```plaintext
src/
  app/                # Core app setup (store, providers, routes)
  features/           # Domain features (auth, loans, notifications, etc.)
    auth/             # Auth domain (pages, api, model, hooks)
    loans/            # Loan domain (pages, api, model)
    notifications/    # Notifications domain (pages, api)
  shared/             # Reusable components, utilities, types
  styles/             # Global styles (Tailwind + tokens)
```

- **Feature-sliced architecture** → each domain owns its `api/`, `pages/`, `model/`, `hooks/`.
- Encourages isolation, testability, and scaling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm (or yarn/pnpm)

### Installation
```bash
git clone https://github.com/<your-username>/LoanWiseFrontEndReactV2.git
cd LoanWiseFrontEndReactV2
npm install
```

### Environment
Create `.env`:
```bash
VITE_API_BASE_URL=http://localhost:5000
```

### Run Dev Server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173).

---

## 🔒 Authentication Flow

- **Register** → `POST /api/auth/register`
- **Login** → `POST /api/auth/login` → returns `{ token, refreshToken, profile }`
- **Refresh** → `POST /api/auth/refresh` → Axios interceptor auto-refreshes on 401.
- **Me** → `GET /api/users/me` → keeps Redux profile in sync.

Tokens are persisted in localStorage and rehydrated on app load.

---

## 🧩 Key Components

- **RootLayout** → provides Navbar and `<Outlet />` for nested routes.
- **ProtectedRoute** → guards routes by authentication and roles.
- **Navbar** → role-aware nav with Register/Login or Me/Logout.
- **LoanCard** → reusable card with funding progress.

---

## 🛠️ Tooling & Quality

- **ESLint** with React, TypeScript, Accessibility, Import rules.
- **Prettier** for consistent formatting.
- **VSCode settings** for format-on-save integration.
- **Commit convention**: Conventional Commits (`feat:`, `fix:`, `chore:`).

---

## 🌍 Deployment

- Vite build optimized for production:
  ```bash
  npm run build
  npm run preview
  ```
- Output goes into `dist/` (ready for static hosting or CDN).

---

## 🧑‍💻 Engineering Practices Highlighted

- **Feature-based modular monolith** structure.
- **Clear separation** of app state (Redux) vs server state (React Query).
- **Resilient auth system** with token refresh flow.
- **Code hygiene** enforced at every commit (lint + prettier).
- **Scalable UI** with Tailwind tokens and dark mode.
- **Documentation & commit history** reflecting senior-level design thinking.

---

## 📈 Roadmap (Next Steps)

- Loan funding flow (`POST /api/fundings/{loanId}`)
- Borrower loan application flow
- Admin dashboards
- Test suite (unit + integration with React Testing Library & Vitest)

---

## 📜 License
MIT — feel free to use for reference or learning.

---
