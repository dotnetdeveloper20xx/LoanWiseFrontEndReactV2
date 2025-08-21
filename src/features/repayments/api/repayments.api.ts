import { api } from "../../../shared/lib/axios";

/** GET /api/loans/{loanId}/repayments → ApiResponse<Repayment[]> */
export async function getRepayments(loanId: string) {
  const res = await api.get(`/api/loans/${loanId}/repayments`);
  return res.data?.data ?? res.data ?? [];
}

/** POST /api/repayments/{repaymentId}/pay → ApiResponse<Guid|bool> */
export async function makeRepayment(repaymentId: string) {
  const res = await api.post(`/api/repayments/${repaymentId}/pay`);
  const payload = res.data?.data ?? res.data;
  return payload ?? true;
}
