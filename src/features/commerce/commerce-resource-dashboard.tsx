"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Copy, Download, Eye, LockOpen, MoreVertical, Plus, RefreshCw, Search, ShoppingBag, X } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import { RecordPagination } from "@/components/ui/record-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatNumber } from "@/components/ui/stat-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { commerceAddLabel, commerceConfig, commerceCsv, commerceLabel, recordTitle } from "./commerce-config";
import { commerceColumns } from "./commerce-columns";
import { CommerceCreateForm } from "./commerce-create-form";
import { CommerceDetailsDialog } from "./commerce-details-dialog";
import { useCommerceRecords } from "./use-commerce-records";
import type { AnimalReservationRecord, CommerceRecord, CommerceResource, CommerceResponse } from "./types";

const releasable = (row: CommerceRecord): row is AnimalReservationRecord => "reservation_type" in row && row.reservation_type === "offer_hold" && row.status === "active";

export function CommerceResourceDashboard({ resource, initialData, initialError }: {
  resource: CommerceResource; initialData: CommerceResponse | null; initialError?: string;
}) {
  const config = commerceConfig[resource];
  const records = useCommerceRecords(resource, initialData, initialError);
  const { data, error, loading, query, status, sort, pageSize } = records;
  const rows = data?.data ?? [];
  const columns = useMemo(() => commerceColumns(resource), [resource]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<CommerceRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [releasing, setReleasing] = useState<AnimalReservationRecord | null>(null);
  const filtered = Boolean(query.trim()) || status !== "all";
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.uuid));
  const someSelected = rows.some((row) => selected.has(row.uuid));
  const from = rows.length ? ((data?.current_page ?? 1) - 1) * (data?.per_page ?? pageSize) + 1 : 0;

  useEffect(() => { setSelected(new Set()); }, [data, query, status, sort, pageSize, records.page]);

  function exportRows(selectedOnly = false) {
    const exported = selectedOnly ? rows.filter((row) => selected.has(row.uuid)) : rows;
    if (!exported.length) return;
    const content = commerceCsv([["Reference", ...columns.map((column) => column.label)], ...exported.map((row) => [row.uuid, ...columns.map((column) => column.value(row))])]);
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `commerce-${resource}-${selectedOnly ? "selected" : `page-${data?.current_page ?? 1}`}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Exported ${exported.length} ${exported.length === 1 ? "record" : "records"}.`);
  }

  async function copyReference(uuid: string) {
    try { await navigator.clipboard.writeText(uuid); toast.success("Reference copied."); }
    catch { toast.error("Could not copy the reference. You can select it in the details dialog."); }
  }

  async function releaseHold(hold: AnimalReservationRecord) {
    try {
      const response = await authenticatedFetch(`/api/admin/commerce/reservations/${encodeURIComponent(hold.uuid)}/release`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not release the hold.");
      toast.success("Hold released. The animal is free for other buyers.");
      setReleasing(null);
      records.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not release the hold.");
    }
  }

  return <div className="mx-auto max-w-7xl">
    <DashboardHeader parent="Livestock Commerce" parentHref="/dashboard/commerce" title={config.title} description={config.description}
      actions={<div className="flex items-center gap-2"><Button variant="outline" disabled={loading || Boolean(error) || !rows.length} onClick={() => exportRows()}><Download />Export page</Button><Button onClick={() => setCreating(true)}><Plus />{commerceAddLabel[resource]}</Button></div>} />

    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {config.stats.map((stat) => <DashboardStatCard key={stat.key} label={stat.label} note={stat.note} loading={loading && !data}
        value={data?.meta?.[stat.key] !== undefined ? <StatNumber value={data.meta[stat.key]} /> : "—"} />)}
    </div>

    <TablePanel className="mt-4" aria-busy={loading}>
      <TableToolbar>
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label={`Search ${config.title.toLowerCase()}`} maxLength={160} className="pl-9 pr-9" placeholder={config.searchPlaceholder} value={query} onChange={(event) => records.setQuery(event.target.value)} />
          {query && <button type="button" aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={() => records.setQuery("")}><X className="size-3.5" /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {selected.size > 0 && !loading && <Button variant="outline" size="sm" onClick={() => exportRows(true)}><Download />Export selected ({selected.size})</Button>}
          <Select value={status} onValueChange={records.setStatus}><SelectTrigger aria-label="Filter by status" size="sm" className="h-8 w-auto min-w-36 font-normal"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="all">All statuses</SelectItem>{config.statuses.map((value) => <SelectItem key={value} value={value}>{commerceLabel(value)}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={records.setSort}><SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-36 font-normal">{sort === "desc" ? <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" /> : <ArrowUpNarrowWide className="size-3.5 text-muted-foreground" />}<SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent></Select>
          <Select value={String(pageSize)} onValueChange={(value) => records.setPageSize(Number(value))}><SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-24 font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger><SelectContent align="end">{[10, 15, 30, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select>
          {filtered && <Button variant="ghost" size="sm" onClick={records.reset}><X />Reset</Button>}
        </div>
      </TableToolbar>

      <Table aria-label={config.title}>
        <TableHeader><TableRow>
          <TableHead className="w-12"><Checkbox aria-label="Select all records on this page for export" disabled={loading || Boolean(error) || !rows.length} checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(checked) => setSelected(checked === true ? new Set(rows.map((row) => row.uuid)) : new Set())} /></TableHead>
          <TableHead className="w-14">#</TableHead>
          {columns.map((column) => <TableHead key={column.key} className={column.className}>{column.label}</TableHead>)}
          <TableHead className="w-24 text-right"><span className="sr-only">Actions</span></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {loading ? Array.from({ length: 5 }, (_, row) => <TableRow key={row}>{Array.from({ length: columns.length + 3 }, (_, cell) => <TableCell key={cell}><Skeleton className={cell < 2 ? "h-4 w-4" : "h-4 w-24"} /></TableCell>)}</TableRow>) : error ? (
            <TableRow><TableCell colSpan={columns.length + 3} className="whitespace-normal p-5"><div role="alert"><EmptyCard icon={RefreshCw} title="Could not load records" description={error} action={<Button variant="outline" onClick={records.reload}>Try again</Button>} /></div></TableCell></TableRow>
          ) : !rows.length ? (
            <TableRow><TableCell colSpan={columns.length + 3} className="whitespace-normal p-5"><EmptyCard icon={ShoppingBag} title={filtered ? "No matching records" : config.emptyTitle} description={filtered ? "Try a different search or clear the filters to see all records." : config.emptyDescription} action={filtered ? <Button variant="outline" onClick={records.reset}>Clear filters</Button> : undefined} /></TableCell></TableRow>
          ) : rows.map((row, index) => <TableRow key={row.uuid} data-state={selected.has(row.uuid) ? "selected" : undefined}>
            <TableCell><Checkbox aria-label={`Select ${recordTitle(row)} for export`} checked={selected.has(row.uuid)} onCheckedChange={(checked) => setSelected((current) => { const next = new Set(current); if (checked === true) next.add(row.uuid); else next.delete(row.uuid); return next; })} /></TableCell>
            <TableCell className="text-muted-foreground tabular-nums">{from + index}</TableCell>
            {columns.map((column) => <TableCell key={column.key} className={column.className}>{column.render(row)}</TableCell>)}
            <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${recordTitle(row)}`}><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setViewing(row)}><Eye />View details</DropdownMenuItem><DropdownMenuItem onSelect={() => void copyReference(row.uuid)}><Copy />Copy reference</DropdownMenuItem>{releasable(row) && <DropdownMenuItem onSelect={() => setReleasing(row)}><LockOpen />Release hold</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
      <RecordPagination from={from} to={from ? from + rows.length - 1 : 0} total={data?.total ?? 0} page={data?.current_page ?? 1} pageCount={data?.last_page ?? 1} onPageChange={records.setPage} disabled={loading || Boolean(error)} />
    </TablePanel>
    {viewing && <CommerceDetailsDialog key={viewing.uuid} resource={resource} record={viewing} onClose={() => setViewing(null)} />}
    {creating && <CommerceCreateForm resource={resource} open={creating} onOpenChange={setCreating} onSaved={records.reload} />}
    <ConfirmationAlertDialog open={Boolean(releasing)} onOpenChange={(open) => !open && setReleasing(null)} icon={<LockOpen />} title="Release this hold?"
      description={`${releasing ? recordTitle(releasing) : "The animal"} will be free for other buyers to order straight away.`} confirmLabel="Release hold" onConfirm={() => releasing ? releaseHold(releasing) : undefined} />
  </div>;
}
