import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { getOpenLoans, type LoanSummary } from "../api/loans.api";
import { useApproveLoan, useRejectLoan } from "../../admin/hooks/useAdmin";

// ---- helpers ----
const fmt = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const fmtMoney = (n: unknown) => fmt.format(Number(n ?? 0));
const safeNumber = (n: unknown, fallback = 0) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
};

function LoanCard({
  loan,
  isAdmin,
  onApprove,
  onReject,
  pending,
}: {
  loan: LoanSummary;
  isAdmin: boolean;
  onApprove: (loanId: string) => void;
  onReject: (loanId: string, reason: string) => void;
  pending: boolean;
}) {
  const [reason, setReason] = useState("");

  const amount = safeNumber(loan.amount);
  const funded = safeNumber(loan.fundedAmount);
  const duration = safeNumber(loan.durationInMonths);
  const purpose = loan.purpose ?? "-";
  const status = loan.status ?? "-";

  const progress = useMemo(() => {
    if (amount <= 0) return 0;
    return Math.min(100, Math.round((funded / amount) * 100));
  }, [amount, funded]);

  return (
    <div className="card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Loan #{String(loan.loanId ?? "").slice(0, 8)}</h3>
        <span className="text-xs rounded-full px-2 py-1 border border-black/10">{status}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-300">Amount</div>
          <div className="font-medium">{fmtMoney(amount)}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-300">Funded</div>
          <div className="font-medium">{fmtMoney(funded)}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-300">Duration</div>
          <div className="font-medium">{duration > 0 ? `${duration} months` : "-"}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-300">Purpose</div>
          <div className="font-medium">{purpose}</div>
        </div>
      </div>

      <div>
        <div className="h-2 w-full bg-black/10 rounded-md overflow-hidden">
          <div
            className="h-full bg-brand"
            style={{ width: `${progress}%` }}
            aria-label={`Funded ${progress}%`}
          />
        </div>
        <div className="text-xs mt-1 text-gray-500 dark:text-gray-300">{progress}% funded</div>
      </div>

      {/* Lender action (coming soon) */}
      <button className="btn w-full" disabled>
        Fund (coming soon)
      </button>

      {/* Admin actions */}
      {isAdmin && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <div className="flex gap-2">
            <button
              className="btn btn-success"
              onClick={() => onApprove(String(loan.loanId))}
              disabled={pending}
            >
              {pending ? "Approving…" : "Approve"}
            </button>
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Rejection reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button
              className="btn btn-error"
              onClick={() => onReject(String(loan.loanId), reason)}
              disabled={!reason || pending}
            >
              {pending ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpenLoansPage() {
  const role = useSelector((s: RootState) => s.auth.profile?.role ?? null);
  const isAdmin = role === "Admin";

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["open-loans"],
    queryFn: getOpenLoans,
    staleTime: 60_000, // 1 minute
  });

  const approve = useApproveLoan();
  const reject = useRejectLoan();

  if (isLoading) return <div>Loading open loans…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load open loans.</div>
        <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
        <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    );
  }

  const loans = Array.isArray(data) ? data : [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Open Loans</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="card p-6 text-sm text-gray-600 dark:text-gray-300">
          No open loans right now.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard
              key={String(loan.loanId)}
              loan={loan}
              isAdmin={isAdmin}
              pending={approve.isPending || reject.isPending}
              onApprove={(loanId) => approve.mutate(loanId)}
              onReject={(loanId, reason) => reject.mutate({ loanId, reason })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
