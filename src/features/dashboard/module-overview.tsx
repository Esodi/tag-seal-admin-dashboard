"use client";

import Link from "next/link";
import { Briefcase, Gavel, Milk, ShoppingCart, Stethoscope, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { AnalyticsCard, AnalyticsEmpty } from "@/features/analytics/components/analytics-ui";
import type { ApprovalQueueItem, ModuleCard, ModuleTrendPoint } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const moduleIcons = { commerce: ShoppingCart, auction: Gavel, vet: Stethoscope, dairy: Milk, career: Briefcase } as const;
const moduleSeries = [
  { key: "orders", name: "Marketplace orders", color: "#234e38" },
  { key: "auctionSales", name: "Auction sales", color: "#b38936" },
  { key: "vetRequests", name: "Vet requests", color: "#5b7c91" },
  { key: "trips", name: "Dairy trips", color: "#688c53" },
  { key: "applications", name: "Job applications", color: "#936d83" },
] as const;
const queueColors = ["#b4534b", "#a8782a", "#4f718a", "#3f7c54", "#76628a", "#8a928c"];

const compact = new Intl.NumberFormat("en-TZ", { notation: "compact", maximumFractionDigits: 1 });
function moduleValue(card: ModuleCard) {
  if (card.unit === "TZS") return `TZS ${compact.format(card.value)}`;
  return `${card.value.toLocaleString("en-TZ", { maximumFractionDigits: 1 })}${card.unit ? ` ${card.unit}` : ""}`;
}

function Change({ card }: { card: ModuleCard }) {
  if (card.change === null) return <span className="text-xs text-muted-foreground">New this period</span>;
  const Icon = card.direction === "down" ? TrendingDown : TrendingUp;
  return <span className={cn("inline-flex items-center gap-1 text-xs font-medium", card.direction === "down" ? "text-danger" : card.direction === "up" ? "text-success" : "text-muted-foreground")}>
    <Icon className="size-3.5" aria-hidden />{card.change > 0 ? "+" : ""}{card.change}% vs previous 30 days
  </span>;
}

export function ModuleStats({ modules }: { modules: ModuleCard[] }) {
  if (!modules.length) return null;
  return <section aria-label="Platform modules, last 30 days" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    {modules.map((card) => <Link key={card.key} href={card.href} className="rounded-xl outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring">
      <DashboardStatCard className="h-full" label={card.label} value={moduleValue(card)} icon={moduleIcons[card.key]}
        note={<span className="flex flex-col gap-1"><span>{card.note}</span><Change card={card} /></span>} />
    </Link>)}
  </section>;
}

export function ModuleActivityChart({ trend }: { trend: ModuleTrendPoint[] }) {
  const hasData = trend.some((point) => moduleSeries.some((series) => point[series.key] > 0));
  return <AnalyticsCard title="Module activity" description="Daily orders, auction sales, vet requests, dairy trips and job applications over the last 30 days.">
    {hasData ? <div className="h-72">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
        <BarChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 4 }} />
          {moduleSeries.map((series, index) => <Bar key={series.key} dataKey={series.key} name={series.name} stackId="modules" fill={series.color} radius={index === moduleSeries.length - 1 ? [3, 3, 0, 0] : undefined} />)}
        </BarChart>
      </ResponsiveContainer>
    </div> : <AnalyticsEmpty title="No module activity in the last 30 days" />}
  </AnalyticsCard>;
}

export function RevenueChart({ trend }: { trend: ModuleTrendPoint[] }) {
  const hasData = trend.some((point) => point.marketplaceRevenue > 0 || point.auctionRevenue > 0);
  return <AnalyticsCard title="Sales revenue" description="Completed marketplace orders and paid auction sales per day, in TZS.">
    {hasData ? <div className="h-72">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
        <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue-marketplace" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#234e38" stopOpacity=".3" /><stop offset="100%" stopColor="#234e38" stopOpacity="0" /></linearGradient>
            <linearGradient id="revenue-auction" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b38936" stopOpacity=".3" /><stop offset="100%" stopColor="#b38936" stopOpacity="0" /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(value: number) => compact.format(value)} />
          <Tooltip content={<ChartTooltip unit="TZS" />} cursor={{ stroke: "var(--primary)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
          <Area type="monotone" dataKey="marketplaceRevenue" name="Marketplace" stroke="#234e38" strokeWidth={2.5} fill="url(#revenue-marketplace)" />
          <Area type="monotone" dataKey="auctionRevenue" name="Auctions" stroke="#b38936" strokeWidth={2.5} fill="url(#revenue-auction)" />
        </AreaChart>
      </ResponsiveContainer>
    </div> : <AnalyticsEmpty title="No sales revenue in the last 30 days" />}
  </AnalyticsCard>;
}

export function ApprovalQueueChart({ queue }: { queue: ApprovalQueueItem[] }) {
  const total = queue.reduce((sum, item) => sum + item.value, 0);
  return <AnalyticsCard title="Approval queue" description={total ? `${total.toLocaleString("en-TZ")} items are waiting for an administrator.` : "Nothing is waiting for approval."}>
    {total ? <>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
          <BarChart data={queue} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }} />
            <Bar dataKey="value" name="Waiting" radius={[0, 6, 6, 0]}>{queue.map((item, index) => <Cell key={item.key} fill={queueColors[index % queueColors.length]} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {queue.filter((item) => item.value > 0).map((item) => <li key={item.key}><Link href={item.href} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted">{item.name}<span className="rounded-full bg-muted px-1.5 tabular-nums">{item.value}</span></Link></li>)}
      </ul>
    </> : <AnalyticsEmpty title="All caught up" description="New registrations and payments to verify will appear here." />}
  </AnalyticsCard>;
}
