import "server-only";

import { cookies } from "next/headers";
import type {
  AnimalOptionsResponse,
  AnimalResource,
  AnimalResponse,
} from "@/features/animals/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

async function adminGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get("tagseal_admin_token")?.value;
  if (!token) throw new Error("Your administrator session is unavailable.");
  const response = await fetch(`${apiUrl}/api/v1/admin${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.message ?? "Animals & Livestock data could not be loaded.",
    );
  }
  return payload as T;
}

export async function getInitialAnimalResource(resource: AnimalResource) {
  try {
    const [records, options] = await Promise.all([
      adminGet<AnimalResponse>(`/animals/${resource}?per_page=10`),
      adminGet<AnimalOptionsResponse>(`/animals/${resource}/options`),
    ]);
    return { records, options: options.data, error: null };
  } catch (error) {
    return {
      records: null,
      options: null,
      error:
        error instanceof Error
          ? error.message
          : "Animals & Livestock data could not be loaded.",
    };
  }
}

