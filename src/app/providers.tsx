// src/app/providers.tsx
import { Provider } from "react-redux";
import { store } from "./store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useEffect, type ReactNode } from "react";

import {
  hydrateFromStorage,
  tokensRefreshed,
  logout,
} from "../features/auth/model/auth.slice";
import { attachAuthToken, setupAuthRefresh } from "../shared/lib/axios";

/**
 * Global providers + one-time auth wiring (tokens in LS + axios refresh)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 1) Hydrate Redux auth state from LocalStorage (persisted across reloads)
    store.dispatch(hydrateFromStorage());

    // 2) Ensure axios can always read the latest tokens (fresh from LS)
    const getToken = () => localStorage.getItem("lw_token");
    const getRefresh = () => localStorage.getItem("lw_refresh");

    attachAuthToken(getToken);
    setupAuthRefresh({
      getAccessToken: getToken,
      getRefreshToken: getRefresh,
      onTokens: (toks) => {
        if (!toks) {
          store.dispatch(logout());
          return;
        }
        store.dispatch(
          tokensRefreshed({
            token: toks.token,
            tokenExpiresAtUtc: toks.tokenExpiresAtUtc,
            refreshToken: toks.refreshToken ?? null,
            refreshTokenExpiresAtUtc: toks.refreshTokenExpiresAtUtc ?? null,
          })
        );
      },
    });
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
