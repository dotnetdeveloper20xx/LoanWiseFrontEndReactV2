# LoanWise Frontend (React + TypeScript + Vite)

A production-ready **React frontend** for the LoanWise peer-to-peer loan platform.  
This project is structured and built to demonstrate **senior software engineering practices**, with focus on scalability, maintainability, and clean architecture.

---

## ✨ Stack set used

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

# LoanWise — Project Structure

## Frontend (React + TypeScript + Vite)

```
src/
  app/                        # Core app setup (global wiring)
    store.ts                  # Redux store
    queryClient.ts            # React Query client
    providers.tsx             # Global providers (Redux + Query + Auth refresh)
    RootLayout.tsx            # Layout with NavBar + Outlet
    routes.tsx                # Application routes
    Landing.tsx               # Public landing page

  features/                   # Feature-driven modules
    auth/                     # Authentication
      pages/                  # Login, Register, Me
      api/                    # auth.api.ts
      hooks/                  # useAuthApi.ts
      model/                  # auth.slice.ts (Redux)
    loans/                    # Loans domain
      pages/                  # OpenLoansPage, ApplyLoanPage, BorrowerDashboardPage, LoanRepaymentsPage
      api/                    # loans.api.ts
      model/                  # LoanSummary types, etc.
    lenders/                  # Lender-only domain
      pages/                  # LenderDashboardPage, LenderPortfolioPage, LenderTransactionsPage
      api/                    # lenders.api.ts
    admin/                    # Admin-only domain
      pages/                  # AdminUsersPage, AdminMaintenancePage, AdminAllLoansPage
      hooks/                  # useAdmin hooks (approve, disburse, reject)
    notifications/            # Notifications
      pages/                  # NotificationsPage
      api/                    # notifications.api.ts
    repayments/               # Repayments
      pages/                  # LoanRepaymentsPage
      api/                    # repayments.api.ts
    borrowers/                # Borrower risk
      pages/                  # BorrowerRiskPage
      api/                    # borrowers.api.ts
    metadata/                 # Metadata endpoints
      api/metadata.api.ts

  shared/                     # Reusable components/utilities
    components/               # NavBar, ProtectedRoute, etc.
    lib/                      # axios.ts (with auth token & refresh interceptors)
    types/                    # Shared type defs

  styles/                     # Styling
    index.css                 # Tailwind base
    tokens.css                # Design tokens
```


## Current Workflow (User Journey)

### Borrower

1. **Register/Login** → role = Borrower (inactive until Admin approves).
2. **Dashboard** → see applied loans with statuses.
3. **Apply Loan** → choose amount/duration/purpose, submit → notification raised.
4. **After Admin Approves & Disburses** → repayments generated.
5. **Repayments Page** → pay installments, overdue clearly shown.
6. **Notifications** → receive updates (funding, approvals, disbursements, repayments).

### Lender

1. **Register/Login** → role = Lender (inactive until Admin approves).
2. **Open Loans Page** → see loans open for funding.
3. **Fund Loan** → partial or full amount → notification raised.
4. **Dashboard** → see funded loans, navigate to Repayments for borrower activity.
5. **Portfolio & Transactions** → detailed records of fundings/transactions.

### Admin

1. **Login** → Admin role (seeded user).
2. **All Loans** → approve, disburse, view repayments.
3. **Users** → activate Borrowers/Lenders.
4. **Maintenance** → system tasks.
5. **Reports** → view loans/fundings/repayments.

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


✅ **Done so far**

* End-to-end flows for Auth, Loan Apply, Approve, Fund, Disburse, Repayments, Notifications.
* NavBar routing + role-based dashboards.
* Admin: Approve/Disburse/Repayments pages.
* Borrower: Apply loan, Dashboard, Repayments.
* Lender: Open loans, Dashboard, Repayments view.

🟡 **Next on the list**

* In-app **toast notifications** (bottom-right).
* **Unread count pill** in NavBar for notifications.
* **Export PDF receipts** for repayments/loan agreements.
* **Admin dashboards** (stats, overdue monitoring).
* Polish UI/UX (loading states, error banners, success toasts).





