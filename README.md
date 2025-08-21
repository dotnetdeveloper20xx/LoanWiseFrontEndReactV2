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

#Here’s a clean, role‑based snapshot of what the app does today, and what’s still on the runway. Use it as your “Done / To‑Do” board.

---

# Borrower

## ✅ Done

* **Register & Login**

  * Create borrower account; login persists JWT and profile.
* **Apply for a loan**

  * Form with amount, duration, **Purpose dropdown** (metadata).
  * `POST /api/loans/apply`.
* **Dashboard (My Loans / History)**

  * Paginated history of my loans with clear **status**.
  * `GET /api/loans/borrowers/history?page=&pageSize=`.
* **View repayments for a loan**

  * Unified page to show full schedule and repayment status.
  * `GET /api/loans/{loanId}/repayments`.
* **Make a repayment**

  * Pay from the repayments view (visible for unpaid instalments).
  * `POST /api/repayments/{repaymentId}/pay`.
* **Notifications**

  * See all notifications; **mark read** per item or mark all.
  * `GET /api/notifications`, `PUT /api/notifications/{id}/read`.
* **Borrower risk summary (viewer)**

  * Risk summary by borrower id (credit score, tier, flags).
  * `GET /api/borrowers/{borrowerId}/risk-summary`.

## ⏭️ To‑Do

* **My current loan application status widget** (surface the latest active application, CTA for next step).
* **Attach documents (KYC/Proofs)** if required by flow.
* **Export statements / receipts** (PDF/CSV) for repayments.
* **Filter & search** in dashboard (by status, date range).
* **In‑app toasts** for borrower actions (apply, repay) with deep links.

---

# Lender

## ✅ Done

* **Register & Login** (as Lender).
* **Discover open loans to fund**

  * Open Loans list with **amount** input and **Fund** button.
  * `GET /api/loans/open`, `POST /api/fundings/{loanId}`.
* **My Funded Loans (Dashboard)**

  * Portfolio of loans I’ve funded.
  * `GET /api/fundings/my`.
* **Lender Portfolio**

  * Totals (invested, returns, counts) + positions table.
  * `GET /api/lenders/portfolio`.
* **Lender Transactions**

  * Date + loan + borrower filters, paging.
  * `GET /api/lenders/transactions?from=&to=&loanId=&borrowerId=&page=&pageSize=`.
* **Notifications**

  * See & **mark read**.

## ⏭️ To‑Do

* **Cancel / adjust a funding** (if business rules allow, or submit a request).
* **Export transactions** (CSV/XLSX), possibly by `GET /api/lenders/transactions/export`.
* **Yield / returns view** per loan and overall IRR.
* **Reserved funds / wallet balance** (if applicable to business model).
* **Watchlist / bookmarks** for loans.

---

# Admin

## ✅ Done

* **User Management**

  * **See all** users (active + inactive).
  * Toggle **IsActive** via dropdown.
  * `GET /api/admin/users`, `PUT /api/admin/users/{id}/status`.
* **Loans — All & Open**

  * **All Loans** (admin report) — status, funding, purpose.
  * **Open Loans** (shared list with actions).
  * `GET /api/admin/reports/loans`, `GET /api/loans/open`.
* **Approve / Reject loan**

  * Approve pending; Reject with reason.
  * `POST /api/admin/loans/{loanId}/approve` / `/reject`.
* **Disburse loan**

  * Disburse after approval; repayments get generated.
  * `POST /api/loans/{loanId}/disburse`.
* **Overdue check**

  * Trigger overdue repayments job.
  * `POST /api/admin/repayments/check-overdue`.
* **Repayments viewer**

  * View schedule per loan.
  * `GET /api/loans/{loanId}/repayments`.
* **Notifications**

  * Sees system notifications, **mark read**.
  * Inline toasts on admin actions (approve/disburse) in UI.

## ⏭️ To‑Do

* **Admin dashboards** (KPIs: open/funded/disbursed/overdue trends; top lenders/borrowers).
* **Audit trail** (who approved/rejected/disbursed, when, reason).
* **Bulk operations** (bulk approve/disburse if permitted).
* **Config master data** (loan purposes / risk thresholds UI around metadata).
* **Downloadable reports** (CSV/PDF exports for loans/fundings/repayments).

---

# Cross‑cutting / Platform

## ✅ Done

* **JWT Auth + refresh**, consistent header injection; SignalR friendly.
* **CORS** configured for local dev (Vite 5173).
* **Role‑aware NavBar & routes** for Borrower / Lender / Admin.
* **React Query** caching strategy; **cache clear** on login; `/me` refetch guarantees correct identity.
* **Problem handling** with inline banners for major actions (funding, approve, disburse, pay).

## ⏭️ To‑Do

* **Global toast system** (dedicated lightweight toaster for success/error with deep links).
* **Error boundary improvements** (canonical error page + retry wiring).
* **Loading skeletons** for tables/cards.
* **E2E tests** for the golden paths:

  * Borrower: register → login → apply → see in dashboard → repay.
  * Lender: register → login → fund → see in portfolio/transactions.
  * Admin: login → view users → activate → approve → disburse → check overdue.
* **Accessibility & i18n**: aria attributes, keyboard nav, message catalogs.
* **Production hardening**: rate limits, security headers, content-disposition exposure (already done for downloads if needed).

---

## Quick links (what we added most recently)

* **Lender**

  * Portfolio: `/lender/portfolio`
  * Transactions: `/lender/transactions`

* **Repayments**

  * View & Pay: `/loans/:loanId/repayments`

* **Borrower Risk**

  * Risk Summary: `/borrowers/:borrowerId/risk`

---

If you want, I can convert this into a **living `ROADMAP.md`** with checkboxes and owners, or split into three role‑focused `DONE / TODO` files for the repo.

