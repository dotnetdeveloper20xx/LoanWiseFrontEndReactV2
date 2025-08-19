import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export function useAuth() {
  const { token, refreshToken, profile } = useSelector((s: RootState) => s.auth);
  const isAuthenticated = !!token && !!profile;
  const role = profile?.role;
  return { token, refreshToken, profile, role, isAuthenticated };
}
