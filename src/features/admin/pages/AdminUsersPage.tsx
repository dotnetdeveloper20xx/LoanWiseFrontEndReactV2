// src/features/admin/pages/AdminUsersPage.tsx
import { useMemo, useState } from "react";
import { useAdminUsers, useUpdateUserStatus } from "../hooks/useAdmin";
import type { GetUsersQuery } from "../api/admin.api";

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
} as const;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<GetUsersQuery["sortBy"]>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // IMPORTANT: isActive omitted => include ALL (active + inactive)
  const query = useMemo<GetUsersQuery>(
    () => ({ page, pageSize, search, sortBy, sortDir }),
    [page, pageSize, search, sortBy, sortDir]
  );

  const { data, isLoading } = useAdminUsers(query);
  const update = useUpdateUserStatus();

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search name/email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="border rounded px-3 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as GetUsersQuery["sortBy"])}
        >
          <option value="createdAt">Created</option>
          <option value="fullName">Name</option>
          <option value="email">Email</option>
          <option value="role">Role</option>
          <option value="status">Status</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <div className="ml-auto text-sm text-gray-600">
          {isLoading ? "Loading…" : `${total} result(s)`}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => {
              const isActive = !!u.isActive;
              const statusLabel = isActive ? STATUS_LABELS.active : STATUS_LABELS.inactive;
              return (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 text-center">{u.role}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`inline-block rounded px-2 py-1 ${
                        isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleString() : "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select
                      className="border rounded px-2 py-1"
                      value={isActive ? "Active" : "Inactive"}
                      onChange={(e) => {
                        const next = e.target.value === "Active";
                        update.mutate({ id: u.id, isActive: next });
                      }}
                      disabled={update.isPending}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && !isLoading && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                  No users found.
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
            disabled={page <= 1 || isLoading}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages || isLoading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
