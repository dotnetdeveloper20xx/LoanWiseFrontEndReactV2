// src/features/auth/model/auth.slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, Profile } from "./auth.types";

const LS_KEYS = {
  token: "lw_token",
  refresh: "lw_refresh",
  tokenExp: "lw_token_expires",
  refreshExp: "lw_refresh_expires",
  profile: "lw_profile",
};

// Safe storage helpers
function safeGet(key: string): string | null {
  const raw = localStorage.getItem(key);
  if (!raw || raw === "undefined" || raw === "null" || raw.trim() === "") return null;
  return raw;
}
function safeGetJson<T>(key: string): T | null {
  try {
    const raw = safeGet(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  tokenExpiresAtUtc: null,
  refreshTokenExpiresAtUtc: null,
  profile: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSucceeded(
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string | null;
        tokenExpiresAtUtc: string | null;
        refreshTokenExpiresAtUtc: string | null;
        profile: Profile | null;
      }>
    ) {
      const { token, refreshToken, tokenExpiresAtUtc, refreshTokenExpiresAtUtc, profile } =
        action.payload;

      state.token = token;
      state.refreshToken = refreshToken;
      state.tokenExpiresAtUtc = tokenExpiresAtUtc;
      state.refreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc;
      state.profile = profile;

      localStorage.setItem(LS_KEYS.token, token);
      if (refreshToken) localStorage.setItem(LS_KEYS.refresh, refreshToken);
      if (tokenExpiresAtUtc) localStorage.setItem(LS_KEYS.tokenExp, tokenExpiresAtUtc);
      if (refreshTokenExpiresAtUtc)
        localStorage.setItem(LS_KEYS.refreshExp, refreshTokenExpiresAtUtc);
      if (profile) localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
    },

    tokensRefreshed(
      state,
      action: PayloadAction<{
        token: string;
        tokenExpiresAtUtc: string | null;
        refreshToken: string | null;
        refreshTokenExpiresAtUtc: string | null;
      }>
    ) {
      const { token, tokenExpiresAtUtc, refreshToken, refreshTokenExpiresAtUtc } = action.payload;
      state.token = token;
      state.tokenExpiresAtUtc = tokenExpiresAtUtc;
      state.refreshToken = refreshToken;
      state.refreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc;
      localStorage.setItem(LS_KEYS.token, token);
      if (tokenExpiresAtUtc) localStorage.setItem(LS_KEYS.tokenExp, tokenExpiresAtUtc);
      if (refreshToken) localStorage.setItem(LS_KEYS.refresh, refreshToken);
      if (refreshTokenExpiresAtUtc)
        localStorage.setItem(LS_KEYS.refreshExp, refreshTokenExpiresAtUtc);
    },

    setProfile(state, action: PayloadAction<Profile>) {
      state.profile = action.payload;
      localStorage.setItem(LS_KEYS.profile, JSON.stringify(action.payload));
    },

    hydrateFromStorage(state) {
      state.token = safeGet(LS_KEYS.token);
      state.refreshToken = safeGet(LS_KEYS.refresh);
      state.tokenExpiresAtUtc = safeGet(LS_KEYS.tokenExp);
      state.refreshTokenExpiresAtUtc = safeGet(LS_KEYS.refreshExp);
      state.profile = safeGetJson<Profile>(LS_KEYS.profile);
    },

    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAtUtc = null;
      state.refreshTokenExpiresAtUtc = null;
      state.profile = null;
      Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
    },
  },
});

export const { loginSucceeded, tokensRefreshed, setProfile, hydrateFromStorage, logout } =
  slice.actions;

export default slice.reducer;
