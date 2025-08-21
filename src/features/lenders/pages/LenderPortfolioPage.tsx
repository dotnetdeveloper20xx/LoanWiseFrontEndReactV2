import { useQuery } from "@tanstack/react-query";
import { getLenderPortfolio } from "../api/lenders.api";

const money = (n: unknown) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n ?? 0));

export default function LenderPortfolioPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["lender-portfolio"],
    queryFn: getLenderPortfolio,
    staleTime: 60_000,
  });

  if (isLoading) return <div>Loading portfolio…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load portfolio.</div>
        <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
        <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    );
  }

  const totals = data?.totals ?? {};
  const positions = Array.isArray(data?.positions) ? data.positions : [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lender Portfolio</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total Invested</div>
          <div className="text-lg font-semibold">{money(totals.totalInvested)}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total Returns</div>
          <div className="text-lg font-semibold">{money(totals.totalReturns)}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Active Loans</div>
          <div className="text-lg font-semibold">{Number(totals.activeLoans ?? 0)}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Overdue Count</div>
          <div className="text-lg font-semibold">{Number(totals.overdueCount ?? 0)}</div>
        </div>
      </div>

      {/* Positions */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Loan</th>
              <th className="px-3 py-2">Your Amount</th>
              <th className="px-3 py-2">Total Funded</th>
              <th className="px-3 py-2">Purpose</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p: any) => (
              <tr key={String(p.loanId)} className="border-t">
                <td className="px-3 py-2">{String(p.loanId).slice(0, 8)}</td>
                <td className="px-3 py-2">{money(p.amountFundedByYou)}</td>
                <td className="px-3 py-2">{money(p.totalFunded)}</td>
                <td className="px-3 py-2">{p.purpose ?? "-"}</td>
                <td className="px-3 py-2">{p.status ?? "-"}</td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  You have no active positions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
