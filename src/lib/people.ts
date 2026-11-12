import "server-only";

import { cookies } from "next/headers";
import type { PeopleOptionsResponse, PeopleResource, PeopleResponse } from "@/features/people/types";
import { formatFriendlyError } from "@/lib/friendly-error";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

async function adminGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get("tagseal_admin_token")?.value;
  if (!token) throw new Error("Your administrator session is unavailable.");
  const response = await fetch(`${apiUrl}/api/v1/admin${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(formatFriendlyError(payload?.message, "People & Organization data could not be loaded."));
  return payload as T;
}

export async function getInitialPeopleResource(resource: PeopleResource) {
  try {
    const [records, options] = await Promise.all([
      adminGet<PeopleResponse>(`/people/${resource}?per_page=10`),
      adminGet<PeopleOptionsResponse>(`/people/${resource}/options`),
    ]);
    return { records, options: options.data, error: null };
  } catch (error) {
    return {
      records: null,
      options: null,
      error: formatFriendlyError(error, "People & Organization data could not be loaded."),
    };
  }
}
