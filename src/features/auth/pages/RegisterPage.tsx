import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useAuthApi";

export default function RegisterPage() {
  const nav = useNavigate();
  const reg = useRegister();

  const [fullName, setFullName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("P@ssw0rd!");
  const [role, setRole] = useState<"Borrower" | "Lender">("Lender");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await reg.mutateAsync({ fullName, email, password, role });
    nav("/login");
  }

  return (
    <div className="max-w-sm mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full border rounded-md px-3 py-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
        />
        <input
          className="w-full border rounded-md px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full border rounded-md px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <select
          className="w-full border rounded-md px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="Borrower">Borrower</option>
          <option value="Lender">Lender</option>
        </select>
        <button className="btn w-full" type="submit" disabled={reg.isPending}>
          {reg.isPending ? "Registering..." : "Register"}
        </button>
        {reg.isError && (
          <p className="text-red-600 text-sm">{(reg.error as any)?.message ?? "Error"}</p>
        )}
        {reg.isSuccess && <p className="text-green-600 text-sm">Registered! Redirecting…</p>}
      </form>
    </div>
  );
}
