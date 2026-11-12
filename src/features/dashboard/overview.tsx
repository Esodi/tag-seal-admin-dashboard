"use client";

import { useEffect, useMemo } from "react";
import { Activity, ArrowRight, Baby, Beef, Briefcase, Building2, CalendarDays, Milk, RefreshCw, Syringe, UserCheck, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useRouter } from "next/navigation";
import { DashboardPage, DashboardStatCard, DashboardStatsGrid } from "@/components/ui/dashboard";
import { Button } from "@/components/ui/button";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { toast } from "@/components/ui/toast";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { AnalyticsCard, AnalyticsEmpty, AttentionList } from "@/features/analytics/components/analytics-ui";
import type { DashboardOverview } from "@/lib/dashboard";

const statIcons = { animals: Beef, farms: Building2, farmers: Users, users: UserCheck, milking: Milk, vaccinations: Syringe, births: Baby, jobs: Briefcase, career: Briefcase } as const;
const speciesColors = ["#234e38", "#688c53", "#b38936", "#5b7c91", "#936d83", "#9aa89d"];
const familyColors = { health: "#b4534b", production: "#3f7c54", reproduction: "#a8782a", movement: "#4f718a", growth: "#76628a", other: "#8a928c" };

function number(value: number) { return value.toLocaleString("en-TZ"); }
export function Overview({ data, error }: { data: DashboardOverview | null; error?: string }) {
  const router = useRouter();
  const { session } = useAuthSession();
  const name = session?.user.firstname || session?.user.username || "Administrator";
  const species = useMemo(() => (data?.species ?? []).map((item, index) => ({ ...item, fill: speciesColors[index % speciesColors.length] })), [data]);
  const registryStats = data?.stats.filter((stat) => stat.category === "registry") ?? [];
  const eventStats = data?.stats.filter((stat) => stat.category !== "registry") ?? [];

  useEffect(() => {
    if (window.sessionStorage.getItem("tagseal:login-success") === "1") {
      window.sessionStorage.removeItem("tagseal:login-success");
      toast.success("Welcome back. Your administrator session is ready.", { id: "login-success" });
    }
  }, []);

  if (!data) return <DashboardPage><div className="card grid min-h-[420px] place-items-center p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger"><RefreshCw className="size-5" /></span><h1 className="mt-4 text-lg font-semibold">Dashboard data unavailable</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{error ?? "The backend did not return dashboard data."}</p><Button className="mt-5" onClick={() => router.refresh()}><RefreshCw />Try again</Button></div></div></DashboardPage>;

  return <DashboardPage>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-supporting font-medium text-success">{new Intl.DateTimeFormat("en-TZ", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Good day, {name}</h1><p className="mt-1 text-supporting text-muted-foreground">Live operational information from the Tag & Seal ledger.</p></div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4" />Updated {new Intl.DateTimeFormat("en-TZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(data.generatedAt))}</p>
    </div>

    <DashboardStatsGrid>{registryStats.map((stat) => { const Icon = statIcons[stat.key as keyof typeof statIcons] ?? Activity; const note = stat.periodValue === undefined ? stat.note : `- ${number(stat.periodValue)} ${stat.periodLabel ?? "this month"}`; return <DashboardStatCard key={stat.key} label={stat.label} value={stat.displayValue ?? `${number(stat.value)}${stat.unit ? ` ${stat.unit}` : ""}`} note={note} icon={Icon} />; })}</DashboardStatsGrid>

    <DashboardStatsGrid>{eventStats.map((stat) => { const Icon = statIcons[stat.key as keyof typeof statIcons] ?? Activity; const system = stat.category === "system"; return <DashboardStatCard key={stat.key} label={stat.label} value={stat.displayValue ?? `${number(stat.value)}${stat.unit ? ` ${stat.unit}` : ""}`} note={stat.note} icon={system ? undefined : Icon} />; })}</DashboardStatsGrid>

    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
      <AnalyticsCard title="Operational activity" description="Last 30 days of ledger activity grouped by event family." action={<Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/analytics")}>Explore analytics <ArrowRight /></Button>}>
        {data.activityTrend.some((point) => point.total > 0) ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activityTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 4 }} />
                <Bar dataKey="health" name="Health" stackId="events" fill={familyColors.health} />
                <Bar dataKey="production" name="Production" stackId="events" fill={familyColors.production} />
                <Bar dataKey="reproduction" name="Reproduction" stackId="events" fill={familyColors.reproduction} />
                <Bar dataKey="movement" name="Movement" stackId="events" fill={familyColors.movement} />
                <Bar dataKey="growth" name="Growth" stackId="events" fill={familyColors.growth} />
                <Bar dataKey="other" name="Other" stackId="events" fill={familyColors.other} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <AnalyticsEmpty title="No recent operational events" />
        )}
      </AnalyticsCard>

      <AnalyticsCard title="Livestock composition" description="Current registered head count by species.">
        {species.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={species.slice(0, 8)} layout="vertical" margin={{ top: 4, right: 16, left: 18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={82} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }} />
                <Bar dataKey="value" name="Animals" radius={[0, 6, 6, 0]}>
                  {species.slice(0, 8).map((item) => <Cell key={item.name} fill={item.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <AnalyticsEmpty title="No livestock composition" />
        )}
      </AnalyticsCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <AnalyticsCard title="Attention required" description="Operational exceptions that need administrator review."><AttentionList items={data.attention} /></AnalyticsCard>
      <AnalyticsCard title="Production pulse" description="Last 30 days of recorded production quantity.">
        {data.productionTrend.some((point) => point.quantity > 0) ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.productionTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboard-production" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity=".28" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip content={<ChartTooltip unit="L / kg" />} cursor={{ stroke: "var(--primary)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="quantity" name="Quantity" stroke="var(--primary)" strokeWidth={2.5} fill="url(#dashboard-production)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <AnalyticsEmpty title="No recent production records" />
        )}
      </AnalyticsCard>
    </div>

    <div className="grid gap-5">
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between"><div><h2 className="font-semibold">Recent ledger activity</h2><p className="mt-1 text-supporting text-muted-foreground">Latest non-voided events from the backend</p></div><Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/events/calving")}>Events & logs <ArrowRight /></Button></div>
        <div className="mt-5 divide-y">{data.recentActivity.length ? data.recentActivity.map((item) => <div key={item.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted"><Activity className="size-4 text-primary" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="truncate text-xs text-muted-foreground">Subject {item.subjectUuid?.slice(0, 8) ?? "—"} · {item.status ?? "recorded"}</p></div><span className="text-xs text-muted-foreground">{item.occurredAt ? new Intl.DateTimeFormat("en-TZ", { day: "numeric", month: "short" }).format(new Date(item.occurredAt)) : "—"}</span></div>) : <p className="py-12 text-center text-sm text-muted-foreground">No event activity has been recorded.</p>}</div>
      </section>
    </div>
  </DashboardPage>;
}
