import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useApproveLoan } from "../../admin/hooks/useAdmin";
import { api } from "../../../shared/lib/axios";

async function getAllLoans() {
  const res = await api.get("/api/admin/reports/loans");
  return res.data?.data ?? res.data ?? [];
}

async function disburseLoan(loanId: string) {
  const res = await api.post(`/api/loans/${loanId}/disburse`);
  return res.data?.data ?? res.data;
}

export default function AdminAllLoansPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-all-loans"],
    queryFn: getAllLoans,
    staleTime: 60_000,
  });

  const approve = useApproveLoan();
  const [banner, setBanner] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  if (isLoading) return <div>Loading all loans…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load loans.</div>
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
        <h1 className="text-xl font-semibold">All Loans (Admin)</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
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

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Loan</th>
              <th className="px-3 py-2">Borrower</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Funded</th>
              <th className="px-3 py-2">Purpose</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((x: any) => {
              const status = String(x.status ?? "").toLowerCase();
              const approved = status === "approved" || status === "disbursed";
              const disbursable = status === "approved";

              return (
                <tr key={String(x.loanId)} className="border-t">
                  <td className="px-3 py-2">{String(x.loanId).slice(0, 8)}</td>
                  <td className="px-3 py-2">{x.borrowerName ?? "-"}</td>
                  <td className="px-3 py-2">
                    £{Number(x.amount ?? x.loanAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    £{Number(x.fundedAmount ?? x.totalFunded ?? 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{x.purpose ?? "-"}</td>
                  <td className="px-3 py-2">{x.status}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="btn btn-success"
                      disabled={approve.isPending || approved}
                      onClick={() =>
                        approve.mutate(String(x.loanId), {
                          onSuccess: () => {
                            setBanner({ kind: "success", msg: "Loan approved." });
                            refetch();
                          },
                          onError: (e: any) =>
                            setBanner({ kind: "error", msg: e?.message ?? "Approve failed." }),
                        })
                      }
                      title={approved ? "Already approved/disbursed" : "Approve loan"}
                    >
                      {approved ? "Approved" : approve.isPending ? "Approving…" : "Approve"}
                    </button>

                    <button
                      className="btn"
                      disabled={!disbursable}
                      onClick={async () => {
                        setBanner(null);
                        try {
                          await disburseLoan(String(x.loanId));
                          setBanner({ kind: "success", msg: "Loan disbursed." });
                          refetch();
                        } catch (e: any) {
                          setBanner({ kind: "error", msg: e?.message ?? "Disburse failed." });
                        }
                      }}
                      title={disbursable ? "Disburse loan" : "Disburse available after approval"}
                    >
                      Disburse
                    </button>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
