// src/features/lenders/pages/LenderDashboardPage.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/lib/axios";

async function getMyFundings() {
  const res = await api.get("/api/fundings/my");
  const payload = res.data?.data ?? res.data ?? [];
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
}

export default function LenderDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["lender-my-fundings"],
    queryFn: getMyFundings,
    staleTime: 60_000,
  });

  if (isLoading) return <div>Loading your funded loans…</div>;
  if (isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load your fundings.</div>
        <div className="text-sm text-gray-500 mt-1">{(error as any)?.message ?? "Error"}</div>
        <button className="btn mt-3" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    );
  }

  const items = Array.isArray(data) ? data : [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Funded Loans</h1>
        <button className="btn" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Loan</th>
              <th className="px-3 py-2">Loan Amount</th>
              <th className="px-3 py-2">Total Funded</th>
              <th className="px-3 py-2">Your Amount</th>
              <th className="px-3 py-2">Purpose</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x: any) => (
              <tr key={String(x.loanId)} className="border-t">
                <td className="px-3 py-2">{String(x.loanId).slice(0, 8)}</td>
                <td className="px-3 py-2">£{Number(x.loanAmount ?? 0).toLocaleString()}</td>
                <td className="px-3 py-2">£{Number(x.totalFunded ?? 0).toLocaleString()}</td>
                <td className="px-3 py-2">£{Number(x.amountFundedByYou ?? 0).toLocaleString()}</td>
                <td className="px-3 py-2">{x.purpose ?? "-"}</td>
                <td className="px-3 py-2">{x.status ?? "-"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  You haven’t funded any loans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
