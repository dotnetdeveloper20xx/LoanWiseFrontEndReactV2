import { api } from "../../../shared/lib/axios";

export interface LoanSummary {
  loanId: string;
  borrowerId: string;
  amount: number;
  fundedAmount: number;
  durationInMonths: number;
  purpose: string;
  status: string;
}

// GET /api/loans/open → ApiResponse<LoanSummary[]>
export async function getOpenLoans(): Promise<LoanSummary[]> {
  const res = await api.get("/api/loans/open");
  return res.data?.data ?? [];
}

/** POST /api/loans/apply → ApiResponse<{ loanId: string, ... }> or ApiResponse<Guid> */
export async function applyLoan(payload: {
  amount: number;
  durationInMonths: number;
  purpose: string;
}): Promise<any> {
  const res = await api.post("/api/loans/apply", payload);
  return res.data?.data ?? res.data;
}

/** GET /api/loans/borrowers/history?page=&pageSize= → ApiResponse<{ total, items: [...] }> */
export async function getBorrowerHistory(params: { page?: number; pageSize?: number }) {
  const res = await api.get("/api/loans/borrowers/history", {
    params: { page: params.page ?? 1, pageSize: params.pageSize ?? 25 },
  });
  return res.data?.data ?? res.data;
}

/** POST /api/loans/{loanId}/disburse → ApiResponse<Guid> */
export async function disburseLoan(loanId: string) {
  const res = await api.post(`/api/loans/${loanId}/disburse`);
  return res.data?.data ?? res.data;
}

/** GET /api/loans/{loanId}/repayments → ApiResponse<Repayment[]> */
export async function getRepayments(loanId: string) {
  const res = await api.get(`/api/loans/${loanId}/repayments`);
  return res.data?.data ?? res.data;
}
