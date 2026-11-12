"use client";

import { BulkRecordAction } from "@/components/ui/bulk-record-action";
import { RecordPagination } from "@/components/ui/record-pagination";
import { formatRecordDate } from "@/lib/resource-table";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TableTabSection, TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Truck } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authenticatedFetch } from "@/lib/auth/session";
import { TransporterRegistryActions } from "./transporter-registry-actions";
import type { TransporterResponse, TransporterTab } from "./transporter-registry-types";

const tabs: Array<{ value: TransporterTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "archived", label: "Archived" },
];

/** Transporter companies registered under unions, with approval actions. */
export function TransporterRegistryDashboard() {
  const [result, setResult] = useState<TransporterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TransporterTab>("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revision, setRevision] = useState(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), per_page: String(pageSize), sort, tab: activeTab });
    if (search.trim()) params.set("search", search.trim());
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/transport/companies?${params}`, { cache: "no-store", signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Transporters could not be loaded.");
      if (signal?.aborted) return;
      setResult(payload);
      setSelected(new Set());
      if (page > payload.meta.lastPage) setPage(payload.meta.lastPage);
    } catch (error) {
      if (!signal?.aborted) setError(error instanceof Error ? error.message : "Transporters could not be loaded.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [activeTab, page, pageSize, search, sort]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), search ? 300 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [load, search, revision]);

  const rows = result?.data ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.uuid));
  const someSelected = rows.some((row) => selected.has(row.uuid));
  const stats = result?.meta.stats;
  const reload = () => { setLoading(true); setRevision((n) => n + 1); };

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardHeader parent="Cooperative Operations" parentHref="/dashboard/dairy" title="Transporters & Fleet"
        description="Approve milk transporters registered under your union and review their vehicles and drivers."
        actions={<div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/dashboard/dairy/transport-vehicles">Vehicles</Link></Button>
          <Button variant="outline" asChild><Link href="/dashboard/dairy/transport-drivers">Drivers</Link></Button>
        </div>} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Transporters", value: stats?.total, note: "Registered companies" },
          { label: "Pending approval", value: stats?.pending, note: "Waiting for a decision" },
          { label: "Approved", value: stats?.approved, note: "Can operate in the app" },
          { label: "Vehicles", value: stats?.vehicles, note: "Across these companies" },
          { label: "Drivers", value: stats?.drivers, note: "Across these companies" },
        ].map((item) => (
          <DashboardStatCard key={item.label} label={<>{item.label}</>} value={<StatNumber value={item.value} />} note={<>{item.note}</>} loading={item.value === undefined} />
        ))}
      </div>
      <TablePanel className="mt-4">
        <TableTabSection>
          <Tabs value={activeTab} onValueChange={(next) => {
            if (next === activeTab || !tabs.some((tab) => tab.value === next)) return;
            setLoading(true);
            setActiveTab(next as TransporterTab);
            setPage(1);
            setSelected(new Set());
          }}>
            <TabsList variant="resource" aria-label="Record visibility">{tabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}
              {tab.value !== "archived" && <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">{stats ? (tab.value === "all" ? stats.total : stats.pending) : "—"}</Badge>}
            </TabsTrigger>)}</TabsList>
          </Tabs>
        </TableTabSection>
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" placeholder="Search company, licence, TIN, contact or union…" />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <BulkRecordAction ids={[...selected]} action={activeTab === "archived" ? "restore" : "archive"} disabled={loading}
              getRequest={(id) => ({ url: `/api/admin/dairy/transport/companies/${encodeURIComponent(id)}` + (activeTab === "archived" ? "/restore" : ""), method: activeTab === "archived" ? "POST" : "DELETE" })}
              onComplete={() => { setSelected(new Set()); reload(); }} />
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-[9.5rem] font-normal"><SelectValue /></SelectTrigger>
              <SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem><SelectItem value="alpha-asc">Name (A–Z)</SelectItem><SelectItem value="alpha-desc">Name (Z–A)</SelectItem></SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger>
              <SelectContent align="end">{[10, 30, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </TableToolbar>
        {error ? <div className="p-4"><EmptyCard icon={Truck} title="Could not load transporters" description={error} action={<Button variant="outline" size="sm" onClick={reload}><RefreshCw />Try again</Button>} /></div> :
          loading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
          rows.length === 0 ? <div className="p-4"><EmptyCard icon={Truck} title={activeTab === "pending" ? "No applications waiting" : activeTab === "archived" ? "No archived transporters" : "No matching transporters"} description={activeTab === "pending" ? "New registrations from the app appear here for approval." : "Change your search or filters."} /></div> :
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-12"><Checkbox aria-label="Select all transporters on this page" checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(v) => setSelected(v === true ? new Set(rows.map((r) => r.uuid)) : new Set())} /></TableHead>
              <TableHead className="w-14">#</TableHead><TableHead>Company</TableHead><TableHead>Union</TableHead><TableHead>Contact</TableHead>
              <TableHead className="text-right">Fleet</TableHead><TableHead>Approval</TableHead><TableHead>Created at</TableHead><TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow></TableHeader>
            <TableBody>{rows.map((row, index) => <TableRow key={row.uuid} data-state={selected.has(row.uuid) ? "selected" : undefined}>
              <TableCell><Checkbox aria-label={`Select ${row.name}`} checked={selected.has(row.uuid)} onCheckedChange={(v) => setSelected((old) => { const next = new Set(old); if (v === true) next.add(row.uuid); else next.delete(row.uuid); return next; })} /></TableCell>
              <TableCell className="text-muted-foreground tabular-nums">{(result?.meta.from ?? 1) + index}</TableCell>
              <TableCell><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.license_number}</p></TableCell>
              <TableCell>{row.mcu_name || "—"}</TableCell>
              <TableCell>{row.contact_person}{row.contact_phone || row.phone ? ` · ${row.contact_phone || row.phone}` : ""}</TableCell>
              <TableCell className="text-right tabular-nums">{row.vehicles_count} / {row.drivers_count}</TableCell>
              <TableCell>{!row.archived_at && row.approval_status === "approved" ? <Badge>Approved</Badge> : <StatusBadge status={row.archived_at ? "archived" : row.approval_status} />}</TableCell>
              <TableCell className="text-muted-foreground">{formatRecordDate(row.created_at)}</TableCell>
              <TableCell className="text-right"><TransporterRegistryActions row={row} onChanged={reload} /></TableCell>
            </TableRow>)}</TableBody>
          </Table>}
        {result && !error && !loading && <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />}
      </TablePanel>
    </div>
  );
}
