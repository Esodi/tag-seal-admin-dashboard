import "server-only";

import { cookies } from "next/headers";
import type { ActivityPoint, AttentionItem, ProductionPoint } from "@/features/analytics/types";

export type DashboardStat = { key: string; label: string; value: number; displayValue?: string; unit?: string | null; note?: string; periodValue?: number; periodLabel?: string; category?: "registry" | "event" | "system"; change: number | null; direction: "up" | "down" | "neutral" };
export type DashboardPoint = { month: string; value: number };
export type DashboardActivity = { id: string; title: string; subjectUuid?: string | null; farmUuid?: string | null; occurredAt?: string | null; status?: string | null };
export type ModuleCard = { key: "commerce" | "auction" | "vet" | "dairy" | "career"; label: string; value: number; previous: number; unit: string | null; change: number | null; direction: "up" | "down" | "neutral"; note: string; href: string };
export type ModuleTrendPoint = { date: string; label: string; orders: number; auctionSales: number; vetRequests: number; trips: number; applications: number; marketplaceRevenue: number; auctionRevenue: number };
export type ApprovalQueueItem = { key: string; name: string; value: number; href: string };
export type DashboardOverview = { modules?: ModuleCard[]; moduleTrend?: ModuleTrendPoint[]; approvalQueue?: ApprovalQueueItem[]; stats: DashboardStat[]; animalTrend: DashboardPoint[]; eventTrend: DashboardPoint[]; species: Array<{ name: string; value: number }>; healthByEvent: Array<{ name: string; value: number }>; activityTrend: ActivityPoint[]; productionTrend: ProductionPoint[]; attention: AttentionItem[]; recentActivity: DashboardActivity[]; generatedAt: string };

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function getDashboardOverview(): Promise<{ data: DashboardOverview | null; error?: string }> {
  const token = (await cookies()).get("tagseal_admin_token")?.value;
  if (!token) return { data: null, error: "Your admin session is unavailable." };
  try {
    const response = await fetch(`${apiUrl}/api/v1/admin/dashboard`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return { data: null, error: response.status === 401 ? "Your session has expired." : payload?.message ?? "Dashboard data could not be loaded." };
    return { data: payload.data as DashboardOverview };
  } catch {
    return { data: null, error: "The Laravel dashboard service is currently unavailable." };
  }
}
