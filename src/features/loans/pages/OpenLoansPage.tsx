import { useQuery } from "@tanstack/react-query";

import { useMemo } from "react";
import { getOpenLoans, type LoanSummary } from "../api/loans.api";

function LoanCard({ loan }: { loan: LoanSummary }) {
  const progress = useMemo(() => {
    if (!loan.amount) return 0;
    return Math.min(100, Math.round((loan.fundedAmount / loan.amount) * 100));
  }, [loan.amount, loan.fundedAmount]);

  return (
    <div className="card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Loan #{loan.loanId.slice(0, 8)}</h3>
        <span className="text-xs rounded-full px-2 py-1 border border-black/10">{loan.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-300">Amount</div>
          <div className="font-medium">£{loan.amount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-300">Funded</div>
          <div className="font-medium">£{loan.fundedAmount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-300">Duration</div>
          <div className="font-medium">{loan.durationInMonths} months</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-300">Purpose</div>
          <div className="font-medium">{loan.purpose}</div>
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

      {/* Placeholder: a Fund button would call POST /api/fundings/{loanId} */}
      <button className="btn w-full" disabled>
        Fund (coming soon)
      </button>
    </div>
  );
}

export default function OpenLoansPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["open-loans"],
    queryFn: getOpenLoans,
    staleTime: 60_000, // 1 minute
  });

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

  const loans = data ?? [];

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
            <LoanCard key={loan.loanId} loan={loan} />
          ))}
        </div>
      )}
    </section>
  );
}
