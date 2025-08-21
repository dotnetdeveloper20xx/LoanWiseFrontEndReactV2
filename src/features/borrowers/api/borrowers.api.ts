import { api } from "../../../shared/lib/axios";

/** GET /api/borrowers/{borrowerId}/risk-summary → ApiResponse<RiskSummary> */
export async function getRiskSummary(borrowerId: string) {
  const res = await api.get(`/api/borrowers/${borrowerId}/risk-summary`);
  return res.data?.data ?? res.data ?? {};
}
