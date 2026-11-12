import { HelpCenterDashboard } from "@/features/help/help-center-dashboard";
import { SettingsDashboard } from "@/features/settings/settings-dashboard";
import { CareerOverviewPage } from "@/features/career/career-overview-page";
import { UsersDashboardSkeleton } from "@/features/users/users-dashboard-skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  Database,
  FileCode,
  FileStack,
  FileText,
  Globe,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { featureGroups } from "@/lib/features";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AnalyticsPage } from "@/features/analytics/analytics-page";
import { AnalyticsSkeleton } from "@/features/analytics/analytics-skeleton";

export const instant = false;

const featureIconMap: Record<string, React.ElementType> = {
  "animal-blueprints": Sparkles,
  "event-definitions": Activity,
  "form-definitions": FileCode,
  "lookup-sets": Database,
  "dynamic-species": Globe,
  jobs: Briefcase,
  applications: FileText,
  "job-seekers": UserCheck,
  employers: Building2,
  memberships: ShieldCheck,
  onboardings: Clock,
  workers: Users,
  "farm-workers": Users,
  "farm-users": Users,
  "job-types": Layers,
  "job-options": SlidersHorizontal,
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "career")
    return (
      <Suspense fallback={<UsersDashboardSkeleton />}>
        <CareerOverviewPage />
      </Suspense>
    );

  if (section === "analytics") {
    return (
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsPage />
      </Suspense>
    );
  }

  if (section === "help") return <HelpCenterDashboard />;
  if (section === "settings") return <SettingsDashboard />;

  const group = featureGroups.find(
    (item) => item.slug === (section === "system" ? "security" : section),
  );
  if (!group) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Management"
        title={group.label}
        description={group.description}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {group.features.map((feature) => {
          const FeatureIcon = featureIconMap[feature.slug] ?? FileStack;
          return (
            <Link
              href={`/dashboard/${group.slug}/${feature.slug}`}
              key={feature.slug}
              className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-muted">
                  <FeatureIcon className="size-5 text-primary" />
                </span>
                {feature.status && feature.status !== "new" && (
                  <span
                    className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-semibold uppercase text-amber-700 dark:text-amber-300"
                  >
                    {feature.status}
                  </span>
                )}
              </div>
              <h2 className="mt-5 font-semibold">{feature.label}</h2>
              <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
                {feature.description}
              </p>
              <span className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary">
                Open workspace{" "}
                <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
