"use client";

import { BulkRecordAction } from "@/components/ui/bulk-record-action";
import { RecordPagination } from "@/components/ui/record-pagination";
import { formatRecordDate } from "@/lib/resource-table";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TableTabSection, TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { IdCard, Plus, RefreshCw, Search, Truck } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatNumber } from "@/components/ui/stat-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authenticatedFetch } from "@/lib/auth/session";
import { TransporterFleetActions } from "./transporter-fleet-actions";
import { TransporterFleetForm } from "./transporter-fleet-form";
import { driverName, type FleetKind, type FleetResponse, type FleetRow, type TransportDriverRow, type TransportVehicleRow } from "./transporter-registry-types";
import { vehicleColorName } from "./vehicle-colors";

type Column = { label: string; render: (row: FleetRow) => ReactNode; className?: string };

const unassigned = <span className="text-muted-foreground">Unassigned</span>;

const vehicleColumns: Column[] = [
  { label: "Plate", render: (row) => <span className="font-medium">{(row as TransportVehicleRow).registration_number}</span> },
  { label: "Transporter", render: (row) => row.company_name },
  { label: "Type", render: (row) => [(row as TransportVehicleRow).vehicle_type, vehicleColorName((row as TransportVehicleRow).color)].filter(Boolean).join(" · ") || "—" },
  { label: "Capacity (L)", className: "text-right tabular-nums", render: (row) => { const v = (row as TransportVehicleRow).tanker_capacity_liters; return v ? Number(v).toLocaleString("en-TZ") : "—"; } },
  { label: "Driver", render: (row) => { const v = row as TransportVehicleRow; return [v.driver_first_name, v.driver_middle_name, v.driver_last_name].filter(Boolean).join(" ") || unassigned; } },
];

const driverColumns: Column[] = [
  { label: "Driver", render: (row) => <span className="font-medium">{driverName(row as TransportDriverRow)}</span> },
  { label: "Phone", render: (row) => (row as TransportDriverRow).phone || "—" },
  { label: "Transporter", render: (row) => row.company_name },
  { label: "Licence", render: (row) => { const d = row as TransportDriverRow; return [d.driver_license_number, d.licence_class].filter(Boolean).join(" · ") || "—"; } },
  { label: "Vehicle", render: (row) => (row as TransportDriverRow).assigned_vehicle_plate || unassigned },
  { label: "App access", render: (row) => { const p = Boolean((row as TransportDriverRow).pin_pending); return <Badge variant={p ? "outline" : "secondary"}>{p ? "Awaiting first login" : "PIN set"}</Badge>; } },
];

/** Vehicles or drivers across the transporters the admin can see, in the registry layout. */
export function TransporterFleetDashboard({ kind }: { kind: FleetKind }) {
  const isVehicles = kind === "vehicles";
  const [result, setResult] = useState<FleetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "archived">("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [revision, setRevision] = useState(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), per_page: String(pageSize), sort, tab: activeTab });
    if (search.trim()) params.set("search", search.trim());
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/transport/${kind}?${params}`, { cache: "no-store", signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Records could not be loaded.");
      if (signal?.aborted) return;
      setResult(payload);
      setSelected(new Set());
      if (page > payload.meta.lastPage) setPage(payload.meta.lastPage);
    } catch (error) {
      if (!signal?.aborted) setError(error instanceof Error ? error.message : "Records could not be loaded.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [activeTab, kind, page, pageSize, search, sort]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), search ? 300 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [load, search, revision]);

  const rows = result?.data ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.uuid));
  const someSelected = rows.some((row) => selected.has(row.uuid));
  const stats = result?.meta.stats;
  const columns = isVehicles ? vehicleColumns : driverColumns;
  const icon = isVehicles ? Truck : IdCard;
  const reload = () => { setLoading(true); setRevision((n) => n + 1); };

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardHeader parent="Transporters & Fleet" parentHref="/dashboard/dairy/transporters" title={isVehicles ? "Transport Vehicles" : "Transport Drivers"}
        description={isVehicles ? "Milk vehicles of approved transporters and the driver assigned to each." : "Drivers of approved transporters, their licences and assigned vehicles."}
        actions={<Button onClick={() => setCreating(true)}><Plus />{isVehicles ? "Add vehicle" : "Add driver"}</Button>} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: isVehicles ? "Total vehicles" : "Total drivers", value: stats?.total, note: "All registered records" },
          { label: "Active", value: stats?.active, note: "In service" },
          { label: isVehicles ? "With a driver" : "On a vehicle", value: stats?.assigned, note: "Currently assigned" },
          isVehicles
            ? { label: "Capacity (L)", value: stats?.capacity, note: "Active vehicles combined" }
            : { label: "Awaiting first login", value: stats?.awaiting_login, note: "PIN not set yet" },
        ].map((item) => (
          <DashboardStatCard key={item.label} label={<>{item.label}</>} value={<StatNumber value={item.value} />} note={<>{item.note}</>} loading={item.value === undefined} />
        ))}
      </div>
      <TablePanel className="mt-4">
        <TableTabSection>
          <Tabs value={activeTab} onValueChange={(next) => {
            if ((next !== "all" && next !== "archived") || next === activeTab) return;
            setLoading(true);
            setActiveTab(next);
            setPage(1);
            setSelected(new Set());
          }}>
            <TabsList variant="resource" aria-label="Record visibility">
              <TabsTrigger value="all">All<Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">{stats?.active ?? "—"}</Badge></TabsTrigger>
              <TabsTrigger value="archived">Archived<Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">{stats ? stats.total - stats.active : "—"}</Badge></TabsTrigger>
            </TabsList>
          </Tabs>
        </TableTabSection>
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" placeholder={isVehicles ? "Search plate, type, colour or transporter…" : "Search name, phone, licence or transporter…"} />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <BulkRecordAction ids={[...selected]} action={activeTab === "archived" ? "restore" : "archive"} disabled={loading}
              getRequest={(id) => ({ url: `/api/admin/dairy/transport/${kind}/${encodeURIComponent(id)}` + (activeTab === "archived" ? "/restore" : ""), method: activeTab === "archived" ? "POST" : "DELETE" })}
              onComplete={() => { setSelected(new Set()); reload(); }} />
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-[9.5rem] font-normal"><SelectValue /></SelectTrigger>
              <SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem><SelectItem value="alpha-asc">{isVehicles ? "Plate (A–Z)" : "Name (A–Z)"}</SelectItem><SelectItem value="alpha-desc">{isVehicles ? "Plate (Z–A)" : "Name (Z–A)"}</SelectItem></SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger>
              <SelectContent align="end">{[10, 30, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </TableToolbar>
        {error ? <div className="p-4"><EmptyCard icon={icon} title="Could not load records" description={error} action={<Button variant="outline" size="sm" onClick={reload}><RefreshCw />Try again</Button>} /></div> :
          loading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
          rows.length === 0 ? <div className="p-4"><EmptyCard icon={icon} title={activeTab === "archived" ? "No archived records" : isVehicles ? "No vehicles found" : "No drivers found"} description={activeTab === "archived" ? "Deleted records appear here and can be restored." : "Change your search, or add one for an approved transporter."} /></div> :
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-12"><Checkbox aria-label="Select all records on this page" checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(v) => setSelected(v === true ? new Set(rows.map((r) => r.uuid)) : new Set())} /></TableHead>
              <TableHead className="w-14">#</TableHead>
              {columns.map((column) => <TableHead key={column.label} className={column.className}>{column.label}</TableHead>)}
              <TableHead>Created at</TableHead><TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow></TableHeader>
            <TableBody>{rows.map((row, index) => <TableRow key={row.uuid} data-state={selected.has(row.uuid) ? "selected" : undefined}>
              <TableCell><Checkbox aria-label="Select record" checked={selected.has(row.uuid)} onCheckedChange={(v) => setSelected((old) => { const next = new Set(old); if (v === true) next.add(row.uuid); else next.delete(row.uuid); return next; })} /></TableCell>
              <TableCell className="text-muted-foreground tabular-nums">{(result?.meta.from ?? 1) + index}</TableCell>
              {columns.map((column) => <TableCell key={column.label} className={column.className}>{column.render(row)}</TableCell>)}
              <TableCell className="text-muted-foreground">{formatRecordDate(row.created_at)}</TableCell>
              <TableCell className="text-right"><TransporterFleetActions kind={kind} row={row} onChanged={reload} /></TableCell>
            </TableRow>)}</TableBody>
          </Table>}
        {result && !error && !loading && <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />}
      </TablePanel>
      {creating && <TransporterFleetForm kind={kind} open={creating} onOpenChange={setCreating} onSaved={() => { setPage(1); reload(); }} />}
    </div>
  );
}
