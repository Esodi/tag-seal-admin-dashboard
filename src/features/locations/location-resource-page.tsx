import { getInitialLocationResource } from "@/lib/locations";
import { LocationResourceDashboard } from "@/features/locations/location-resource-dashboard";
import type { LocationResource } from "@/features/locations/types";

export async function LocationResourcePage({
  resource,
}: {
  resource: LocationResource;
}) {
  const initial = await getInitialLocationResource(resource);
  return (
    <LocationResourceDashboard
      resource={resource}
      initialRecords={initial.records}
      initialOptions={initial.options}
      initialError={initial.error}
    />
  );
}

