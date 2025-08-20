// src/features/admin/api/admin.api.ts
import { api } from "../../../shared/lib/axios";

// ---- Types ----
export type SortDir = "asc" | "desc";
export type UserStatus = "Active" | "Suspended" | "Pending" | "Disabled";

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: "Borrower" | "Lender" | "Admin";
  status: UserStatus;
  createdAtUtc: string;
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
  sortBy?: string; // e.g., "createdAt"
  sortDir?: SortDir; // "asc" | "desc"
}

// ---- API calls (raw) ----
// GET /api/admin/users
export async function getUsers(q: GetUsersQuery): Promise<Paginated<AdminUserListItem>> {
  const res = await api.get("/api/admin/users", {
    params: {
      page: q.page ?? 1,
      pageSize: q.pageSize ?? 25,
      search: q.search ?? "",
      sortBy: q.sortBy ?? "createdAt",
      sortDir: q.sortDir ?? "desc",
    },
  });
  // backend uses ApiResponse<T>; unwrap .data.data if envelope, otherwise .data
  const payload = res.data?.data ?? res.data;
  return payload as Paginated<AdminUserListItem>;
}

// PUT /api/admin/users/{id}/status
export async function updateUserStatus(id: string, status: UserStatus): Promise<boolean> {
  const res = await api.put(`/api/admin/users/${id}/status`, { status });
  return (res.data?.data ?? res.data) === true || (res.status >= 200 && res.status < 300);
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
