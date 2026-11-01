import "server-only";

import { cookies } from "next/headers";
import type {
  FinanceCrudResource,
  FinanceResponse,
  IncomeExpenditureReportResponse,
} from "@/features/finance/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

async function fetchFinanceApi<T>(
  path: string,
): Promise<{ data: T | null; error?: string }> {
  try {
    const token = (await cookies()).get("tagseal_admin_token")?.value;
    if (!token) {
      return {
        data: null,
        error: "Your administrator session is unavailable.",
      };
    }
    const response = await fetch(`${apiUrl}/api/v1/admin/finance/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.status === false) {
      return {
        data: null,
        error: payload?.message ?? "Finance & Billing data could not be loaded.",
      };
    }
    return { data: (payload?.data as T) ?? null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Finance & Billing data could not be loaded.",
    };
  }
}

export async function getInitialFinanceResource(resource: FinanceCrudResource) {
  return fetchFinanceApi<FinanceResponse>(`${resource}?per_page=15`);
}

export async function getInitialIncomeExpenditureReport() {
  return fetchFinanceApi<IncomeExpenditureReportResponse>("income-expenditure");
}

