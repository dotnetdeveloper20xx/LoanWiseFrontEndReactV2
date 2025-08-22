// src/app/providers.tsx
import { Provider } from "react-redux";
import { store } from "./store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useEffect, type ReactNode } from "react";
import { hydrateFromStorage, tokensRefreshed, logout } from "../features/auth/model/auth.slice";
import { attachAuthToken, setupAuthRefresh } from "../shared/lib/axios";
import { ToastProvider } from "../shared/ui/ToastProvider";

/** Global providers + one-time auth wiring (tokens in LS + axios refresh) */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateFromStorage());
    const getToken = () => localStorage.getItem("lw_token");
    const getRefresh = () => localStorage.getItem("lw_refresh");

    attachAuthToken(getToken);
    setupAuthRefresh({
      getAccessToken: getToken,
      getRefreshToken: getRefresh,
      onTokens: async (toks) => {
        if (!toks) {
          await queryClient.clear();
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
        queryClient.invalidateQueries({ queryKey: ["me"] });
      },
    });
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}
