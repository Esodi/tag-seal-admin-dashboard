import { AuctionResourceDashboard } from "@/features/auction/auction-resource-dashboard";
import type { AuctionRecord, AuctionResource } from "@/features/auction/types";
import { getInitialRegistry } from "@/lib/registry";

export async function AuctionResourcePage({ resource }: { resource: AuctionResource }) {
  const result = await getInitialRegistry<AuctionRecord>(`/auction/${resource}`);
  return <AuctionResourceDashboard key={resource} resource={resource} initialData={result.data} initialError={result.error} />;
}
