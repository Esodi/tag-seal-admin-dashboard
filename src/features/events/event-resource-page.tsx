import { EventResourceDashboard } from "@/features/events/event-resource-dashboard";
import type { EventResource } from "@/features/events/types";
import { getInitialEventResource } from "@/lib/events";

export async function EventResourcePage({
  resource,
}: {
  resource: EventResource;
}) {
  const result = await getInitialEventResource(resource);
  return (
    <EventResourceDashboard
      resource={resource}
      initialData={result.data}
      initialError={result.error}
    />
  );
}

