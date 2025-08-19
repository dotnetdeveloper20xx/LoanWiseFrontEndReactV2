import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/api";
import type { LoginResponse, RegisterRequest, Profile } from "../model/auth.types";

// POST /api/auth/register -> ApiResponse<string> (userId)
export async function registerUser(input: RegisterRequest): Promise<string> {
  const res = await api.post<ApiResponse<string>>("/api/auth/register", {
    registration: input,
  });
  return res.data.data;
}

// POST /api/auth/login -> ApiResponse<LoginResponse>
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<LoginResponse>>("/api/auth/login", {
    login: { email, password },
  });
  return res.data.data;
}

// POST /api/auth/refresh -> ApiResponse<{ token, tokenExpiresAtUtc, ... }>
export async function refreshToken(refreshToken: string): Promise<{
  token: string;
  tokenExpiresAtUtc: string;
  refreshToken?: string;
  refreshTokenExpiresAtUtc?: string;
}> {
  const res = await api.post<
    ApiResponse<{
      token: string;
      tokenExpiresAtUtc: string;
      refreshToken?: string;
      refreshTokenExpiresAtUtc?: string;
    }>
  >("/api/auth/refresh", { refreshToken });
  return res.data.data;
}

// GET /api/users/me -> ApiResponse<Profile>
export async function getMe(): Promise<Profile> {
  const res = await api.get<ApiResponse<Profile>>("/api/users/me");
  return res.data.data;
}
