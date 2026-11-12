import "server-only";

import { cookies } from "next/headers";
import type { EventResource, EventResponse } from "@/features/events/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function getInitialEventResource(
  resource: EventResource,
): Promise<{ data: EventResponse | null; error?: string }> {
  try {
    const token = (await cookies()).get("tagseal_admin_token")?.value;
    if (!token) {
      return {
        data: null,
        error: "Your administrator session is unavailable.",
      };
    }
    const response = await fetch(
      `${apiUrl}/api/v1/admin/events/${resource}?per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.status === false) {
      return {
        data: null,
        error: payload?.message ?? "Events & Logs data could not be loaded.",
      };
    }
    return { data: (payload?.data as EventResponse) ?? null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Events & Logs data could not be loaded.",
    };
  }
}

