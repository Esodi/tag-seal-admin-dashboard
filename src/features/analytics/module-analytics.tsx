"use client";

import { CheckCircle2, CircleDashed, FlaskConical, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { AnalyticsCard, AnalyticsEmpty, ChartDownloadButton } from "@/features/analytics/components/analytics-ui";
import { formatNumber } from "@/features/analytics/analytics-format";
import type { Hypothesis, ModuleAnalysis, ModuleKey, ModuleKpi } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

type ChartSpec = { key: string; title: string; description: string; series: Array<{ key: string; name: string; color: string }>; layout?: "vertical" | "horizontal"; unit?: string };

/** The business question each module tab answers, and the charts that support it. */
const moduleSpecs: Record<ModuleKey, { goal: string; charts: ChartSpec[] }> = {
  commerce: {
    goal: "Is the marketplace turning listings into completed, undisputed sales?",
    charts: [
      { key: "funnel", title: "Order funnel", description: "How many orders reach each step from placement to ownership transfer.", series: [{ key: "value", name: "Orders", color: "#234e38" }] },
      { key: "status", title: "Orders by status", description: "Where orders placed in this period are now.", series: [{ key: "value", name: "Orders", color: "#5b7c91" }], layout: "vertical" },
    ],
  },
  auction: {
    goal: "Are auctions selling lots and collecting payment on time?",
    charts: [
      { key: "sellThroughByMode", title: "Sell-through by auction type", description: "Share of decided lots that sold, ring versus online.", series: [{ key: "value", name: "Sold", color: "#b38936" }], unit: "%" },
      { key: "salesStatus", title: "Auction sales by payment status", description: "Winning bids by payment progress.", series: [{ key: "value", name: "Sales", color: "#234e38" }], layout: "vertical" },
    ],
  },
  vet: {
    goal: "Do farmers get a veterinarian quickly, and are visits completed?",
    charts: [
      { key: "responseByUrgency", title: "Time to accept by urgency", description: "Average minutes from request to a vet accepting it.", series: [{ key: "value", name: "Minutes", color: "#b4534b" }], unit: "min" },
      { key: "status", title: "Requests by status", description: "Current status of requests made in this period.", series: [{ key: "value", name: "Requests", color: "#5b7c91" }], layout: "vertical" },
    ],
  },
  dairy: {
    goal: "Is milk reaching factories in full and at the right quality?",
    charts: [
      { key: "byFactory", title: "Accepted and rejected milk by factory", description: "Litres each factory accepted or rejected.", series: [{ key: "accepted", name: "Accepted", color: "#3f7c54" }, { key: "rejected", name: "Rejected", color: "#b4534b" }], unit: "L" },
      { key: "losses", title: "Where milk is lost", description: "Litres lost on the road compared with litres rejected at the factory.", series: [{ key: "value", name: "Litres", color: "#a8782a" }], unit: "L", layout: "vertical" },
    ],
  },
  career: {
    goal: "Are jobs attracting applicants, and are employers reviewing them?",
    charts: [
      { key: "status", title: "Applications by status", description: "Review progress of applications made in this period.", series: [{ key: "value", name: "Applications", color: "#936d83" }], layout: "vertical" },
    ],
  },
};

const resultStyles = {
  supported: { label: "Supported", icon: CheckCircle2, className: "border-success/30 bg-success/5 text-success" },
  not_supported: { label: "Not supported", icon: XCircle, className: "border-danger/30 bg-danger/5 text-danger" },
  insufficient: { label: "Not enough data", icon: CircleDashed, className: "border-border bg-muted/30 text-muted-foreground" },
} as const;

function kpiValue(kpi: ModuleKpi) {
  if (kpi.unit === "TZS") return `TZS ${formatNumber(kpi.value)}`;
  if (kpi.unit === "%") return `${formatNumber(kpi.value)}%`;
  return `${formatNumber(kpi.value)}${kpi.unit ? ` ${kpi.unit}` : ""}`;
}

export function ModuleAnalyticsPanel({ module, analysis }: { module: ModuleKey; analysis?: ModuleAnalysis }) {
  if (!analysis) return <AnalyticsEmpty title="No analysis for this module" description="The backend did not return module figures for this period." />;
  const spec = moduleSpecs[module];
  return <>
    <div className="rounded-xl border bg-muted/20 p-4"><p className="text-supporting font-semibold">Business question</p><p className="mt-1 text-supporting text-muted-foreground">{spec.goal}</p></div>
    <section aria-label="Key figures" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {analysis.kpis.map((kpi) => <article key={kpi.key} className="rounded-xl border bg-card p-4"><p className="text-supporting font-medium text-muted-foreground">{kpi.label}</p><p className="mt-2 text-xl font-semibold tabular-nums">{kpiValue(kpi)}</p></article>)}
    </section>
    <section aria-label="Hypotheses" className="grid gap-4 lg:grid-cols-2">{analysis.hypotheses.map((item) => <HypothesisCard key={item.key} item={item} />)}</section>
    <div className={cn("grid gap-5", spec.charts.length > 1 && "xl:grid-cols-2")}>
      {spec.charts.map((chart) => <ModuleChart key={chart.key} module={module} spec={chart} data={analysis.charts[chart.key] ?? []} />)}
    </div>
  </>;
}

function HypothesisCard({ item }: { item: Hypothesis }) {
  const style = resultStyles[item.result];
  const Icon = style.icon;
  return <article className="card flex flex-col gap-3 p-5">
    <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-2"><FlaskConical className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><h3 className="font-semibold">{item.question}</h3></div>
      <Badge variant="outline" className={cn("shrink-0 gap-1", style.className)}><Icon className="size-3.5" aria-hidden />{style.label}</Badge></div>
    <p className="text-supporting text-muted-foreground"><span className="font-medium text-foreground">Hypothesis: </span>{item.hypothesis}</p>
    <p className="text-supporting"><span className="font-medium">Evidence ({item.metric.toLowerCase()}): </span>{item.evidence}</p>
    {item.groups.length > 0 && <dl className="grid gap-2 sm:grid-cols-2">{item.groups.map((group) => <div key={group.name} className="rounded-lg border bg-background p-3"><dt className="text-xs text-muted-foreground">{group.name}</dt><dd className="mt-1 font-semibold tabular-nums">{formatNumber(group.value)}{item.unit === "%" ? "%" : item.unit ? ` ${item.unit}` : ""}<span className="ml-2 text-xs font-normal text-muted-foreground">n = {formatNumber(group.sample)}</span></dd></div>)}</dl>}
  </article>;
}

function ModuleChart({ module, spec, data }: { module: ModuleKey; spec: ChartSpec; data: Array<{ name: string } & Record<string, string | number>> }) {
  const chartId = `module-${module}-${spec.key}`;
  const vertical = spec.layout === "vertical";
  const hasData = data.some((row) => spec.series.some((series) => Number(row[series.key] ?? 0) > 0));
  return <AnalyticsCard title={spec.title} description={spec.description} action={hasData ? <ChartDownloadButton targetId={chartId} fileName={`tag-seal-${chartId}`} /> : undefined}>
    {hasData ? <div id={chartId} className="h-72">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
        <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, left: vertical ? 24 : -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={!vertical ? false : true} horizontal={vertical ? false : true} stroke="var(--border)" />
          {vertical ? <>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={130} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          </> : <>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} interval={0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          </>}
          <Tooltip content={<ChartTooltip unit={spec.unit} />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }} />
          {spec.series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {spec.series.map((series) => <Bar key={series.key} dataKey={series.key} name={series.name} fill={series.color} radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    </div> : <AnalyticsEmpty title="No records in this period" />}
  </AnalyticsCard>;
}
