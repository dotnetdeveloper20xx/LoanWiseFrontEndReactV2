// src/features/metadata/api/metadata.api.ts
import { api } from "../../../shared/lib/axios";

/** GET /api/metadata/loan-purposes → ApiResponse<string[]|{name,value}[]> */
export async function getLoanPurposes(): Promise<Array<{ name: string; value: string | number }>> {
  const res = await api.get("/api/metadata/loan-purposes");
  const payload = res.data?.data ?? res.data ?? [];
  // Normalize to {name,value}
  if (Array.isArray(payload) && payload.length > 0) {
    if (typeof payload[0] === "string") {
      return (payload as string[]).map((p) => ({ name: p, value: p }));
    }
    return payload as Array<{ name: string; value: string | number }>;
  }
  return [];
}
