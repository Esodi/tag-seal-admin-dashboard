import "server-only";

import { cookies } from "next/headers";
import type { DairyResource, DairyResponse } from "@/features/dairy/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function getInitialDairyResource(resource: DairyResource): Promise<{ data: DairyResponse | null; error?: string }> {
  try {
    const token = (await cookies()).get("tagseal_admin_token")?.value;
    if (!token) return { data: null, error: "Your administrator session is unavailable." };
    const response = await fetch(`${apiUrl}/api/v1/admin/dairy/${resource}?per_page=10`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.status === false || payload?.success === false) {
      return { data: null, error: payload?.message ?? "Dairy data could not be loaded." };
    }
    return { data: (payload?.data as DairyResponse) ?? null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Dairy data could not be loaded." };
  }
}
