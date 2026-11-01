import { getBlueprintOptions, getInitialBlueprintResource } from "@/lib/blueprints";
import { BlueprintResourceDashboard } from "./blueprint-resource-dashboard";
import type { BlueprintResource } from "./types";

export async function BlueprintResourcePage({
  resource,
}: {
  resource: BlueprintResource;
}) {
  const [initialData, optionsData] = await Promise.all([
    getInitialBlueprintResource(resource),
    getBlueprintOptions(resource),
  ]);

  return (
    <BlueprintResourceDashboard
      resource={resource}
      initialData={initialData.data}
      initialOptions={optionsData.data}
      initialError={initialData.error}
    />
  );
}

