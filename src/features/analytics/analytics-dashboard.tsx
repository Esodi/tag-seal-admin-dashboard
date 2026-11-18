"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, BarChart3, Beef, Building2, FileBarChart, HeartPulse, LineChart as LineChartIcon, Milk, RefreshCw } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { FormSelect } from "@/components/ui/form-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { formatNumber, formatReportRange, formatReportValue, humanize, todayInEat } from "@/features/analytics/analytics-format";
import { FinanceReportAnalytics } from "@/features/analytics/finance-report-analytics";
import { ModuleAnalyticsPanel } from "@/features/analytics/module-analytics";
import { AnalyticsCard, AnalyticsEmpty, AnalyticsFilterBar, AnalyticsKpiCard, AnalyticsKpiGrid, AnalyticsReportTable, AttentionList, ChartActions, ChartDownloadButton } from "@/features/analytics/components/analytics-ui";
import type { AnalyticsApiResponse, AnalyticsPreset, AnalyticsReportKey, AnalyticsResponse, AnalyticsTab, AnalyticsView, ModuleKey } from "@/features/analytics/types";
import { authenticatedFetch } from "@/lib/auth/session";

const familyColors: Record<string, string> = { health: "#b4534b", production: "#3f7c54", reproduction: "#a8782a", movement: "#4f718a", growth: "#76628a", other: "#8a928c" };
const speciesColors = ["#234e38", "#5f8650", "#b38936", "#52738a", "#846582", "#8a928c"];
const statIcons = { animals: Beef, events: Activity, farms: Building2, milk: Milk, births: LineChartIcon, health: HeartPulse } as const;
const reportLabels: Record<string, string> = {
  speciesName: "Species", unitType: "Record type", lifecycleStatus: "Lifecycle status", subjects: "Records", headCount: "Head count",
  eventCode: "Event", eventName: "Event", family: "Event family", events: "Events", lastOccurredAt: "Last recorded", subject: "Animal / group", species: "Species", occurredAt: "Recorded date",
  farmName: "Farm", country: "Country", region: "Region", animals: "Animals", lastActivity: "Last activity", farms: "Farms", regions: "Regions",
  productionDate: "Production date", productCode: "Product", unit: "Unit", quantity: "Quantity", damagedQuantity: "Damaged",
  farmerNo: "Farmer no.", farmerName: "Farmer", phone: "Phone", transactionType: "Type", reference: "Reference", source: "Source", amount: "Amount", transactionDate: "Date",
  billNo: "Bill no.", issuerType: "Issued by role", issuerName: "Issued by", requestRef: "Request ref.", subjectType: "Subject", billDate: "Bill date",
  paymentMethod: "Payment method", paymentReference: "Payment ref.", billedAmount: "Billed", billingStatus: "Billing status", totalCost: "Total cost", expenseDate: "Expense date",
  referenceNo: "Reference no.", ownerName: "Owner", size: "Size", sizeUnit: "Unit", legalStatus: "Legal status",
  fullName: "Full name", email: "Email", role: "Account role", roleTitle: "Farm role", gender: "Gender", createdAt: "Created",
  officerNo: "Officer no.", organization: "Organization", specialization: "Specialization", verified: "Verified", invites: "Invites",
  extensionOfficer: "Extension officer", accessCode: "Access code", accountStatus: "Account status", username: "Username", address: "Address",
  animalName: "Animal", identificationNumber: "Identification no.", milkingMethod: "Milking method", session: "Session", litres: "Litres", eventDate: "Milking date",
  identifier: "Identifier", identifierType: "Identifier type", assignedAt: "Assigned", code: "Code", name: "Name", shortName: "Short name", parent: "Parent",
  group: "Group", lot: "Lot", dose: "Dose", formulationType: "Formulation", action: "Action", entityType: "Record type", actor: "Actor", ipAddress: "IP address",
  orderCode: "Order code", seller: "Seller", buyer: "Buyer", settlementVerifiedAt: "Payment verified", transferredAt: "Ownership transferred", listingTitle: "Listing", listingType: "Listing type",
  askingPrice: "Asking price", available: "Available", sold: "Sold", receiptNo: "Receipt no.", auction: "Auction", channel: "Channel", paidAt: "Paid", centre: "Centre", mode: "Auction type",
  scheduledAt: "Scheduled", lots: "Lots", soldLots: "Lots sold", grossSales: "Gross sales", vet: "Veterinarian", problem: "Problem", urgency: "Urgency", acceptedAt: "Accepted", completedAt: "Completed",
  rating: "Farmer rating", tripNumber: "Trip no.", transporter: "Transporter", vehicle: "Vehicle", factory: "Factory", approval: "Approval", deliveryNote: "Delivery note",
  dispatchedLitres: "Dispatched (L)", receivedLitres: "Received (L)", acceptedLitres: "Accepted (L)", temperature: "Temperature (°C)", sealsIntact: "Seals intact", receivedAt: "Received", job: "Job", applicant: "Applicant",
};

function todayIso() { return todayInEat(); }
/** Calendar ranges are computed in East Africa Time so "today" never slips to yesterday in UTC. */
function presetRange(preset: AnalyticsPreset) {
  const end = todayInEat();
  if (preset === "today") return { from: end, to: end };
  if (preset === "7" || preset === "30") return { from: todayInEat(-(Number(preset) - 1)), to: end };
  if (preset === "month") return { from: `${end.slice(0, 8)}01`, to: end };
  return { from: todayInEat(-29), to: end };
}
const moduleTabs: Array<{ value: ModuleKey; label: string }> = [
  { value: "commerce", label: "Marketplace" }, { value: "auction", label: "Auctions" }, { value: "vet", label: "Veterinary" }, { value: "dairy", label: "Dairy logistics" }, { value: "career", label: "Careers" },
];

export function AnalyticsDashboard({ initialData, initialError }: { initialData: AnalyticsResponse | null; initialError: string | null }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(!initialData);
  const [view, setView] = useState<AnalyticsView>("analytics");
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [report, setReport] = useState<AnalyticsReportKey>(initialData?.reportCatalog[0]?.value ?? "livestock");
  const [eventType, setEventType] = useState(initialData?.eventTypes[0]?.value ?? "");
  const [preset, setPreset] = useState<AnalyticsPreset>("30");
  const [from, setFrom] = useState(initialData?.range.from ?? presetRange("30").from);
  const [to, setTo] = useState(initialData?.range.to ?? todayIso());
  const [countryId, setCountryId] = useState("all");
  const [regionId, setRegionId] = useState("all");
  const [farmUuid, setFarmUuid] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const requestId = useRef(0);
  const queryString = useMemo(() => {
    const params = new URLSearchParams({ from, to });
    if (countryId !== "all") params.set("countryId", countryId);
    if (regionId !== "all") params.set("regionId", regionId);
    if (farmUuid !== "all") params.set("farmUuid", farmUuid);
    return params.toString();
  }, [countryId, farmUuid, from, regionId, to]);
  const lastSelection = useRef(queryString);
  const selectedReport = useMemo(() => {
    if (!data) return null;
    const source = data.reports[report];
    if (report !== "events" || !eventType) return source;
    return { ...source, rows: source.rows.filter((row) => row.eventCode === eventType) };
  }, [data, eventType, report]);

  const load = useCallback(async (selectedQuery: string, signal?: AbortSignal) => {
    const id = ++requestId.current;
    setLoading(true); setError(null);
    try {
      const response = await authenticatedFetch(`/api/admin/analytics?${selectedQuery}`, { cache: "no-store", signal });
      const payload = await response.json() as AnalyticsApiResponse & { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Analytics could not be loaded.");
      if (!signal?.aborted && id === requestId.current) setData(payload.data);
    } catch (failure) {
      if (signal?.aborted || id !== requestId.current) return;
      const message = failure instanceof Error ? failure.message : "Analytics could not be loaded.";
      setError(message);
      toast.error(message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lastSelection.current === queryString) return;
    lastSelection.current = queryString;
    if (!from || !to || from > to) return;

    requestId.current += 1;
    setLoading(true);
    setError(null);
    setPage(1);
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void load(queryString, controller.signal); }, 150);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [from, to, queryString, load]);

  useEffect(() => {
    if (!data?.eventTypes.length) return;
    if (!data.eventTypes.some((item) => item.value === eventType)) setEventType(data.eventTypes[0].value);
  }, [data, eventType]);

  const choosePreset = (value: AnalyticsPreset) => {
    setPreset(value);
    const range = presetRange(value);
    setFrom(range.from); setTo(range.to);
  };
  const chooseCountry = (value: string) => { setCountryId(value); setRegionId("all"); setFarmUuid("all"); };
  const chooseRegion = (value: string) => { setRegionId(value); setFarmUuid("all"); };
  const chooseReport = (value: AnalyticsReportKey) => { setReport(value); setQuery(""); setPage(1); };
  const reportTitle = data?.reportCatalog.find((item) => item.value === report)?.label ?? humanize(report);
  const updated = data ? new Intl.DateTimeFormat("en-TZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(data.generatedAt)) : "—";

  if (!data && error) return <div className="mx-auto max-w-7xl space-y-6"><DashboardHeader eyebrow="Analytics" title="Reports & Analysis" description="Operational intelligence across livestock, events, farms and geography." /><div className="card grid min-h-96 place-items-center p-8 text-center"><div><HeartPulse className="mx-auto size-8 text-danger" /><h2 className="mt-4 font-semibold">Analytics unavailable</h2><p className="mt-2 text-supporting text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => void load(queryString)}><RefreshCw />Try again</Button></div></div></div>;

  return <div className="mx-auto max-w-7xl space-y-6">
    <DashboardHeader eyebrow="Analytics" title={view === "analytics" ? "Reports & Analysis" : reportTitle} description={view === "analytics" ? "Decision-ready livestock, production, marketplace, auction, veterinary, dairy and career intelligence." : `Detailed ${reportTitle.toLowerCase()} records for the selected scope and period.`} actions={<div className="flex rounded-xl border bg-card p-1"><Button size="sm" variant={view === "analytics" ? "default" : "ghost"} onClick={() => setView("analytics")}><LineChartIcon />Analytics</Button><Button size="sm" variant={view === "reports" ? "default" : "ghost"} onClick={() => setView("reports")}><FileBarChart />Reports</Button></div>} />

    {data && <AnalyticsFilterBar preset={preset} from={from} to={to} countryId={countryId} regionId={regionId} farmUuid={farmUuid} countries={data.filters.countries} regions={data.filters.regions} farms={data.filters.farms} loading={loading} onPreset={choosePreset} onRangeChange={(start, end) => { setPreset("custom"); setFrom(start); setTo(end); }} onCountry={chooseCountry} onRegion={chooseRegion} onFarm={setFarmUuid} />}
    <div className="flex flex-wrap items-center justify-between gap-2 text-supporting text-muted-foreground" aria-live="polite"><span>{formatReportRange(from, to)}{countryId !== "all" || regionId !== "all" || farmUuid !== "all" ? " · Scoped view" : " · All registered operations"}</span><span>{loading ? "Updating results…" : error ? "Could not update · showing previous results" : `Updated ${updated}`}</span></div>

    {data && view === "analytics" ? <>
      <AnalyticsKpiGrid>{data.stats.map((stat) => { const Icon = statIcons[stat.key as keyof typeof statIcons] ?? BarChart3; return <AnalyticsKpiCard key={stat.key} stat={stat} icon={Icon} />; })}</AnalyticsKpiGrid>
      <Tabs value={tab} onValueChange={(value) => setTab(value as AnalyticsTab)}><TabsList variant="line" className="max-w-full overflow-x-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="livestock">Livestock</TabsTrigger><TabsTrigger value="events">Events</TabsTrigger><TabsTrigger value="geography">Countries & regions</TabsTrigger><TabsTrigger value="production">Production & health</TabsTrigger>{moduleTabs.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}</TabsList>
        <TabsContent value="overview" className="space-y-5"><OverviewAnalytics data={data} /></TabsContent>
        <TabsContent value="livestock" className="space-y-5"><LivestockAnalytics data={data} /></TabsContent>
        <TabsContent value="events" className="space-y-5"><EventAnalytics data={data} /></TabsContent>
        <TabsContent value="geography" className="space-y-5"><GeographyAnalytics data={data} /></TabsContent>
        <TabsContent value="production" className="space-y-5"><ProductionAnalytics data={data} /></TabsContent>
        {moduleTabs.map((item) => <TabsContent key={item.value} value={item.value} className="space-y-5"><ModuleAnalyticsPanel module={item.value} analysis={data.modules?.[item.value]} /></TabsContent>)}
      </Tabs>
    </> : data ? <>
      <div className="card grid gap-3 p-4 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end"><div><p className="mb-2 text-supporting font-semibold">Report type</p><FormSelect value={report} onValueChange={chooseReport} options={data.reportCatalog.map((item) => ({ value: item.value, label: `${item.group} · ${item.label}` }))} searchable searchPlaceholder="Search all reports..." triggerClassName="bg-background" /></div><p className="text-supporting text-muted-foreground">{data.reportCatalog.find((item) => item.value === report)?.description}</p></div>
      {report === "events" && data.eventTypes.length ? <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-supporting font-semibold">Event type</p><p className="mt-1 text-supporting text-muted-foreground">Choose the event records to include in the table and export.</p></div><FormSelect value={eventType} onValueChange={(value) => { setEventType(value); setQuery(""); setPage(1); }} options={data.eventTypes.map((item) => ({ value: item.value, label: `${item.label} (${formatNumber(item.count)})` }))} searchable={data.eventTypes.length > 5} searchPlaceholder="Search event types..." triggerClassName="w-full bg-background sm:w-72" /></div> : null}
      {report === "milkings" ? <MilkingReportAnalytics data={data} /> : null}
      {(report === "finance" || report === "bills" || report === "vetBills" || report === "vetPracticeExpenses") && selectedReport ? (
        <FinanceReportAnalytics reportKey={report} report={selectedReport} />
      ) : null}
      {selectedReport && <AnalyticsReportTable report={selectedReport} labels={reportLabels} query={query} page={page} pageSize={pageSize} onQuery={setQuery} onPage={setPage} onPageSize={setPageSize} title={report === "events" ? data.eventTypes.find((item) => item.value === eventType)?.label ?? reportTitle : reportTitle} />}
    </> : null}
  </div>;
}

function OverviewAnalytics({ data }: { data: AnalyticsResponse }) {
  return <><div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]"><ActivityChart data={data} /><SpeciesChart data={data} /></div><div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><AnalyticsCard title="Attention required" description="Operational exceptions that deserve administrator review."><AttentionList items={data.attention} /></AnalyticsCard><TopFarms data={data} /></div></>;
}

function LivestockAnalytics({ data }: { data: AnalyticsResponse }) {
  const statuses = useMemo(() => aggregate(data.reports.livestock.rows, "lifecycleStatus", "headCount"), [data]);
  const units = useMemo(() => aggregate(data.reports.livestock.rows, "unitType", "headCount"), [data]);
  return <><div className="grid gap-5 xl:grid-cols-2"><SpeciesChart data={data} /><SimpleHorizontalChart title="Lifecycle status" description="Current head count by animal lifecycle state." data={statuses} color="#5f8650" /></div><div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><SimpleHorizontalChart title="Individual and group records" description="Head count represented by each registration mode." data={units} color="#52738a" /><AnalyticsCard title="Livestock scope" description="A compact report preview; use Reports for search and export."><MiniRows report={data.reports.livestock} columns={["speciesName", "lifecycleStatus", "headCount"]} /></AnalyticsCard></div></>;
}

function EventAnalytics({ data }: { data: AnalyticsResponse }) {
  const eventTypes = data.eventTypes.map((item) => ({ name: item.label, value: item.count }));
  return <><ActivityChart data={data} /><div className="grid gap-5 xl:grid-cols-2"><SimpleHorizontalChart title="Events by family" description="Non-voided events grouped into operational families." data={data.eventsByFamily} color="#b38936" /><SimpleHorizontalChart title="Most recorded event types" description="Event volume by the selected date and location scope." data={eventTypes} color="#52738a" /></div></>;
}

function GeographyAnalytics({ data }: { data: AnalyticsResponse }) {
  const countries = data.reports.countries.rows.slice(0, 10).map((row) => ({ name: String(row.country), value: Number(row.animals) }));
  const regions = data.regionalCoverage.rows.slice(0, 10).map((row) => ({ name: String(row.region), value: Number(row.animals) }));
  return <><div className="grid gap-5 xl:grid-cols-2"><SimpleHorizontalChart title="Livestock by country" description="Current registered head count across countries." data={countries} color="#234e38" /><SimpleHorizontalChart title="Livestock by region" description="Top regions by current registered head count." data={regions} color="#52738a" /></div><AnalyticsCard title="Regional operational coverage" description="Farms, animals and selected-period event volume by region."><MiniRows report={data.regionalCoverage} columns={["country", "region", "farms", "animals", "events"]} limit={12} /></AnalyticsCard></>;
}

function ProductionAnalytics({ data }: { data: AnalyticsResponse }) {
  const health = data.healthSummary.rows.slice(0, 8).map((row) => ({ name: humanize(String(row.eventCode)), value: Number(row.events) }));
  return <><div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><ProductionChart data={data} /><SimpleHorizontalChart title="Health interventions" description="Selected-period health events by event type." data={health} color="#b4534b" /></div><div className="grid gap-5 xl:grid-cols-2"><AnalyticsCard title="Production records" description="Daily products, quantities and contributing subjects."><MiniRows report={data.productionRecords} columns={["productionDate", "productCode", "quantity", "unit", "subjects"]} /></AnalyticsCard><AnalyticsCard title="Health attention" description="System and data-quality signals affecting field operations."><AttentionList items={data.attention.filter((item) => ["untagged", "sync-conflicts", "failed-jobs"].includes(item.key))} /></AnalyticsCard></div></>;
}

function MilkingReportAnalytics({ data }: { data: AnalyticsResponse }) {
  const [breakdown, setBreakdown] = useState<"farm" | "farmer" | "animal">("farm");
  const breakdowns = { farm: data.milkingAnalysis.byFarm, farmer: data.milkingAnalysis.byFarmer, animal: data.milkingAnalysis.byAnimal };
  const label = breakdown === "farm" ? "Farm" : breakdown === "farmer" ? "Farmer" : "Animal";
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><AnalyticsCard title="Total milk" description="Selected period and scope."><p className="text-2xl font-semibold tabular-nums">{formatNumber(data.milkingAnalysis.totalLitres)} <span className="text-sm text-muted-foreground">L</span></p></AnalyticsCard><AnalyticsCard title="Milking records" description="Individual recorded sessions."><p className="text-2xl font-semibold tabular-nums">{formatNumber(data.milkingAnalysis.records)}</p></AnalyticsCard><AnalyticsCard title="Average per record" description="Mean volume for each session."><p className="text-2xl font-semibold tabular-nums">{formatNumber(data.milkingAnalysis.averageLitres)} <span className="text-sm text-muted-foreground">L</span></p></AnalyticsCard></div><div className="card grid gap-3 p-4 sm:grid-cols-[18rem_1fr] sm:items-end"><div><p className="mb-2 text-supporting font-semibold">Compare milk production by</p><FormSelect value={breakdown} onValueChange={(value) => setBreakdown(value as "farm" | "farmer" | "animal")} options={[{ value: "farm", label: "Farm" }, { value: "farmer", label: "Farmer / owner" }, { value: "animal", label: "Animal" }]} triggerClassName="bg-background" /></div><p className="text-supporting text-muted-foreground">The graph, print view and download update automatically for this comparison.</p></div><div className="grid gap-5 xl:grid-cols-2"><SimpleHorizontalChart title={`Milk production by ${label.toLowerCase()}`} description={`Total litres grouped by ${label.toLowerCase()} for this report scope.`} data={breakdowns[breakdown]} color="#52738a" /><MilkingTrendChart data={data} /></div></div>;
}

function MilkingTrendChart({ data }: { data: AnalyticsResponse }) {
  const chartId = "milking-records-trend-chart";
  return <AnalyticsCard title="Milking trend" description="Daily litres recorded across the selected period." action={<ChartActions targetId={chartId} fileName="tag-seal-milking-trend" title="Milking trend" />}>{data.milkingAnalysis.trend.some((point) => point.quantity > 0) ? <div id={chartId} className="h-72"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}><AreaChart data={data.milkingAnalysis.trend} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip content={<ChartTooltip unit="L" />} /><Area type="monotone" dataKey="quantity" name="Litres" stroke="var(--primary)" strokeWidth={2.5} fill="var(--primary)" fillOpacity={0.16} /></AreaChart></ResponsiveContainer></div> : <AnalyticsEmpty title="No milking records" />}</AnalyticsCard>;
}

function ActivityChart({ data }: { data: AnalyticsResponse }) {
  return <AnalyticsCard title="Operational activity trend" description="Weekly or daily ledger events grouped by operational family." action={<ChartDownloadButton targetId="activity-trend-chart" fileName="tag-seal-operational-activity" />}>{data.activityTrend.some((point) => point.total > 0) ? <div id="activity-trend-chart" className="h-80"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}><BarChart data={data.activityTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 4 }} /><Bar dataKey="health" name="Health" stackId="events" fill={familyColors.health} /><Bar dataKey="production" name="Production" stackId="events" fill={familyColors.production} /><Bar dataKey="reproduction" name="Reproduction" stackId="events" fill={familyColors.reproduction} /><Bar dataKey="movement" name="Movement" stackId="events" fill={familyColors.movement} /><Bar dataKey="growth" name="Growth" stackId="events" fill={familyColors.growth} /><Bar dataKey="other" name="Other" stackId="events" fill={familyColors.other} radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div> : <AnalyticsEmpty title="No operational events" />}</AnalyticsCard>;
}

function SpeciesChart({ data }: { data: AnalyticsResponse }) {
  return <AnalyticsCard title="Livestock composition" description="Current head count by species in the selected geographic scope." action={<ChartDownloadButton targetId="species-composition-chart" fileName="tag-seal-livestock-composition" />}>{data.animalsBySpecies.length ? <div id="species-composition-chart" className="h-80"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}><BarChart data={data.animalsBySpecies.slice(0, 8)} layout="vertical" margin={{ top: 4, right: 16, left: 18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><YAxis type="category" dataKey="name" width={82} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }} /><Bar dataKey="value" name="Animals" radius={[0, 6, 6, 0]}>{data.animalsBySpecies.slice(0, 8).map((item, index) => <Cell key={item.name} fill={speciesColors[index % speciesColors.length]} />)}</Bar></BarChart></ResponsiveContainer></div> : <AnalyticsEmpty title="No livestock composition" />}</AnalyticsCard>;
}

function ProductionChart({ data }: { data: AnalyticsResponse }) {
  return <AnalyticsCard title="Production pulse" description="Recorded production quantities across the selected period." action={<ChartDownloadButton targetId="production-pulse-chart" fileName="tag-seal-production-pulse" />}>{data.productionTrend.some((point) => point.quantity > 0) ? <div id="production-pulse-chart" className="h-80"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}><AreaChart data={data.productionTrend} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}><defs><linearGradient id="production-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".28" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} minTickGap={18} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip content={<ChartTooltip unit="L / kg" />} cursor={{ stroke: "var(--primary)", strokeWidth: 1.5, strokeDasharray: "4 4" }} /><Area type="monotone" dataKey="quantity" name="Quantity" stroke="var(--primary)" strokeWidth={2.5} fill="url(#production-fill)" /></AreaChart></ResponsiveContainer></div> : <AnalyticsEmpty title="No production records" />}</AnalyticsCard>;
}

function SimpleHorizontalChart({ title, description, data, color }: { title: string; description: string; data: Array<{ name: string; value: number }>; color: string }) {
  const chartId = `analytics-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <AnalyticsCard title={title} description={description} action={<ChartDownloadButton targetId={chartId} fileName={`tag-seal-${chartId.replace("analytics-", "")}`} />}>{data.length ? <div id={chartId} className="h-72"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}><BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><YAxis type="category" dataKey="name" width={94} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }} /><Bar dataKey="value" radius={[0, 6, 6, 0]} fill={color} /></BarChart></ResponsiveContainer></div> : <AnalyticsEmpty />}</AnalyticsCard>;
}

export function TopFarms({ data }: { data: AnalyticsResponse }) {
  return <AnalyticsCard title="Most active farms" description="Combined livestock coverage and selected-period event activity."><div className="space-y-3">{data.topFarms.length ? data.topFarms.slice(0, 6).map((farm, index) => <div key={farm.farmUuid ?? `${farm.farmName}-${index}`} className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-supporting font-semibold">{farm.farmName}</p><p className="truncate text-supporting text-muted-foreground">{farm.region} · {farm.country}</p></div><div className="text-right"><p className="text-supporting font-semibold tabular-nums">{formatNumber(farm.events)} events</p><p className="text-supporting text-muted-foreground">{formatNumber(farm.animals)} animals</p></div></div>) : <AnalyticsEmpty />}</div></AnalyticsCard>;
}

function MiniRows({ report, columns, limit = 8 }: { report: { rows: Array<Record<string, string | number | null>> }; columns: string[]; limit?: number }) {
  return report.rows.length ? <div className="min-w-0"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column} >{reportLabels[column] ?? humanize(column)}</TableHead>)}</TableRow></TableHeader><TableBody>{report.rows.slice(0, limit).map((row, index) => <TableRow key={index} className="hover:bg-muted/30">{columns.map((column) => <TableCell key={column} className="text-muted-foreground">{formatReportValue(column, row[column])}</TableCell>)}</TableRow>)}</TableBody></Table></div> : <AnalyticsEmpty />;
}

function aggregate(rows: Array<Record<string, string | number | null>>, key: string, valueKey: string) {
  const result = new Map<string, number>();
  for (const row of rows) { const name = humanize(String(row[key] ?? "Unknown")); result.set(name, (result.get(name) ?? 0) + Number(row[valueKey] ?? 0)); }
  return [...result].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

