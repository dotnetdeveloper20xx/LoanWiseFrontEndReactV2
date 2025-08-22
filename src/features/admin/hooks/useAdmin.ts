// src/features/admin/hooks/useAdmin.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disburseLoan } from "../../loans/api/loans.api";

import {
  approveLoan,
  checkOverdueRepayments,
  getUsers,
  rejectLoan,
  updateUserStatus,
} from "../api/admin.api";

/**
 * List admin users with caching + keepPreviousData for smooth paging.
 * @param {{ page?: number, pageSize?: number, search?: string, role?: string, isActive?: boolean|null, sortBy?: string, sortDir?: "asc"|"desc" }} q
 */
export function useAdminUsers(q) {
  return useQuery({
    queryKey: ["admin-users", q],
    queryFn: () => getUsers(q),
    keepPreviousData: true,
  });
}

/**
 * Update user status and invalidate the users list.
 * Call: mutate({ id, isActive })
 */
export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

/** Approve a loan by id. Call: mutate(loanId) */
export function useApproveLoan() {
  return useMutation({
    mutationFn: (loanId) => approveLoan(loanId),
  });
}

/** Reject a loan with reason. Call: mutate({ loanId, reason }) */
export function useRejectLoan() {
  return useMutation({
    mutationFn: ({ loanId, reason }) => rejectLoan(loanId, reason),
  });
}

/** Run overdue repayment check. Call: mutate() */
export function useCheckOverdueRepayments() {
  return useMutation({
    mutationFn: () => checkOverdueRepayments(),
  });
}

export function useDisburseLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (loanId: string) => disburseLoan(loanId),
    onSuccess: () => {
      // refresh admin lists & open loans so UI reflects the new status + generated schedule
      qc.invalidateQueries({ queryKey: ["admin-all-loans"] });
      qc.invalidateQueries({ queryKey: ["open-loans"] });
    },
  });
}
