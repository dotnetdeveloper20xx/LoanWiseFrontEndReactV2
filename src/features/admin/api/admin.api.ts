// src/features/admin/api/admin.api.ts
import { api } from "../../../shared/lib/axios";

// ---- Types ----
export type SortDir = "asc" | "desc";

// Matches backend DTO after camelCase serialization:
// id, fullName, email, role (string), isActive (boolean), createdAtUtc? (optional)
export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: "Borrower" | "Lender" | "Admin";
  isActive: boolean;
  createdAtUtc?: string;
}

export interface Paginated<T> {
  total: number;
  items: T[];
  page: number;
  pageSize: number;
}

export interface GetUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: "Borrower" | "Lender" | "Admin";
  isActive?: boolean | null; // null/undefined => ALL users (active + inactive)
  sortBy?: "createdAt" | "fullName" | "email" | "role" | "status";
  sortDir?: SortDir; // "asc" | "desc"
}

// ---- API calls (raw) ----

// GET /api/admin/users
export async function getUsers(q: GetUsersQuery): Promise<Paginated<AdminUserListItem>> {
  // Only send isActive param if explicitly provided; otherwise include everyone
  const params: Record<string, any> = {
    page: q.page ?? 1,
    pageSize: q.pageSize ?? 25,
    search: q.search ?? "",
    sortBy: q.sortBy ?? "createdAt",
    sortDir: q.sortDir ?? "desc",
  };
  if (q.role) params.role = q.role;
  if (typeof q.isActive === "boolean") params.isActive = q.isActive;

  const res = await api.get("/api/admin/users", { params });
  // backend uses ApiResponse<T>; unwrap .data.data if envelope, otherwise .data
  const payload = res.data?.data ?? res.data;
  return payload as Paginated<AdminUserListItem>;
}

// PUT /api/admin/users/{id}/status
// Backend expects: { isActive: boolean }
export async function updateUserStatus(id: string, isActive: boolean): Promise<boolean> {
  const res = await api.put(`/api/admin/users/${id}/status`, { isActive });
  const ok = res.data?.data ?? res.data;
  return ok === true || (res.status >= 200 && res.status < 300);
}

// POST /api/admin/loans/{loanId}/approve
export async function approveLoan(loanId: string): Promise<boolean> {
  const res = await api.post(`/api/admin/loans/${loanId}/approve`);
  return (res.data?.data ?? res.data) === true || (res.status >= 200 && res.status < 300);
}

// POST /api/admin/loans/{loanId}/reject
export async function rejectLoan(loanId: string, reason: string): Promise<boolean> {
  const res = await api.post(`/api/admin/loans/${loanId}/reject`, { reason });
  return (res.data?.data ?? res.data) === true || (res.status >= 200 && res.status < 300);
}

// POST /api/admin/repayments/check-overdue
export async function checkOverdueRepayments(): Promise<number> {
  const res = await api.post(`/api/admin/repayments/check-overdue`);
  // ApiResponse<int> → unwrap
  const payload = res.data?.data ?? res.data;
  return Number(payload ?? 0);
}
