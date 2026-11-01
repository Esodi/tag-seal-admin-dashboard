import { getInitialPeopleResource } from "@/lib/people";
import { PeopleResourceDashboard } from "@/features/people/people-resource-dashboard";
import type { PeopleResource } from "@/features/people/types";

export async function PeopleResourcePage({ resource }: { resource: PeopleResource }) {
  const initial = await getInitialPeopleResource(resource);
  return <PeopleResourceDashboard resource={resource} initialRecords={initial.records} initialOptions={initial.options} initialError={initial.error} />;
}
