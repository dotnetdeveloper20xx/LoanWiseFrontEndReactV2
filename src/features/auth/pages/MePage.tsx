import { useMe } from "../hooks/useAuthApi";


export default function MePage() {
  const { data, isLoading, isError, error } = useMe();

  if (isLoading) return <div>Loading profile…</div>;
  if (isError)
    return <div className="text-red-600">Error: {(error as any)?.message ?? "Failed"}</div>;

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-3">My Profile</h1>
      <div className="space-y-1 text-sm">
        <div>
          <strong>Name:</strong> {data?.fullName}
        </div>
        <div>
          <strong>Email:</strong> {data?.email}
        </div>
        <div>
          <strong>Role:</strong> {data?.role}
        </div>
        {data?.creditScore != null && (
          <div>
            <strong>Credit score:</strong> {data.creditScore}
          </div>
        )}
        {data?.riskTier && (
          <div>
            <strong>Risk tier:</strong> {data.riskTier}
          </div>
        )}
      </div>
    </div>
  );
}
