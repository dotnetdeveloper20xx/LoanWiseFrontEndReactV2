// src/features/admin/pages/AdminMaintenancePage.tsx
import { useState } from "react";
import { useApproveLoan, useRejectLoan, useCheckOverdueRepayments } from "../hooks/useAdmin.ts";

export default function AdminMaintenancePage() {
  const [loanId, setLoanId] = useState("");
  const [reason, setReason] = useState("");

  const approve = useApproveLoan();
  const reject = useRejectLoan();
  const checkOverdue = useCheckOverdueRepayments();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Maintenance</h1>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Approve / Reject Loan</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Loan ID (GUID)"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50"
            onClick={() => approve.mutate(loanId)}
            disabled={!loanId || approve.isPending}
          >
            {approve.isPending ? "Approving…" : "Approve"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Rejection reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            className="bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50"
            onClick={() => reject.mutate({ loanId, reason })}
            disabled={!loanId || !reason || reject.isPending}
          >
            {reject.isPending ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Overdue Repayments</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-2 rounded disabled:opacity-50"
          onClick={() => checkOverdue.mutate()}
          disabled={checkOverdue.isPending}
        >
          {checkOverdue.isPending ? "Checking…" : "Run Overdue Check"}
        </button>

        {typeof checkOverdue.data === "number" && (
          <div className="text-sm text-gray-700">
            Overdue repayments flagged: <strong>{checkOverdue.data}</strong>
          </div>
        )}
      </section>
    </div>
  );
}
