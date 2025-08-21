import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRiskSummary } from "../api/borrowers.api";

export default function BorrowerRiskPage() {
  const [borrowerId, setBorrowerId] = useState<string>("");

  const canFetch = borrowerId.trim().length > 0;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["risk-summary", borrowerId],
    queryFn: () => getRiskSummary(borrowerId),
    enabled: canFetch,
    staleTime: 60_000,
  });

  return (
    <section className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-semibold">Borrower Risk Summary</h1>

      <div className="card p-4 flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Borrower Id (GUID)"
          value={borrowerId}
          onChange={(e) => setBorrowerId(e.target.value)}
        />
        <button
          className="btn"
          onClick={() => canFetch && refetch()}
          disabled={!canFetch || isFetching}
        >
          {isFetching ? "Loading…" : "Load"}
        </button>
      </div>

      {!canFetch ? (
        <div className="text-sm text-gray-600">Enter a Borrower Id to view risk summary.</div>
      ) : isLoading ? (
        <div>Loading risk…</div>
      ) : isError ? (
        <div className="card p-4 text-red-700">
          {(error as any)?.message ?? "Failed to load risk"}
        </div>
      ) : (
        data && (
          <div className="card p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm text-gray-500">Borrower</div>
                <div className="font-medium">{String(data.borrowerId ?? "").slice(0, 8)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Credit Score</div>
                <div className="font-medium">{data.creditScore ?? "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Risk Tier</div>
                <div className="font-medium">{data.riskTier ?? "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">KYC Status</div>
                <div className="font-medium">{data.kycStatus ?? "-"}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Flags</div>
              <ul className="list-disc list-inside">
                {(data.flags ?? []).map((f: string, i: number) => (
                  <li key={`${f}-${i}`}>{f}</li>
                ))}
                {(data.flags ?? []).length === 0 && <li className="text-gray-500">None</li>}
              </ul>
            </div>

            <div className="text-xs text-gray-500">
              Generated:{" "}
              {data.generatedAtUtc ? new Date(data.generatedAtUtc).toLocaleString() : "-"}
            </div>
          </div>
        )
      )}
    </section>
  );
}
