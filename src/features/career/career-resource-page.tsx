import { CareerResourceDashboard } from "./career-resource-dashboard";
import type { CareerResource } from "./types";
import { getInitialCareerResource } from "@/lib/career";

export async function CareerResourcePage({
  resource,
  parent,
  parentHref,
}: {
  resource: CareerResource;
  parent?: string;
  parentHref?: string;
}) {
  const result = await getInitialCareerResource(resource);
  return (
    <CareerResourceDashboard
      key={resource}
      resource={resource}
      initialData={result.data}
      initialOptions={result.options}
      initialError={result.error}
      parent={parent}
      parentHref={parentHref}
    />
  );
}
