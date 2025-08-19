import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { ENV } from "./env";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: false,
});

// ---- Authorization header injection ----
let getAccessToken: () => string | null = () => null;
export function attachAuthToken(getter: () => string | null) {
  getAccessToken = getter;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- 401 refresh flow ----
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let getRefreshToken: () => string | null = () => null;
let onTokensUpdated: (
  p: {
    token: string;
    tokenExpiresAtUtc: string;
    refreshToken?: string;
    refreshTokenExpiresAtUtc?: string;
  } | null
) => void = () => {};

export function setupAuthRefresh(options: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokens: (
    p: {
      token: string;
      tokenExpiresAtUtc: string;
      refreshToken?: string;
      refreshTokenExpiresAtUtc?: string;
    } | null
  ) => void;
}) {
  getAccessToken = options.getAccessToken;
  getRefreshToken = options.getRefreshToken;
  onTokensUpdated = options.onTokens;
}

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
      const d = res?.data?.data as {
        token: string;
        tokenExpiresAtUtc: string;
        refreshToken?: string;
        refreshTokenExpiresAtUtc?: string;
      };
      if (d?.token) {
        onTokensUpdated({
          token: d.token,
          tokenExpiresAtUtc: d.tokenExpiresAtUtc,
          refreshToken: d.refreshToken,
          refreshTokenExpiresAtUtc: d.refreshTokenExpiresAtUtc,
        });
        return d.token;
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
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original?._retry) {
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
