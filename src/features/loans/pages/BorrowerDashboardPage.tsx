import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getBorrowerHistory } from "../api/loans.api";

const money = (n: unknown) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n ?? 0));

export default function BorrowerDashboardPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["borrower-history", page, pageSize],
    queryFn: () => getBorrowerHistory({ page, pageSize }),
    keepPreviousData: true,
    staleTime: 60_000,
  });

  // support both {total, items} and flat array
  const flat = Array.isArray(data) ? data : null;
  const total = flat ? flat.length : Number(data?.total ?? 0);
  const items = flat ?? data?.items ?? [];
  const pages = Math.max(1, Math.ceil((total || items.length) / pageSize));

  if (isLoading) return <div>Loading dashboard…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load history.</div>
        <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
        <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Loans — Dashboard</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Loan</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Funded</th>
              <th className="px-3 py-2">Purpose</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Approved</th>
              <th className="px-3 py-2">Disbursed</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x: any) => (
              <tr key={x.loanId} className="border-t">
                <td className="px-3 py-2">{String(x.loanId).slice(0, 8)}</td>
                <td className="px-3 py-2">{money(x.loanAmount ?? x.amount)}</td>
                <td className="px-3 py-2">{money(x.totalFunded ?? 0)}</td>
                <td className="px-3 py-2">{x.purpose ?? "-"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-2 py-1 ${
                      String(x.status ?? "").toLowerCase() === "disbursed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {x.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {x.createdAtUtc ? new Date(x.createdAtUtc).toLocaleString() : "-"}
                </td>
                <td className="px-3 py-2">
                  {x.approvedAtUtc ? new Date(x.approvedAtUtc).toLocaleString() : "-"}
                </td>
                <td className="px-3 py-2">
                  {x.disbursedAtUtc ? new Date(x.disbursedAtUtc).toLocaleString() : "-"}
                </td>
                <td className="px-3 py-2">
                  <Link to={`/loans/${x.loanId}/repayments`} className="btn">
                    Repayments
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-gray-500">
                  No loans found for your account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!flat && (
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
      )}
    </section>
  );
}
