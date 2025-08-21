import { api } from "../../../shared/lib/axios";

/** GET /api/lenders/portfolio → ApiResponse<{ totals, positions[] }> */
export async function getLenderPortfolio() {
  const res = await api.get("/api/lenders/portfolio");
  return res.data?.data ?? res.data ?? {};
}

/** GET /api/lenders/transactions?from=&to=&loanId=&borrowerId=&page=&pageSize= → ApiResponse<{ total, items[] }> */
export async function getLenderTransactions(params: {
  from?: string; // ISO date (yyyy-mm-dd) or ISO instant
  to?: string; // ISO date
  loanId?: string;
  borrowerId?: string;
  page?: number;
  pageSize?: number;
}) {
  const res = await api.get("/api/lenders/transactions", {
    params: {
      from: params.from ?? undefined,
      to: params.to ?? undefined,
      loanId: params.loanId ?? undefined,
      borrowerId: params.borrowerId ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 25,
    },
  });
  return res.data?.data ?? res.data ?? { total: 0, items: [] };
}
