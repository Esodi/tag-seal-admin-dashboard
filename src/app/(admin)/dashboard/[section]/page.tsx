import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CircleHelp,
  Database,
  FileCode,
  FileStack,
  Globe,
  KeyRound,
  Languages,
  Mail,
  Palette,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section === "analytics") {
    return <Suspense fallback={<AnalyticsSkeleton />}><AnalyticsPage /></Suspense>;
  }

  if (section === "help") {
    const helpItems = [
      [BookOpen, "Admin guide", "Learn the configured workflows and dashboard structure."],
      [CircleHelp, "Help centre", "Browse answers for accounts, animals, farms and reporting."],
      [Mail, "Contact support", "Prepare a support request for the implementation team."],
    ] as const;
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          eyebrow="Support"
          title="Help Center"
          description="Guidance and support resources kept outside operational administration."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {helpItems.map(([Icon, title, text]) => (
            <div className="card p-5" key={title}>
              <span className="grid size-10 place-items-center rounded-xl bg-muted">
                <Icon className="size-5 text-primary" />
              </span>
              <h2 className="mt-5 font-semibold">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              <button className="mt-5 text-xs font-semibold text-primary">Open resource →</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "settings") {
    const settings = [
      [Settings, "General", "Organization identity and platform defaults."],
      [ShieldCheck, "Security", "Access policies and administrative protection."],
      [Palette, "Appearance", "Theme, density and visual preferences."],
      [Languages, "Language & region", "Locale, timezone and number formats."],
      [SlidersHorizontal, "Feature controls", "Prepare feature flags and module defaults."],
      [KeyRound, "API & integrations", "Connection settings reserved for implementation."],
    ] as const;
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          eyebrow="Platform"
          title="Settings"
          description="Central platform preferences, placed separately from daily management features."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {settings.map(([Icon, title, text]) => (
            <div className="card group p-5" key={title}>
              <span className="grid size-10 place-items-center rounded-xl bg-muted">
                <Icon className="size-5 text-primary" />
              </span>
              <h2 className="mt-5 font-semibold">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              <span className="mt-5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Configured for later
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const group = featureGroups.find((item) => item.slug === section);
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
              {feature.status && (
                <span
                  className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${
                    feature.status === "new"
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}
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
