import { getInitialReferenceResource } from "@/lib/reference";
import { ReferenceResourceDashboard } from "@/features/reference/reference-resource-dashboard";
import type { ReferenceResource } from "@/features/reference/types";

export async function ReferenceResourcePage({
  resource,
}: {
  resource: ReferenceResource;
}) {
  const initial = await getInitialReferenceResource(resource);
  return (
    <ReferenceResourceDashboard
      resource={resource}
      initialRecords={initial.records}
      initialOptions={initial.options}
      initialError={initial.error}
    />
  );
}
