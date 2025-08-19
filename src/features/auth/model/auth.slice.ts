
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, Profile } from "./auth.types";

const LS_KEYS = {
  token: "lw_token",
  refresh: "lw_refresh",
  tokenExp: "lw_token_expires",
  refreshExp: "lw_refresh_expires",
  profile: "lw_profile",
};

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
        refreshToken: string;
        tokenExpiresAtUtc: string;
        refreshTokenExpiresAtUtc: string;
        profile: Profile;
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
      localStorage.setItem(LS_KEYS.refresh, refreshToken);
      localStorage.setItem(LS_KEYS.tokenExp, tokenExpiresAtUtc);
      localStorage.setItem(LS_KEYS.refreshExp, refreshTokenExpiresAtUtc);
      localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
    },
    tokensRefreshed(
      state,
      action: PayloadAction<{
        token: string;
        tokenExpiresAtUtc: string;
        refreshToken?: string;
        refreshTokenExpiresAtUtc?: string;
      }>
    ) {
      const { token, tokenExpiresAtUtc, refreshToken, refreshTokenExpiresAtUtc } = action.payload;

      state.token = token;
      state.tokenExpiresAtUtc = tokenExpiresAtUtc;
      localStorage.setItem(LS_KEYS.token, token);
      localStorage.setItem(LS_KEYS.tokenExp, tokenExpiresAtUtc);

      if (refreshToken) {
        state.refreshToken = refreshToken;
        state.refreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc ?? null;
        localStorage.setItem(LS_KEYS.refresh, refreshToken);
        if (refreshTokenExpiresAtUtc) {
          localStorage.setItem(LS_KEYS.refreshExp, refreshTokenExpiresAtUtc);
        }
      }
    },
    setProfile(state, action: PayloadAction<Profile>) {
      state.profile = action.payload;
      localStorage.setItem(LS_KEYS.profile, JSON.stringify(action.payload));
    },
    hydrateFromStorage(state) {
      state.token = localStorage.getItem(LS_KEYS.token);
      state.refreshToken = localStorage.getItem(LS_KEYS.refresh);
      state.tokenExpiresAtUtc = localStorage.getItem(LS_KEYS.tokenExp);
      state.refreshTokenExpiresAtUtc = localStorage.getItem(LS_KEYS.refreshExp);
      const p = localStorage.getItem(LS_KEYS.profile);
      state.profile = p ? (JSON.parse(p) as Profile) : null;
    },
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAtUtc = null;
      state.refreshTokenExpiresAtUtc = null;
      state.profile = null;

      localStorage.removeItem(LS_KEYS.token);
      localStorage.removeItem(LS_KEYS.refresh);
      localStorage.removeItem(LS_KEYS.tokenExp);
      localStorage.removeItem(LS_KEYS.refreshExp);
      localStorage.removeItem(LS_KEYS.profile);
    },
  },
});

export const { loginSucceeded, tokensRefreshed, setProfile, hydrateFromStorage, logout } =
  slice.actions;

export default slice.reducer;
