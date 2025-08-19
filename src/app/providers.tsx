// src/app/providers.tsx
import { Provider } from "react-redux";
import { store } from "./store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// If you HAVE alias @ → src:
import { hydrateFromStorage, tokensRefreshed, logout } from "../features/auth/model/auth.slice";
import { attachAuthToken, setupAuthRefresh } from "../shared/lib/axios";
import { useEffect, type ReactNode } from "react";
// If you DON'T have alias yet, use these relative imports instead:
// import { hydrateFromStorage, tokensRefreshed, logout } from "../features/auth/model/auth.slice";
// import { attachAuthToken, setupAuthRefresh } from "../shared/lib/axios";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 1) Hydrate auth state from localStorage
    store.dispatch(hydrateFromStorage());

    // 2) Inject Authorization header on all axios requests
    attachAuthToken(() => store.getState().auth.token);

    // 3) Auto-refresh token on 401 and update Redux
    setupAuthRefresh({
      getAccessToken: () => store.getState().auth.token,
      getRefreshToken: () => store.getState().auth.refreshToken,
      onTokens: (toks) => {
        if (!toks) {
          store.dispatch(logout());
        } else {
          store.dispatch(
            tokensRefreshed({
              token: toks.token,
              tokenExpiresAtUtc: toks.tokenExpiresAtUtc,
              refreshToken: toks.refreshToken,
              refreshTokenExpiresAtUtc: toks.refreshTokenExpiresAtUtc,
            })
          );
        }
      },
    });
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
