import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getRepayments, makeRepayment } from "../../repayments/api/repayments.api";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

const money = (n: unknown) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n ?? 0));

export default function LoanRepaymentsPage() {
  // ---- get route params and role unconditionally
  const { loanId: loanIdParam } = useParams();
  const loanId = loanIdParam ?? "";
  const role = useSelector((s: RootState) => s.auth.profile?.role ?? null);
  const isBorrower = role === "Borrower";

  // ---- local state hooks (always called)
  const [banner, setBanner] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  // ---- query hook (always called, but guarded via `enabled`)
  const query = useQuery({
    queryKey: ["repayments", loanId],
    queryFn: () => getRepayments(loanId),
    staleTime: 60_000,
    enabled: !!loanId, // don't run until we have an id
  });

  const { data, isLoading, isError, error, refetch, isFetching } = query;

  // ---- derive rows (always call useMemo, based on current data)
  const rows = useMemo(() => {
    const raw = Array.isArray(data) ? data : [];
    // sort: overdue first, then by due date ASC
    const copy = [...raw];
    copy.sort((a: any, b: any) => {
      const aOver = String(a.status ?? "").toLowerCase() === "overdue" ? 1 : 0;
      const bOver = String(b.status ?? "").toLowerCase() === "overdue" ? 1 : 0;
      if (aOver !== bOver) return bOver - aOver;
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return ad - bd;
    });
    return copy;
  }, [data]);

  // ---- render (no early returns before hooks!)
  if (!loanId) {
    return <div className="p-4">LoanId is missing.</div>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Repayments — Loan {String(loanId).slice(0, 8)}</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching || isLoading}>
          {isFetching || isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {banner && (
        <div
          className={`p-3 rounded ${
            banner.kind === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {banner.msg}
        </div>
      )}

      {isLoading ? (
        <div>Loading repayments…</div>
      ) : isError ? (
        <div className="card p-6">
          <div className="text-red-600 font-medium">Failed to load repayments.</div>
          <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
          <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-6 text-sm text-gray-600">No repayments found.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Due Date</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Paid At</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, idx: number) => {
                const statusStr = String(
                  r.status ?? (r.isPaid ? "Paid" : "Scheduled")
                ).toLowerCase();
                const isPaid = statusStr === "paid" || !!r.isPaid;
                const isOverdue = statusStr === "overdue";
                const unpaid = !isPaid;

                const badge = isPaid
                  ? "bg-green-100 text-green-700"
                  : isOverdue
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-200 text-gray-700";

                return (
                  <tr key={String(r.id ?? idx)} className="border-t">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-3 py-2">{money(r.amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded px-2 py-1 ${badge}`}>
                        {r.status ?? (isPaid ? "Paid" : isOverdue ? "Overdue" : "Scheduled")}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.paidAtUtc ? new Date(r.paidAtUtc).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {isBorrower && unpaid ? (
                        <button
                          className="btn"
                          onClick={async () => {
                            setBanner(null);
                            try {
                              await makeRepayment(String(r.id));
                              setBanner({ kind: "success", msg: "Repayment recorded." });
                              refetch();
                            } catch (e: any) {
                              setBanner({ kind: "error", msg: e?.message ?? "Payment failed." });
                            }
                          }}
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
