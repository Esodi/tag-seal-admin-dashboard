import "server-only";

import { cookies } from "next/headers";
import type { AnalyticsApiResponse, AnalyticsResponse } from "@/features/analytics/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function getInitialAnalytics(): Promise<{ data: AnalyticsResponse | null; error: string | null }> {
  const token = (await cookies()).get("tagseal_admin_token")?.value;
  if (!token) return { data: null, error: "Your administrator session is unavailable." };

  try {
    const response = await fetch(`${apiUrl}/api/v1/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null) as AnalyticsApiResponse | { message?: string } | null;
    if (!response.ok || !payload || !("data" in payload)) {
      throw new Error(payload && "message" in payload ? payload.message : "Analytics could not be loaded.");
    }
    return { data: payload.data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Analytics could not be loaded." };
  }
}
