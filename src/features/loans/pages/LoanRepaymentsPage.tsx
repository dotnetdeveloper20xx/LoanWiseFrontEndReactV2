import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getRepayments as getR } from "../api/loans.api"; // also available here if you prefer
import { getRepayments, makeRepayment } from "../../repayments/api/repayments.api";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

const money = (n: unknown) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n ?? 0));

export default function LoanRepaymentsPage() {
  const { loanId = "" } = useParams();
  const role = useSelector((s: RootState) => s.auth.profile?.role ?? null);
  const isBorrower = role === "Borrower";

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["repayments", loanId],
    queryFn: () => getRepayments(loanId),
    staleTime: 60_000,
  });

  const [banner, setBanner] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  if (!loanId) return <div className="p-4">LoanId is missing.</div>;
  if (isLoading) return <div>Loading repayments…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load repayments.</div>
        <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
        <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Repayments — Loan {String(loanId).slice(0, 8)}</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {banner && (
        <div
          className={`p-3 rounded ${banner.kind === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {banner.msg}
        </div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Due Date</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Paid At</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, idx: number) => {
              const unpaid = !(r.isPaid || String(r.status ?? "").toLowerCase() === "paid");
              return (
                <tr key={String(r.id ?? idx)} className="border-t">
                  <td className="px-3 py-2">
                    {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-2">{money(r.amount)}</td>
                  <td className="px-3 py-2">{r.status ?? (r.isPaid ? "Paid" : "Scheduled")}</td>
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  No repayments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
