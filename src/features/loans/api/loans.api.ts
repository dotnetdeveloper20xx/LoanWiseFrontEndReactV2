import { api } from "../../../shared/lib/axios";


export interface LoanSummary {
  loanId: string;
  borrowerId: string;
  amount: number;
  fundedAmount: number;
  durationInMonths: number;
  purpose: string; // e.g., "HomeImprovement"
  status: string; // e.g., "Open"
}

// GET /api/loans/open  → returns { success, message, data: LoanSummary[] }
export async function getOpenLoans(): Promise<LoanSummary[]> {
  const res = await api.get("/api/loans/open");
  return res.data?.data ?? [];
}
