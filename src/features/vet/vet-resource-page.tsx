import { VetResourceDashboard } from "@/features/vet/vet-resource-dashboard";
import type { VetAnyRecord, VetResource } from "@/features/vet/types";
import { getInitialRegistry } from "@/lib/registry";

export async function VetResourcePage({ resource }: { resource: VetResource }) {
  const result = await getInitialRegistry<VetAnyRecord>(`/vet/${resource}`);
  return <VetResourceDashboard key={resource} resource={resource} initialData={result.data} initialError={result.error} />;
}
