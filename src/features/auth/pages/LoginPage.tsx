// src/features/auth/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuthApi";

function mapLoginError(e: any): string {
  const msg = e?.response?.data?.message?.toString().toLowerCase() ?? "";
  if (msg.includes("not found") || msg.includes("no user"))
    return "Account doesn’t exist. Please register.";
  if (msg.includes("inactive") || msg.includes("not active") || msg.includes("not approved"))
    return "Your account is not active. An admin needs to approve it. Please contact admin staff.";
  return e?.message ?? "Login failed";
}

export default function LoginPage() {
  const nav = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      nav("/me");
    } catch (err) {
      // handled by UI below
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-sm card p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
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
          <button className="btn w-full" type="submit" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="text-sm mt-3 text-center">
          No account?{" "}
          <Link className="underline" to="/register">
            Register
          </Link>
        </p>
        {login.isError && (
          <p className="text-red-600 text-sm mt-2 text-center">{mapLoginError(login.error)}</p>
        )}
      </div>
    </div>
  );
}
