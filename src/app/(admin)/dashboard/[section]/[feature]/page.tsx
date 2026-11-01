import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FeatureWorkspace } from "@/features/admin/feature-workspace";
import { AnimalResourcePage } from "@/features/animals/animal-resource-page";
import {
  animalResources,
  type AnimalResource,
} from "@/features/animals/types";
import { CommerceResourcePage } from "@/features/commerce/commerce-resource-page";
import { commerceResources, type CommerceResource } from "@/features/commerce/types";
import { DairyResourcePage } from "@/features/dairy/dairy-resource-page";
import { dairyResources, type DairyResource } from "@/features/dairy/types";
import { EventResourcePage } from "@/features/events/event-resource-page";
import {
  eventResources,
  type EventResource,
} from "@/features/events/types";
import { FinanceResourcePage } from "@/features/finance/finance-resource-page";
import {
  financeResources,
  type FinanceResource,
} from "@/features/finance/types";
import { LocationResourcePage } from "@/features/locations/location-resource-page";
import {
  locationResources,
  type LocationResource,
} from "@/features/locations/types";
import { PeopleResourcePage } from "@/features/people/people-resource-page";
import { peopleResources, type PeopleResource } from "@/features/people/types";
import { ReferenceResourcePage } from "@/features/reference/reference-resource-page";
import {
  referenceResources,
  type ReferenceResource,
} from "@/features/reference/types";
import { BlueprintResourcePage } from "@/features/blueprints/blueprint-resource-page";
import {
  blueprintResources,
  type BlueprintResource,
} from "@/features/blueprints/types";
import { UserAccountsPage } from "@/features/users/user-accounts-page";
import { UsersDashboardSkeleton } from "@/features/users/users-dashboard-skeleton";
import { getFeature } from "@/lib/features";

export const instant = false;

export default async function FeaturePage({ params }: { params: Promise<{ section: string; feature: string }> }) {
  const { section, feature } = await params;
  const configuration = getFeature(section, feature);
  if (!configuration) notFound();
  if (section === "people" && feature === "user-accounts") return <Suspense fallback={<UsersDashboardSkeleton />}><UserAccountsPage /></Suspense>;
  if (section === "people" && peopleResources.includes(feature as PeopleResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><PeopleResourcePage resource={feature as PeopleResource} /></Suspense>;
  if (section === "locations" && locationResources.includes(feature as LocationResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><LocationResourcePage resource={feature as LocationResource} /></Suspense>;
  if (section === "animals" && animalResources.includes(feature as AnimalResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><AnimalResourcePage resource={feature as AnimalResource} /></Suspense>;
  if (section === "events" && eventResources.includes(feature as EventResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><EventResourcePage resource={feature as EventResource} /></Suspense>;
  if (section === "finance" && financeResources.includes(feature as FinanceResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><FinanceResourcePage resource={feature as FinanceResource} /></Suspense>;
  if (section === "commerce" && commerceResources.includes(feature as CommerceResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><CommerceResourcePage resource={feature as CommerceResource} /></Suspense>;
  if (section === "dairy" && dairyResources.includes(feature as DairyResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><DairyResourcePage resource={feature as DairyResource} /></Suspense>;
  if (section === "blueprints" && blueprintResources.includes(feature as BlueprintResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><BlueprintResourcePage resource={feature as BlueprintResource} /></Suspense>;
  if (section === "reference" && referenceResources.includes(feature as ReferenceResource)) return <Suspense fallback={<UsersDashboardSkeleton />}><ReferenceResourcePage resource={feature as ReferenceResource} /></Suspense>;
  return <FeatureWorkspace group={configuration.group} feature={configuration.feature} />;
}
