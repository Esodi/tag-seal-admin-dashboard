"use client";

import { DashboardStatCard } from "@/components/ui/dashboard";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  FileText,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import { featureGroups } from "@/lib/features";
import { authenticatedFetch } from "@/lib/auth/session";
import { label } from "./resource-config";
import type { CareerOverview } from "./types";

const careerFeatureIcons: Record<string, React.ElementType> = {
  jobs: Briefcase,
  applications: FileText,
  "job-seekers": UserCheck,
  employers: Building2,
  memberships: ShieldCheck,
  onboardings: Clock,
  "job-types": Layers,
  "job-options": SlidersHorizontal,
};

export function CareerOverviewDashboard({
  initialData,
  initialError,
}: {
  initialData: CareerOverview | null;
  initialError: string | null;
}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const careerGroup = featureGroups.find((g) => g.slug === "career");
  const features = careerGroup?.features ?? [];

  async function refresh() {
    setLoading(true);
    try {
      const response = await authenticatedFetch("/api/admin/career/overview");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Overview data could not be loaded.");
      }
      setData(payload.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Overview data could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  const statIcons = [Briefcase, FileText, Clock, UserCheck];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Management"
        title="Career & Jobs"
        description="Farm recruitment portal, agricultural job listings, candidate profiles and hiring workflow."
      />

      {/* Error alert if any */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm"
        >
          <p className="text-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void refresh()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Primary KPI Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data
          ? data.stats.map((stat, index) => {
              const Icon = statIcons[index % statIcons.length];
              return (
                <Link
                  key={stat.label}
                  href={`/dashboard/career/${stat.href}`}
                  className="group transition"
                >
                  <DashboardStatCard className="h-full transition group-hover:border-primary/40 group-hover:bg-muted/20" label={stat.label} value={<StatNumber value={stat.value} />} icon={Icon} note={<span className="flex items-center gap-1">Open workspace <ArrowRight className="size-3" /></span>} />
                </Link>
              );
            })
          : Array.from({ length: 4 }, (_, i) => (
              <DashboardStatCard key={i} loading />
            ))}
      </div>

      {/* Standard Feature Workspaces Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold">Career Registries & Catalogs</h2>
          <p className="text-xs text-muted-foreground">
            Manage vacancies, applicant snapshots, candidate profiles and form options.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const FeatureIcon = careerFeatureIcons[feature.slug] ?? Briefcase;
            return (
              <Link
                href={`/dashboard/career/${feature.slug}`}
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
                <h2 className="mt-5 font-semibold text-foreground">
                  {feature.label}
                </h2>
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

      {/* Breakdown Panels */}
      {data && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Applications Breakdown */}
          <Card className="shadow-none">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <h3 className="text-sm font-semibold">Applications Pipeline</h3>
                <Link
                  href="/dashboard/career/applications"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>
              {data.applications.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {data.applications.map((row) => (
                    <div
                      key={row.status}
                      className="flex items-center justify-between text-xs"
                    >
                      <StatusBadge status={label(row.status)} />
                      <span className="font-semibold tabular-nums text-foreground">
                        <StatNumber value={row.total} />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-xs text-muted-foreground">
                  No applications recorded yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Joining & Onboarding Breakdown */}
          <Card className="shadow-none">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <h3 className="text-sm font-semibold">Joining & Onboarding</h3>
                <Link
                  href="/dashboard/career/onboardings"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>
              {data.joining.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {data.joining.map((row) => (
                    <div
                      key={row.status}
                      className="flex items-center justify-between text-xs"
                    >
                      <StatusBadge status={label(row.status)} />
                      <span className="font-semibold tabular-nums text-foreground">
                        <StatNumber value={row.total} />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-xs text-muted-foreground">
                  No onboarding records in progress.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Memberships Breakdown */}
          <Card className="shadow-none">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <h3 className="text-sm font-semibold">Feature Memberships</h3>
                <Link
                  href="/dashboard/people/memberships"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>
              {data.memberships.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {data.memberships.map((row) => (
                    <div
                      key={row.feature}
                      className="flex items-center justify-between text-xs"
                    >
                      <Badge variant="outline" className="font-normal">
                        {label(row.feature)}
                      </Badge>
                      <span className="font-semibold tabular-nums text-foreground">
                        <StatNumber value={row.total} />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-xs text-muted-foreground">
                  No feature memberships registered yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recruitment to Farm Access Governance Guide */}
      <Card className="shadow-none bg-muted/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="text-sm font-semibold">
              Recruitment Workflow & Governance
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Recruitment and onboarding are managed in four clear stages:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[
              {
                step: "1. Review application",
                detail: "Employer assesses candidate qualification snapshot.",
              },
              {
                step: "2. Send joining terms",
                detail: "Proposes start date, supervisor and arrival instructions.",
              },
              {
                step: "3. Candidate response",
                detail: "Worker confirms or declines proposed offer.",
              },
              {
                step: "4. Farm worker activation",
                detail: "Farm owner approves duties in People & Organization.",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="rounded-xl border bg-card p-3.5 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold">{item.step}</span>
                </div>
                <p className="text-[11px] leading-4 text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
