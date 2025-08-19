import { useMutation, useQuery } from "@tanstack/react-query";
import { getMe, loginUser, registerUser } from "@/features/auth/api/auth.api";
import { useDispatch } from "react-redux";
import { loginSucceeded, setProfile } from "@/features/auth/model/auth.slice";
import type { Role } from "@/features/auth/model/auth.types";

export function useRegister() {
  return useMutation({
    mutationFn: (p: { fullName: string; email: string; password: string; role: Role }) =>
      registerUser(p),
  });
}

export function useLogin() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (p: { email: string; password: string }) => loginUser(p.email, p.password),
    onSuccess: (data) => {
      dispatch(
        loginSucceeded({
          token: data.token,
          refreshToken: data.refreshToken,
          tokenExpiresAtUtc: data.tokenExpiresAtUtc,
          refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc,
          profile: data.profile,
        })
      );
    },
  });
}

export function useMe() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    // cache user but also push into Redux for easy access
    onSuccess: (p) => dispatch(setProfile(p)),
    staleTime: 5 * 60 * 1000,
  });
}
