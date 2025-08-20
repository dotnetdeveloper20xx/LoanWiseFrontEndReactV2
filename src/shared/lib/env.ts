// src/shared/lib/env.ts
// Central place to read Vite envs with a safe fallback.
const base = (import.meta.env.VITE_API_BASE_URL as string) || "https://localhost:7000";

export const ENV = {
  API_BASE_URL: base.trim(),
};
