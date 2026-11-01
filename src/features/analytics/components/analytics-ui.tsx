"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Download, Printer, Search, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/features/analytics/components/date-range-picker";
import { formatNumber, humanize } from "@/features/analytics/analytics-format";
import type { AnalyticsFarmOption, AnalyticsOption, AnalyticsPreset, AnalyticsReport, AnalyticsStat, AttentionItem } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

export function AnalyticsFilterBar({ preset, from, to, countryId, regionId, farmUuid, countries, regions, farms, loading, onPreset, onRangeChange, onCountry, onRegion, onFarm }: {
  preset: AnalyticsPreset;
  from: string;
  to: string;
  countryId: string;
  regionId: string;
  farmUuid: string;
  countries: AnalyticsOption[];
  regions: AnalyticsOption[];
  farms: AnalyticsFarmOption[];
  loading?: boolean;
  onPreset: (value: AnalyticsPreset) => void;
  onRangeChange: (from: string, to: string) => void;
  onCountry: (value: string) => void;
  onRegion: (value: string) => void;
  onFarm: (value: string) => void;
}) {
  const filteredRegions = regions.filter((item) => countryId === "all" || item.parent === countryId);
  const filteredFarms = farms.filter((item) => (countryId === "all" || item.countryId === countryId) && (regionId === "all" || item.regionId === regionId));
  const presets: Array<{ value: AnalyticsPreset; label: string }> = [
    { value: "today", label: "Today" }, { value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "month", label: "This month" },
  ];

  return <section className="card p-4 sm:p-5" aria-label="Analytics filters" aria-busy={loading}>
    <div className="flex items-center gap-2 text-supporting font-semibold"><SlidersHorizontal className="size-4 text-primary" />Filters</div>
    <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-6">
      <div className="min-w-0">
        <p className="mb-2 text-supporting font-medium text-muted-foreground">Time period</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((item) => <Button key={item.value} type="button" variant={preset === item.value ? "default" : "outline"} aria-pressed={preset === item.value} onClick={() => onPreset(item.value)}>{item.label}</Button>)}
          <DateRangePicker from={from} to={to} active={preset === "custom"} onChange={onRangeChange} />
        </div>
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-supporting font-medium text-muted-foreground">Location</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <ScopeSelect label="Country" value={countryId} onChange={onCountry} options={countries} allLabel="All countries" />
          <ScopeSelect label="Region" value={regionId} onChange={onRegion} options={filteredRegions} allLabel="All regions" />
          <ScopeSelect label="Farm" value={farmUuid} onChange={onFarm} options={filteredFarms} allLabel="All farms" />
        </div>
      </div>
    </div>
  </section>;
}

function ScopeSelect({ label, value, options, allLabel, onChange }: { label: string; value: string; options: AnalyticsOption[]; allLabel: string; onChange: (value: string) => void }) {
  const id = `analytics-${label.toLowerCase()}`;
  return <Field className="gap-1.5">
    <FieldLabel htmlFor={id} className="sr-only">{label}</FieldLabel>
    <FormSelect id={id} value={value} onValueChange={onChange} options={[{ value: "all", label: allLabel }, ...options.map((item) => ({ value: item.value, label: item.label }))]} searchable={options.length > 5} searchPlaceholder={`Search ${label.toLowerCase()}...`} triggerClassName="min-w-0 bg-background" />
  </Field>;
}

export function ChartDownloadButton({ targetId, fileName }: { targetId: string; fileName: string }) {
  const download = () => {
    const chart = document.getElementById(targetId)?.querySelector("svg");
    if (!chart) return;
    const copy = chart.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute("width", String(chart.clientWidth || 1200));
    copy.setAttribute("height", String(chart.clientHeight || 600));
    const originalNodes = [chart, ...chart.querySelectorAll<SVGElement>("*")];
    const copiedNodes = [copy, ...copy.querySelectorAll<SVGElement>("*")];
    originalNodes.forEach((node, index) => {
      const styles = window.getComputedStyle(node);
      const copied = copiedNodes[index];
      if (!copied) return;
      copied.style.fill = styles.fill;
      copied.style.stroke = styles.stroke;
      copied.style.color = styles.color;
      copied.style.fontFamily = styles.fontFamily;
      copied.style.fontSize = styles.fontSize;
      copied.style.opacity = styles.opacity;
    });
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", window.getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "#ffffff");
    copy.insertBefore(background, copy.firstChild);
    const source = new XMLSerializer().serializeToString(copy);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <Button type="button" size="sm" variant="outline" onClick={download}><Download />Download SVG</Button>;
}

export function ChartPrintButton({ targetId, title }: { targetId: string; title: string }) {
  const print = () => {
    const chart = document.getElementById(targetId)?.querySelector("svg");
    if (!chart) return;
    const popup = window.open("", "_blank", "width=1100,height=760");
    if (!popup) return;
    const source = new XMLSerializer().serializeToString(chart);
    popup.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#17221b}h1{font-size:20px;margin:0 0 8px}p{color:#66736b;margin:0 0 28px}svg{width:100%;height:auto;max-height:620px}@media print{body{padding:12mm}}</style></head><body><h1>${title}</h1><p>Tag & Seal · ${new Date().toLocaleString("en-TZ")}</p>${source}<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
    popup.document.close();
  };

  return <Button type="button" size="sm" variant="outline" onClick={print}><Printer />Print</Button>;
}

export function ChartActions({ targetId, fileName, title }: { targetId: string; fileName: string; title: string }) {
  return <div className="flex flex-wrap gap-2"><ChartPrintButton targetId={targetId} title={title} /><ChartDownloadButton targetId={targetId} fileName={fileName} /></div>;
}

export function AnalyticsKpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{children}</div>;
}

export function AnalyticsKpiCard({ stat, icon: Icon }: { stat: AnalyticsStat; icon: LucideIcon }) {
  const positive = (stat.change ?? 0) >= 0;
  return <article className="card p-4"><div className="flex items-start justify-between gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon className="size-4.5" /></span>{stat.change !== null && <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", positive ? "text-success" : "text-danger")}>{positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{Math.abs(stat.change).toLocaleString("en-TZ", { maximumFractionDigits: 1 })}%</span>}</div><p className="mt-4 text-xl font-semibold tabular-nums">{formatNumber(stat.value)}{stat.unit ? <span className="ml-1 text-sm font-medium text-muted-foreground">{stat.unit}</span> : null}</p><p className="mt-1 text-supporting font-medium text-foreground">{stat.label}</p><p className="mt-1 text-supporting text-muted-foreground">{stat.note}</p></article>;
}

export function AnalyticsCard({ title, description, action, children, className }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn("card min-w-0 p-5 sm:p-6", className)}><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-supporting text-muted-foreground">{description}</p>}</div>{action}</div>{children}</section>;
}

export function AnalyticsEmpty({ title = "No analytics available", description = "There is no data for the selected scope and period." }: { title?: string; description?: string }) {
  return <div className="grid min-h-48 place-items-center rounded-xl border border-dashed bg-muted/20 p-6 text-center"><div><p className="font-medium">{title}</p><p className="mt-1 text-supporting text-muted-foreground">{description}</p></div></div>;
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return <div className="space-y-2">{items.map((item) => <Link href={item.href} key={item.key} className="flex items-center gap-3 rounded-xl border bg-background p-3 transition hover:bg-muted/40"><span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold tabular-nums", item.severity === "danger" ? "bg-danger/10 text-danger" : item.severity === "warning" ? "bg-warning/10 text-warning" : item.severity === "success" ? "bg-success/10 text-success" : "bg-muted text-primary")}>{item.value}</span><span className="min-w-0 flex-1"><span className="block text-supporting font-semibold text-foreground">{item.title}</span><span className="mt-0.5 block text-supporting text-muted-foreground">{item.description}</span></span><span className="text-xs font-semibold text-primary">Review →</span></Link>)}</div>;
}

export function AnalyticsReportTable({ report, labels, query, page, pageSize, onQuery, onPage, onPageSize, title }: {
  report: AnalyticsReport;
  labels: Record<string, string>;
  query: string;
  page: number;
  pageSize: number;
  onQuery: (value: string) => void;
  onPage: (value: number) => void;
  onPageSize: (value: number) => void;
  title: string;
}) {
  const filtered = report.rows.filter((row) => !query.trim() || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query.trim().toLowerCase())));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, filtered.length);

  const exportCsv = () => {
    const csv = [report.columns.map((column) => labels[column] ?? humanize(column)), ...filtered.map((row) => report.columns.map((column) => String(row[column] ?? "")))].map((line) => line.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tag-seal-${title.toLowerCase().replaceAll(" ", "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section className="card overflow-hidden">
    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center"><div className="relative flex-1 lg:max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => { onQuery(event.target.value); onPage(1); }} className="pl-10" placeholder={`Search ${title.toLowerCase()}…`} /></div><div className="flex flex-wrap gap-2 lg:ml-auto"><FormSelect value={String(pageSize)} onValueChange={(value) => { onPageSize(Number(value)); onPage(1); }} options={[10, 25, 50, 100].map((size) => ({ value: String(size), label: `${size} rows` }))} searchable={false} size="sm" triggerClassName="w-28 bg-background" /><Button type="button" size="sm" variant="outline" onClick={() => window.print()}><Printer />Print</Button><Button type="button" size="sm" variant="outline" onClick={exportCsv}><Download />CSV</Button></div></div>
    <div className="overflow-x-auto"><Table className="min-w-max"><TableHeader><TableRow><TableHead className="w-14">#</TableHead>{report.columns.map((column) => <TableHead key={column}>{labels[column] ?? humanize(column)}</TableHead>)}</TableRow></TableHeader><TableBody>{visible.length ? visible.map((row, index) => <TableRow key={`${start + index}-${report.columns.map((column) => row[column]).join("-")}`}><TableCell className="text-muted-foreground tabular-nums">{start + index}</TableCell>{report.columns.map((column) => <TableCell key={column} className="text-muted-foreground">{formatCell(column, row[column])}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={report.columns.length + 1} className="h-52 text-center text-supporting text-muted-foreground">No report rows match the selected filters.</TableCell></TableRow>}</TableBody></Table></div>
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-supporting text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Showing {start}–{end} of {filtered.length.toLocaleString("en-TZ")}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => onPage(safePage - 1)}>Previous</Button><span className="px-2 tabular-nums">Page {safePage} of {pageCount}</span><Button size="sm" variant="outline" disabled={safePage >= pageCount} onClick={() => onPage(safePage + 1)}>Next</Button></div></div>
  </section>;
}

function formatCell(key: string, value: string | number | null) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" && (key.toLowerCase().includes("amount") || key.toLowerCase().includes("cost"))) return `TZS ${formatNumber(value)}`;
  if (typeof value === "number") return formatNumber(value);
  if (key.toLowerCase().includes("date") || key.toLowerCase().includes("activity") || key.toLowerCase().includes("occurred")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("en-TZ", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }
  return humanize(value);
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
