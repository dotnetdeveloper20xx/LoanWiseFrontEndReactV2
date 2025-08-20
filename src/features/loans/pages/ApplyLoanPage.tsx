// src/features/loans/pages/ApplyLoanPage.tsx
import { useState } from "react";
import { applyLoan } from "../api/loans.api";

export default function ApplyLoanPage() {
  const [amount, setAmount] = useState<number>(10000);
  const [duration, setDuration] = useState<number>(12);
  const [purpose, setPurpose] = useState<string>("HomeImprovement");
  const [isSubmitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const data = await applyLoan({
        amount,
        durationInMonths: duration,
        purpose,
      });
      setResult(data);
    } catch (ex: any) {
      setErr(ex?.message ?? "Failed to apply for loan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Apply for a Loan</h1>

      <form onSubmit={onSubmit} className="space-y-3 card p-4">
        <label className="block">
          <span className="text-sm">Amount (£)</span>
          <input
            type="number"
            min={1000}
            step={100}
            className="border rounded w-full px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-sm">Duration (months)</span>
          <input
            type="number"
            min={3}
            step={1}
            className="border rounded w-full px-3 py-2"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-sm">Purpose</span>
          <input
            className="border rounded w-full px-3 py-2"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </label>

        <button className="btn w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit Application"}
        </button>

        {err && <p className="text-red-600 text-sm">{err}</p>}
      </form>

      {result && (
        <div className="card p-4 text-sm">
          <h2 className="font-medium mb-2">Application Submitted</h2>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
