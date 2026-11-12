import { DairyResourceDashboard } from "@/features/dairy/dairy-resource-dashboard";
import type { DairyResource } from "@/features/dairy/types";
import { getInitialDairyResource } from "@/lib/dairy";

export async function DairyResourcePage({ resource }: { resource: DairyResource }) {
  const result = await getInitialDairyResource(resource);
  return <DairyResourceDashboard key={resource} resource={resource} initialData={result.data} initialError={result.error} />;
}
