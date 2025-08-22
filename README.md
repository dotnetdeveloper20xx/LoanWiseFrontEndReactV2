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

Here’s a clear, end‑to‑end picture of the app from a **user’s** point of view—what’s live today, and what’s next to ship.

---

# How the app works (user workflow)

## 0) Entry: Auth & Identity

* **Landing → Login/Register**

  * If not authenticated, users land on **/login** (centered form).
  * **Register** supports Borrower or Lender.
  * After login we hydrate the profile (`/api/users/me`) and route by role.
  * Back‑end:

    * `POST /api/auth/register` → create account
    * `POST /api/auth/login` → returns JWT + profile
    * `GET /api/users/me` → current user profile

* **Account states**

  * If credentials are wrong or account is missing, the UI shows **“Account doesn’t exist. Please register.”**
  * If the user is created but **inactive**, the UI shows **“An admin must approve this account.”** (Admin later toggles status on `/admin/users`).

---

## 1) Borrower Journey

### A) Apply for a loan

* Page: **/borrower/apply**
* User fills **Amount / Duration / Purpose** (Purpose comes from Metadata).
* On Submit:

  * We call `POST /api/loans/apply`.
  * Show toast **“Application submitted — LoanId: …”** and clear form.
* Back‑end:

  * `GET /api/metadata/purposes` (dropdown)
  * `POST /api/loans/apply` → creates loan application

### B) See my loans & status (Dashboard)

* Page: **/dashboard**
* We load **your loans** and show status (e.g., Open/Approved/Funded/Disbursed).
* Each row includes a **Repayments** button that links to **/loans/\:loanId/repayments**.
* Back‑end:

  * `GET /api/loans/my` → loans for current borrower

### C) Repayments (view & pay)

* Page: **/loans/\:loanId/repayments**
* Shows full schedule: **amount, due date, status** (Scheduled/Paid/**Overdue**).
* Borrower can **Pay** unpaid installments (Admin can record payments too; Lender is read‑only).
* Back‑end:

  * `GET /api/loans/{loanId}/repayments` → repayment schedule list
  * `POST /api/repayments/{repaymentId}/pay` → mark installment paid

---

## 2) Lender Journey

### A) Discover open loans & fund

* Page: **/open-loans**
* Lender sees open loans; can enter an amount and **Fund**.
* On success we show toast **“Funding applied — admin will review”** and refresh.
* Back‑end:

  * `GET /api/loans/open` → open loans to fund
  * `POST /api/fundings/{loanId}` → apply funding

### B) My funded loans (dashboard)

* Page: **/lender/dashboard**
* List of loans the lender has funded, with a **Repayments** button to view the borrower’s schedule (read‑only for lender).
* Back‑end:

  * `GET /api/fundings/my` → lender portfolio (per loan funded)

### C) Portfolio & Transactions

* Pages: **/lender/portfolio**, **/lender/transactions**
* Portfolio shows totals/positions; Transactions supports filters & paging.
* Back‑end:

  * `GET /api/lenders/portfolio` → portfolio totals & positions
  * `GET /api/lenders/transactions?from=&to=&loanId=&borrowerId=&page=&pageSize=`

---

## 3) Admin Journey

### A) User management

* Page: **/admin/users**
* Admin can see **all users** (active + inactive) and set **Active/Inactive**.
* Back‑end:

  * `GET /api/admin/users` (paginated; filters/sorting)
  * `PUT /api/admin/users/{id}/status` → set IsActive

### B) Loans control

* Page: **/admin/all-loans**
* Shows all loans with **Approve**, **Disburse**, and **Repayments** actions:

  * **Approve** moves from Approved/Open toward Funded (workflow dependent).
  * **Disburse** — when fully funded — triggers **repayment schedule generation**.
  * **Repayments** → view schedule (read‑only).
* Back‑end:

  * `GET /api/admin/reports/loans` → admin report list
  * `POST /api/admin/loans/{loanId}/approve` / `…/reject`
  * `POST /api/loans/{loanId}/disburse` → disburse & create schedule
  * `GET /api/loans/{loanId}/repayments` → schedule view

### C) Maintenance & overdue

* Page: **/admin/maintenance**
* Admin can run **Overdue check** to flag past‑due installments.
* Back‑end:

  * `POST /api/admin/repayments/check-overdue` → marks overdue entries

---

## 4) Notifications (all roles)

* Page: **/notifications** (+ unread pill in navbar)
* Shows list of system notifications with **Mark read**.
* Also surfaced via **bottom‑right toasts** (e.g., funding applied, application submitted, loan approved/disbursed).
* Back‑end:

  * `GET /api/notifications` → list your notifications
  * `PUT /api/notifications/{id}/read` → mark one read

---

# What’s live today

* **Auth**: login/register; profile hydration (`/me`).
* **Role‑aware routing**: Borrower / Lender / Admin, with protected routes and 403 screen on mismatch.
* **Borrower**:

  * Apply loan (Purpose dropdown via metadata), toast on success; form clears.
  * Dashboard shows loans with status + **Repayments** link.
  * Repayments page: full schedule (+ overdue), **Pay** button for unpaid installments.
* **Lender**:

  * Open Loans page with **Fund**; toast on success + refresh.
  * Lender Dashboard shows funded loans + **Repayments** link (read‑only).
  * Portfolio & Transactions pages.
* **Admin**:

  * Users list (all users), toggle Active/Inactive.
  * All Loans list: **Approve**, **Disburse**, **Repayments** (read‑only).
  * Overdue check.
* **Notifications**:

  * Page with **Mark read**; unread **pill** in navbar; bottom‑right toasts for key actions.

All these call the documented endpoints and standard `ApiResponse<T>` envelope (success/message/data) as per integration guide.

---

# What’s next (shortlist)

## A) UX polish & resilience

* **Global toaster** already implemented — extend to include deep links (e.g., “View Repayments”).
* **Empty states & skeletons** across lists (Dashboard, Open Loans, All Loans).
* **Inline validation** (Apply Loan / Fund amounts min/max based on business rules).

## B) Borrower experience

* **My current application widget** on dashboard (if a loan is “in progress”).
* **Document upload** (KYC, agreements) and **PDF receipts** for repayments.
* **Export statements** (CSV/PDF).

## C) Lender experience

* **Cancel/adjust funding** (if your policy allows; else a support request workflow).
* **Returns & yield (IRR)** breakdown; filter by period/loan.
* **Export transactions** (CSV) endpoint to complement `/lenders/transactions`.

## D) Admin & Ops

* **Audit trail** (who approved/disbursed/rejected and when).
* **Admin dashboard** KPIs (open/approved/funded/disbursed/overdue trends).
* **Bulk operations** (approve/disburse batches) if permitted.
* **Config UI** for Metadata (purposes, risk levels) that currently power dropdowns.

## E) Platform & quality

* **E2E tests** covering the golden paths:

  * Borrower: register → login → apply → dashboard → repayments → pay.
  * Lender: register → login → fund → dashboard → repayments.
  * Admin: login → users (activate) → all loans (approve → disburse) → repayments → overdue check.
* **Better error boundary** (consistent error page with “retry” & diagnostics).
* **Performance**: request batching/caching (React Query) & pagination for large lists.
* **Access enforcement in BE handlers**:

  * Borrower can only view/pay their own loan.
  * Lender can only view loans they funded.
  * Admin can view all.
   

---





