import { getInitialAnimalResource } from "@/lib/animals";
import { AnimalResourceDashboard } from "@/features/animals/animal-resource-dashboard";
import type { AnimalResource } from "@/features/animals/types";

export async function AnimalResourcePage({
  resource,
}: {
  resource: AnimalResource;
}) {
  const initial = await getInitialAnimalResource(resource);
  return (
    <AnimalResourceDashboard
      resource={resource}
      initialRecords={initial.records}
      initialOptions={initial.options}
      initialError={initial.error}
    />
  );
}

