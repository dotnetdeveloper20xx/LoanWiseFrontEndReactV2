// src/shared/lib/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ENV } from "./env";

/**
 * Single axios instance used across the app.
 * - Base URL from Vite env (ENV.API_BASE_URL)
 * - Authorization header injection
 * - 401 -> refresh token -> retry (single-flight)
 */
export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: false,
});

// ---- Token getters + listeners (wired by AppProviders at startup) ----
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let onTokensUpdated: (p: {
  token: string;
  tokenExpiresAtUtc: string;
  refreshToken?: string;
  refreshTokenExpiresAtUtc?: string;
} | null) => void = () => {};

/** Back-compat: allow older code to just provide an access token getter */
export function attachAuthToken(getter: () => string | null) {
  getAccessToken = getter;
}

/** Preferred: wire both access/refresh getters + a callback to persist fresh tokens */
export function setupAuthRefresh(options: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokens: (
    p:
      | {
          token: string;
          tokenExpiresAtUtc: string;
          refreshToken?: string;
          refreshTokenExpiresAtUtc?: string;
        }
      | null
  ) => void;
}) {
  getAccessToken = options.getAccessToken;
  getRefreshToken = options.getRefreshToken;
  onTokensUpdated = options.onTokens;
}

// ---- Request: inject Authorization if we have a token ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Response: on 401, try refresh ONCE, then retry original request ----
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  const rToken = getRefreshToken?.();
  if (!rToken) {
    isRefreshing = false;
    onTokensUpdated(null);
    return null;
  }

  refreshPromise = api
    .post("/api/auth/refresh", { refreshToken: rToken })
    .then((res) => {
      const data = res?.data?.data as
        | {
            token: string;
            tokenExpiresAtUtc: string;
            refreshToken?: string;
            refreshTokenExpiresAtUtc?: string;
          }
        | undefined;
      if (data?.token) {
        onTokensUpdated({
          token: data.token,
          tokenExpiresAtUtc: data.tokenExpiresAtUtc,
          refreshToken: data.refreshToken,
          refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc,
        });
        return data.token;
      }
      onTokensUpdated(null);
      return null;
    })
    .catch(() => {
      onTokensUpdated(null);
      return null;
    })
    .finally(() => {
      isRefreshing = false;
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
