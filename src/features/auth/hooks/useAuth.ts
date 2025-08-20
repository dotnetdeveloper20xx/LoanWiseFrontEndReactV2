import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import type { Profile } from "../model/auth.types";

function dequote(str: string | null | undefined): string | null {
  if (!str) return null;
  const s = String(str).trim();
  if (s === "undefined" || s === "null" || !s) return null;
  if (s.startsWith('"') && s.endsWith('"')) {
    try {
      const v = JSON.parse(s);
      return typeof v === "string" ? v : null;
    } catch {
      return s.slice(1, -1);
    }
  }
  return s;
}

function parseProfile(p: unknown): Profile | null {
  if (!p) return null;
  if (typeof p === "object") return p as Profile;
  try {
    return JSON.parse(String(p)) as Profile;
  } catch {
    return null;
  }
}

export function useAuth() {
  const auth = useSelector((s: RootState) => s.auth);
  const token = dequote(auth.token as any);
  const profile = parseProfile(auth.profile as any);
  const role = profile?.role ?? null;
  const isAuthenticated = !!token;
  return { token, profile, role, isAuthenticated };
}
