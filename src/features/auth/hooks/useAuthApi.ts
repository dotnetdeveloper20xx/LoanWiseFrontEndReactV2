import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import type { Role, Profile } from "../model/auth.types";
import { loginSucceeded, setProfile } from "../model/auth.slice";
import { loginUser, registerUser, getMe } from "../api/auth.api";

/**
 * Register (Borrower/Lender)
 */
export function useRegister() {
  return useMutation({
    mutationFn: (p: { fullName: string; email: string; password: string; role: Role }) =>
      registerUser(p),
  });
}

/**
 * Login:
 * - Supports login responses where `data` is a raw JWT string or an object.
 * - If profile is missing in login response, fetch `/api/users/me` immediately after.
 */
export function useLogin() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (p: { email: string; password: string }) => loginUser(p.email, p.password),
    onSuccess: async (data) => {
      // Persist tokens immediately (slice also writes to localStorage)
      dispatch(
        loginSucceeded({
          token: data.token,
          refreshToken: data.refreshToken ?? "",
          tokenExpiresAtUtc: data.tokenExpiresAtUtc ?? "",
          refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc ?? "",
          // temporary; ensure shape is valid for the slice
          profile: (data.profile ?? {
            id: "",
            fullName: "",
            email: "",
            role: "Borrower",
          }) as Profile,
        })
      );

      // If server didn’t include profile in the login payload, fetch it
      if (!data.profile) {
        try {
          const me = await getMe();
          dispatch(setProfile(me));
        } catch {
          // ignore; user remains logged in and UI can call useMe elsewhere
        }
      }
    },
  });
}

/**
 * /users/me → cache + mirror in Redux for easy access across the app
 */
export function useMe() {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    onSuccess: (p) => dispatch(setProfile(p)),
    staleTime: 5 * 60 * 1000,
  });
}
