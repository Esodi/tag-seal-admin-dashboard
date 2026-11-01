import { Suspense } from "react";
import { Overview } from "@/features/dashboard/overview";
import { OverviewSkeleton } from "@/features/dashboard/overview-skeleton";
import { getDashboardOverview } from "@/lib/dashboard";

async function DashboardData() {
  const result = await getDashboardOverview();
  return <Overview data={result.data} error={result.error} />;
}

export default function DashboardPage() {
  return <Suspense fallback={<OverviewSkeleton />}><DashboardData /></Suspense>;
}
