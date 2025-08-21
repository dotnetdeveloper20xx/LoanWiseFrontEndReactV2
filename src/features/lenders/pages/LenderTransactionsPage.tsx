import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLenderTransactions } from "../api/lenders.api";

const money = (n: unknown) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n ?? 0));

export default function LenderTransactionsPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loanId, setLoanId] = useState<string>("");
  const [borrowerId, setBorrowerId] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const params = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      loanId: loanId || undefined,
      borrowerId: borrowerId || undefined,
      page,
      pageSize,
    }),
    [from, to, loanId, borrowerId, page]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["lender-transactions", params],
    queryFn: () => getLenderTransactions(params),
    keepPreviousData: true,
    staleTime: 60_000,
  });

  if (isLoading) return <div>Loading transactions…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load transactions.</div>
        <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
        <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    );
  }

  const total = Number(data?.total ?? 0);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lender Transactions</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-sm">From (YYYY-MM-DD)</span>
          <input
            className="border rounded w-full px-3 py-2"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="block">
          <span className="text-sm">To (YYYY-MM-DD)</span>
          <input
            className="border rounded w-full px-3 py-2"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="block">
          <span className="text-sm">Loan Id</span>
          <input
            className="border rounded w-full px-3 py-2"
            value={loanId}
            onChange={(e) => {
              setLoanId(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="block">
          <span className="text-sm">Borrower Id</span>
          <input
            className="border rounded w-full px-3 py-2"
            value={borrowerId}
            onChange={(e) => {
              setBorrowerId(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Loan</th>
              <th className="px-3 py-2">Borrower</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t: any, idx: number) => (
              <tr key={`${t.id ?? idx}`} className="border-t">
                <td className="px-3 py-2">
                  {t.occurredAtUtc ? new Date(t.occurredAtUtc).toLocaleString() : "-"}
                </td>
                <td className="px-3 py-2">{t.loanId ? String(t.loanId).slice(0, 8) : "-"}</td>
                <td className="px-3 py-2">
                  {t.borrowerId ? String(t.borrowerId).slice(0, 8) : "-"}
                </td>
                <td className="px-3 py-2">{t.type ?? "-"}</td>
                <td className="px-3 py-2">{money(t.amount)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} / {pages}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
