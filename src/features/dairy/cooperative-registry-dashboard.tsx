"use client";

import { BulkRecordAction } from "@/components/ui/bulk-record-action";
import { RecordPagination } from "@/components/ui/record-pagination";
import { formatRecordDate } from "@/lib/resource-table";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { TableTabSection, TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Search, Users } from "lucide-react";
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
import { CooperativeRegistryForm } from "./cooperative-registry-form";
import { CollectionCentreRegistryForm } from "./collection-centre-registry-form";
import { CooperativeRegistryActions } from "./cooperative-registry-actions";
import { CooperativeApprovals } from "./cooperative-approvals";
import type { RegistryResponse, RegistryType } from "./cooperative-registry-types";

export function CooperativeRegistryDashboard({ type }: { type: RegistryType }) {
  const isUnion = type === "mcus";
  const isCentre = type === "centres";
  const isFactory = type === "factories";
  const title = isUnion ? "Cooperative Unions (MCU)" : isCentre ? "Collection Centres" : isFactory ? "Factories" : "Cooperatives (AMCOS)";
  const action = isUnion ? "Register union" : isCentre ? "Register centre" : isFactory ? "Register factory" : "Register cooperative";
  const [result, setResult] = useState<RegistryResponse | null>(null);
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
    const params = new URLSearchParams({ page: String(page), per_page: String(pageSize), sort });
    if (search.trim()) params.set("search", search.trim());
    params.set("status", activeTab === "archived" ? "inactive" : "active");
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/${type}?${params}`, { cache: "no-store", signal });
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
  }, [activeTab, page, pageSize, search, sort, type]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), search ? 300 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [load, search, revision]);

  const rows = result?.data ?? [];
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.uuid));
  const someSelected = rows.some((row) => selected.has(row.uuid));
  const stats = result?.meta.stats;

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardHeader parent="Cooperative Operations" parentHref="/dashboard/dairy" title={title}
        description={isUnion ? "Register and manage cooperative unions." : isCentre ? "Register collection centres and manage them under their cooperatives." : isFactory ? "Register factory companies under MCUs and manage their business details." : "Manage cooperatives linked to unions or operating independently."}
        actions={result?.meta.canManage && <Button onClick={() => setCreating(true)}><Plus />{action}</Button>} />
      <div className={`mt-6 grid gap-3 sm:grid-cols-2 ${!isUnion && !isCentre && !isFactory ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
        {[
          { label: isUnion ? "Total unions" : isCentre ? "Total centres" : isFactory ? "Total factories" : "Total cooperatives", value: stats?.total, note: "All registered records" },
          { label: "Active", value: stats?.active, note: "Marked active" },
          { label: "Inactive", value: stats ? stats.total - stats.active : undefined, note: "Not currently active" },
          { label: isUnion || isCentre || isFactory ? "Linked organisations" : "Independent", value: stats?.extra, note: isUnion ? "Cooperatives linked to unions" : isCentre ? "Cooperatives with centres" : isFactory ? "Factories under unions" : "Cooperatives without a union" },
        ].map((item) => (
          <DashboardStatCard key={item.label} label={<>{item.label}</>} value={<StatNumber value={item.value} />} note={<>{item.note}</>} loading={item.value === undefined} />
        ))}
        {!isUnion && !isCentre && !isFactory && <CooperativeApprovals />}
      </div>
      <TablePanel className="mt-4">
        <TableTabSection>
          <Tabs value={activeTab} onValueChange={(next) => {
            if (next !== "all" && next !== "archived") return;
            if (next === activeTab) return;
            setLoading(true);
            setError(null);
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
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" placeholder={isCentre ? "Search name, cooperative or location…" : "Search name…"} />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {result?.meta.canManage && <BulkRecordAction ids={[...selected]} action={activeTab === "archived" ? "restore" : "archive"} disabled={loading}
              getRequest={(id) => ({ url: `/api/admin/dairy/cooperatives/${type}/${encodeURIComponent(id)}`, method: "PATCH", body: { is_active: activeTab === "archived" } })}
              onComplete={() => { setSelected(new Set()); setRevision((value) => value + 1); }} />}
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
        {error ? <div className="p-4"><EmptyCard icon={Users} title="Could not load records" description={error} action={<Button variant="outline" size="sm" onClick={() => setRevision((n) => n + 1)}><RefreshCw />Try again</Button>} /></div> :
          loading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
          rows.length === 0 ? <div className="p-4"><EmptyCard icon={Users} title={activeTab === "archived" ? "No archived records found" : "No matching records"} description={activeTab === "archived" ? "Inactive records appear here; authorised administrators can restore them." : isCentre ? "Change your filters or register a collection centre." : "Change your filters or register an organisation."} /></div> :
          <div className={loading ? "opacity-60" : undefined}><Table>
            <TableHeader><TableRow>
              <TableHead className="w-12"><Checkbox aria-label="Select all records on this page" checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(v) => setSelected(v === true ? new Set(rows.map((r) => r.uuid)) : new Set())} /></TableHead>
              <TableHead className="w-14">#</TableHead><TableHead>{isFactory ? "Company name" : "Name"}</TableHead>
              {isFactory && <TableHead>TIN number</TableHead>}
              <TableHead>{isUnion ? "Registration number" : isCentre ? "Cooperative" : isFactory ? "MCU" : "Union"}</TableHead>
              {(isCentre || isFactory) && <TableHead>Location</TableHead>}<TableHead>{isFactory ? "Company contact" : "Contact"}</TableHead><TableHead>Status</TableHead><TableHead>Created at</TableHead><TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow></TableHeader>
            <TableBody>{rows.map((row, index) => <TableRow key={row.uuid} data-state={selected.has(row.uuid) ? "selected" : undefined}>
              <TableCell><Checkbox aria-label={`Select ${row.name}`} checked={selected.has(row.uuid)} onCheckedChange={(v) => setSelected((old) => { const next = new Set(old); if (v === true) next.add(row.uuid); else next.delete(row.uuid); return next; })} /></TableCell>
              <TableCell className="text-muted-foreground tabular-nums">{(result?.meta.from ?? 1) + index}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              {isFactory && <TableCell>{row.tin_number || "—"}</TableCell>}
              <TableCell>{isUnion ? row.registration_number || "—" : isCentre ? row.amcos_name || "—" : isFactory ? row.mcu_name || "—" : row.mcu_name || "Independent"}</TableCell>
              {(isCentre || isFactory) && <TableCell>{[row.district_name, row.region_name].filter(Boolean).join(", ") || "—"}</TableCell>}
              <TableCell>{isFactory ? <><p>{row.contact_phone || "—"}</p><p className="text-xs text-muted-foreground">{row.contact_email}</p></> : <>{row.contact_name || "—"}{row.contact_phone ? ` · ${row.contact_phone}` : ""}</>}</TableCell>
              <TableCell><StatusBadge status={row.is_active ? "active" : "inactive"} /></TableCell>
              <TableCell className="text-muted-foreground">{formatRecordDate(row.created_at)}</TableCell>
              <TableCell className="text-right"><CooperativeRegistryActions row={row} type={type} canManage={result?.meta.canManage === true} onChanged={() => { setLoading(true); setRevision((n) => n + 1); }} /></TableCell>
            </TableRow>)}</TableBody>
          </Table></div>}
        {result && !error && !loading && <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} disabled={loading} />}
      </TablePanel>
      {creating && type !== "centres" && <CooperativeRegistryForm type={type} open={creating} onOpenChange={setCreating} onSaved={() => { setPage(1); setRevision((n) => n + 1); }} />}
      {creating && type === "centres" && <CollectionCentreRegistryForm open={creating} onOpenChange={setCreating} onSaved={() => { setPage(1); setRevision((n) => n + 1); }} />}
    </div>
  );
}
