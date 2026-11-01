import { CommerceResourceDashboard } from "@/features/commerce/commerce-resource-dashboard";
import type { CommerceResource } from "@/features/commerce/types";
import { getInitialCommerceResource } from "@/lib/commerce";

export async function CommerceResourcePage({ resource }: { resource: CommerceResource }) {
  const result = await getInitialCommerceResource(resource);
  return <CommerceResourceDashboard resource={resource} initialData={result.data} initialError={result.error} />;
}
