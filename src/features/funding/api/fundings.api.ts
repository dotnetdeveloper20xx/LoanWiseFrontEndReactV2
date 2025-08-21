import { api } from "../../../shared/lib/axios";

export async function fundLoan(loanId: string, amount: number) {
  const res = await api.post(`/api/fundings/${loanId}`, { amount });
  return res.data?.data ?? res.data;
}
