import "server-only";

import { cookies } from "next/headers";
import type { RegistryResponse } from "@/features/registry/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

/** First page of an admin list endpoint, e.g. `/auction/centres`, so the table renders with data. */
export async function getInitialRegistry<T>(path: string): Promise<{ data: RegistryResponse<T> | null; error?: string }> {
  try {
    const token = (await cookies()).get("tagseal_admin_token")?.value;
    if (!token) return { data: null, error: "Your administrator session is unavailable." };
    const response = await fetch(`${apiUrl}/api/v1/admin${path}?per_page=10`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.status === false || payload?.success === false) {
      return { data: null, error: payload?.message ?? "Records could not be loaded." };
    }
    return { data: (payload?.data as RegistryResponse<T>) ?? null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Records could not be loaded." };
  }
}
