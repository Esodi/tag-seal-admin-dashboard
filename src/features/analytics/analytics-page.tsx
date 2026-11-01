import { getInitialAnalytics } from "@/lib/analytics";
import { AnalyticsDashboard } from "@/features/analytics/analytics-dashboard";

export async function AnalyticsPage() {
  const initial = await getInitialAnalytics();
  return <AnalyticsDashboard initialData={initial.data} initialError={initial.error} />;
}
