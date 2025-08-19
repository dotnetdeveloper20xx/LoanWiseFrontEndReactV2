import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuthApi";

export default function LoginPage() {
  const nav = useNavigate();
  const login = useLogin();

  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("P@ssw0rd!");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login.mutateAsync({ email, password });
    nav("/me");
  }

  return (
    <div className="max-w-sm mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
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
      <p className="text-sm mt-3">
        No account?{" "}
        <Link className="underline" to="/register">
          Register
        </Link>
      </p>
      {login.isError && (
        <p className="text-red-600 text-sm mt-2">
          {(login.error as any)?.message ?? "Login failed"}
        </p>
      )}
    </div>
  );
}
