// src/features/auth/api/auth.api.ts
import { api } from "../../../shared/lib/axios";

/** Types */
export type Role = "Borrower" | "Lender" | "Admin";
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
}

export interface NormalizedLogin {
  token: string;
  tokenExpiresAtUtc: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAtUtc: string | null;
  profile: Profile | null; // may be null when login returns only a token
}

/** Helpers */
function normalizeProfile(src: any): Profile {
  const p = src ?? {};
  return {
    id: String(p.id ?? p.userId ?? ""),
    fullName: String(p.fullName ?? p.name ?? ""),
    email: String(p.email ?? ""),
    role: (p.role ?? "Borrower") as Role,
  };
}

/** API calls */
export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}): Promise<string> {
  const res = await api.post<ApiEnvelope<string>>("/api/auth/register", {
    registration: input,
  });
  return res.data.data;
}

/**
 * Supports both shapes:
 * - { success, data: "<JWT>" }
 * - { success, data: { token, tokenExpiresAtUtc?, refreshToken?, profile? } }
 */
export async function loginUser(email: string, password: string): Promise<NormalizedLogin> {
  const res = await api.post<ApiEnvelope<any>>("/api/auth/login", { login: { email, password } });
  const d = res.data?.data;

  if (typeof d === "string") {
    return {
      token: d,
      tokenExpiresAtUtc: null,
      refreshToken: null,
      refreshTokenExpiresAtUtc: null,
      profile: null, // fetch /me after this
    };
  }

  const token: string | undefined = d?.token;
  if (!token) throw new Error("Token missing in login response");

  return {
    token,
    tokenExpiresAtUtc: d.tokenExpiresAtUtc ?? null,
    refreshToken: d.refreshToken ?? null,
    refreshTokenExpiresAtUtc: d.refreshTokenExpiresAtUtc ?? null,
    profile: d.profile ? normalizeProfile(d.profile) : null,
  };
}

export async function refreshTokens(refreshToken: string): Promise<{
  token: string;
  tokenExpiresAtUtc: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAtUtc: string | null;
}> {
  const res = await api.post<ApiEnvelope<any>>("/api/auth/refresh", { refreshToken });
  const d = res.data?.data;
  if (typeof d === "string") {
    return {
      token: d,
      tokenExpiresAtUtc: null,
      refreshToken: null,
      refreshTokenExpiresAtUtc: null,
    };
  }
  return {
    token: d.token as string,
    tokenExpiresAtUtc: d.tokenExpiresAtUtc ?? null,
    refreshToken: d.refreshToken ?? null,
    refreshTokenExpiresAtUtc: d.refreshTokenExpiresAtUtc ?? null,
  };
}

/** Named export REQUIRED by your imports */
export async function getMe(): Promise<Profile> {
  const res = await api.get<ApiEnvelope<any>>("/api/users/me");
  return normalizeProfile(res.data.data);
}
