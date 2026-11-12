import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { FeatureWorkspace } from "@/features/admin/feature-workspace";
import { ProfileDashboard } from "@/features/account/profile-dashboard";
import { AnimalResourcePage } from "@/features/animals/animal-resource-page";
import { animalResources, type AnimalResource } from "@/features/animals/types";
import { CareerResourcePage } from "@/features/career/career-resource-page";
import { careerResources, type CareerResource } from "@/features/career/types";
import { CommerceResourcePage } from "@/features/commerce/commerce-resource-page";
import {
  commerceResources,
  type CommerceResource,
} from "@/features/commerce/types";
import { DairyResourcePage } from "@/features/dairy/dairy-resource-page";
import { CooperativeRegistryDashboard } from "@/features/dairy/cooperative-registry-dashboard";
import { TransporterFleetDashboard } from "@/features/dairy/transporter-fleet-dashboard";
import { TransporterRegistryDashboard } from "@/features/dairy/transporter-registry-dashboard";
import { dairyResources, type DairyResource } from "@/features/dairy/types";
import { EventResourcePage } from "@/features/events/event-resource-page";
import { eventResources, type EventResource } from "@/features/events/types";
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
import { PlatformPermissionsPage } from "@/features/security/platform-permissions-page";

import { OtpDashboard } from "@/features/security/otp-dashboard";
import { UpgradeRunsDashboard } from "@/features/security/upgrade-runs-dashboard";
import { LedgerMigrationDashboard } from "@/features/security/ledger-migration-dashboard";

export const instant = false;

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ section: string; feature: string }>;
}) {
  const { section, feature } = await params;
  if (section === "career" && feature === "workers") {
    redirect("/dashboard/people/farm-workers");
  }
  if (
    section === "people" &&
    (feature === "farm-workers" || feature === "farm-users" || feature === "workers")
  ) {
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <CareerResourcePage
          resource="workers"
          parent="People & Organization"
          parentHref="/dashboard/people"
        />
      </Suspense>
    );
  }
  const configuration = getFeature(section, feature);
  if (!configuration) notFound();
  if (section === "account" && feature === "profile") return <ProfileDashboard />;
  if (
    (section === "security" || section === "system") &&
    feature === "otp-verifications"
  )
    return <OtpDashboard />;
  if (
    (section === "security" || section === "system") &&
    feature === "platform-permissions"
  )
    return <PlatformPermissionsPage />;
  if (
    (section === "security" || section === "system") &&
    feature === "upgrade-runs"
  )
    return <UpgradeRunsDashboard />;
  if (
    (section === "security" || section === "system") &&
    feature === "ledger-migration"
  )
    return <LedgerMigrationDashboard />;
  if (section === "people" && feature === "user-accounts")
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <UserAccountsPage />
      </Suspense>
    );
  if (
    section === "people" &&
    peopleResources.includes(feature as PeopleResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <PeopleResourcePage resource={feature as PeopleResource} />
      </Suspense>
    );
  if (
    section === "locations" &&
    locationResources.includes(feature as LocationResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <LocationResourcePage resource={feature as LocationResource} />
      </Suspense>
    );
  if (
    section === "animals" &&
    animalResources.includes(feature as AnimalResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <AnimalResourcePage resource={feature as AnimalResource} />
      </Suspense>
    );
  if (section === "events" && eventResources.includes(feature as EventResource))
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <EventResourcePage resource={feature as EventResource} />
      </Suspense>
    );
  if (
    section === "finance" &&
    financeResources.includes(feature as FinanceResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <FinanceResourcePage resource={feature as FinanceResource} />
      </Suspense>
    );
  if (
    section === "commerce" &&
    commerceResources.includes(feature as CommerceResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <CommerceResourcePage resource={feature as CommerceResource} />
      </Suspense>
    );
  if (
    section === "career" &&
    careerResources.includes(feature as CareerResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <CareerResourcePage resource={feature as CareerResource} />
      </Suspense>
    );
  if (section === "dairy" && (feature === "unions" || feature === "cooperatives" || feature === "centres" || feature === "factories"))
    return <CooperativeRegistryDashboard key={feature} type={feature === "unions" ? "mcus" : feature === "centres" ? "centres" : feature === "factories" ? "factories" : "amcos"} />;
  if (section === "dairy" && feature === "transporters") return <TransporterRegistryDashboard />;
  if (section === "dairy" && (feature === "transport-vehicles" || feature === "transport-drivers"))
    return <TransporterFleetDashboard key={feature} kind={feature === "transport-vehicles" ? "vehicles" : "drivers"} />;
  if (section === "dairy" && dairyResources.includes(feature as DairyResource))
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <DairyResourcePage resource={feature as DairyResource} />
      </Suspense>
    );
  if (
    section === "blueprints" &&
    blueprintResources.includes(feature as BlueprintResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <BlueprintResourcePage resource={feature as BlueprintResource} />
      </Suspense>
    );
  if (
    section === "reference" &&
    referenceResources.includes(feature as ReferenceResource)
  )
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <ReferenceResourcePage resource={feature as ReferenceResource} />
      </Suspense>
    );
  return (
    <FeatureWorkspace
      group={configuration.group}
      feature={configuration.feature}
    />
  );
}
