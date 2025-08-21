import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import type { Role, Profile } from "../model/auth.types";
import { loginSucceeded, setProfile } from "../model/auth.slice";
import { loginUser, registerUser, getMe } from "../api/auth.api";

/** Register (Borrower/Lender) */
export function useRegister() {
  return useMutation({
    mutationFn: (p: { fullName: string; email: string; password: string; role: Role }) =>
      registerUser(p),
  });
}

/**
 * Login:
 * - Handles token-only or token+profile shapes
 * - Clears all caches to avoid stale identity
 * - Fetches /me right away and mirrors into Redux
 */
export function useLogin() {
  const dispatch = useDispatch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (p: { email: string; password: string }) => loginUser(p.email, p.password),
    onSuccess: async (data) => {
      // Make sure any old session data is gone
      await qc.clear();

      dispatch(
        loginSucceeded({
          token: data.token,
          refreshToken: data.refreshToken ?? "",
          tokenExpiresAtUtc: data.tokenExpiresAtUtc ?? "",
          refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc ?? "",
          profile: (data.profile ?? {
            id: "",
            fullName: "",
            email: "",
            role: "Borrower",
          }) as Profile,
        })
      );

      // If server didn’t include profile, fetch it now
      try {
        const me = await getMe();
        dispatch(setProfile(me));
        // seed query cache too
        qc.setQueryData(["me"], me);
      } catch {
        /* ignore; profile will resolve on first useMe */
      }
    },
  });
}

/** /users/me → cache + mirror in Redux */
export function useMe() {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    onSuccess: (p) => dispatch(setProfile(p)),
    staleTime: 5 * 60 * 1000,
  });
}
