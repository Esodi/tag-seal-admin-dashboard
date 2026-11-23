import { getInitialPeopleResource } from "@/lib/people";
import { PeopleResourceDashboard } from "@/features/people/people-resource-dashboard";
import type { PeopleResource } from "@/features/people/types";

export async function PeopleResourcePage({
  resource,
  parent,
  parentHref,
}: {
  resource: PeopleResource;
  parent?: string;
  parentHref?: string;
}) {
  const initial = await getInitialPeopleResource(resource);
  return (
    <PeopleResourceDashboard
      resource={resource}
      initialRecords={initial.records}
      initialOptions={initial.options}
      initialError={initial.error}
      parent={parent}
      parentHref={parentHref}
    />
  );
}
