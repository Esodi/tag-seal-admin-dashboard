import "server-only";
import { cookies } from "next/headers";
import type {
  CareerOptions,
  CareerOverview,
  CareerResource,
  CareerResponse,
} from "@/features/career/types";
const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
export async function careerGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get("tagseal_admin_token")?.value;
  if (!token) throw new Error("Your administrator session is unavailable.");
  const response = await fetch(`${apiUrl}/api/v1/admin/career/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(payload?.message ?? "Career records could not be loaded.");
  return payload as T;
}
export async function getInitialCareerResource(resource: CareerResource) {
  try {
    const [data, options] = await Promise.all([
      careerGet<CareerResponse>(`${resource}?per_page=10`),
      careerGet<{ data: CareerOptions }>(`${resource}/options`),
    ]);
    return { data, options: options.data, error: null };
  } catch (error) {
    return {
      data: null,
      options: null,
      error:
        error instanceof Error
          ? error.message
          : "Career records could not be loaded.",
    };
  }
}
export async function getCareerOverview() {
  try {
    return {
      data: (await careerGet<{ data: CareerOverview }>("overview")).data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Career overview could not be loaded.",
    };
  }
}
