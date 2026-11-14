"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Download, Plus, RefreshCw, Search, X, type LucideIcon } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import { RecordPagination } from "@/components/ui/record-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatNumber } from "@/components/ui/stat-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { toast } from "@/components/ui/toast";
import { commerceCsv, commerceLabel } from "@/features/commerce/commerce-config";
import type { RegistryColumn, RegistryConfig } from "./types";
import type { RegistryRecords } from "./use-registry-records";

/** The Commerce table layout for any paged admin list; each feature supplies its columns and row actions. */
export function RegistryDashboard<T>({ parent, parentHref, config, records, columns, rowKey, rowTitle, rowActions, addLabel, onAdd, exportName, emptyIcon }: {
  parent: string; parentHref: string; config: RegistryConfig; records: RegistryRecords<T>; columns: RegistryColumn<T>[];
  rowKey: (row: T) => string; rowTitle: (row: T) => string; rowActions: (row: T) => ReactNode;
  addLabel?: string; onAdd?: () => void; exportName: string; emptyIcon: LucideIcon;
}) {
  const { data, error, loading, query, status, sort, pageSize } = records;
  const rows = data?.data ?? [];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filtered = Boolean(query.trim()) || status !== "all";
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(rowKey(row)));
  const someSelected = rows.some((row) => selected.has(rowKey(row)));
  const from = rows.length ? ((data?.current_page ?? 1) - 1) * (data?.per_page ?? pageSize) + 1 : 0;

  useEffect(() => { setSelected(new Set()); }, [data, query, status, sort, pageSize, records.page]);

  function exportSelected() {
    const exported = rows.filter((row) => selected.has(rowKey(row)));
    if (!exported.length) return;
    const content = commerceCsv([["Reference", ...columns.map((column) => column.label)], ...exported.map((row) => [rowKey(row), ...columns.map((column) => column.value(row))])]);
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${exportName}-selected.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Exported ${exported.length} ${exported.length === 1 ? "record" : "records"}.`);
  }

  return <div className="mx-auto max-w-7xl">
    <DashboardHeader parent={parent} parentHref={parentHref} title={config.title} description={config.description}
      actions={onAdd && addLabel ? <Button onClick={onAdd}><Plus />{addLabel}</Button> : undefined} />

    <div className={`mt-6 grid gap-3 ${config.stats.length > 3 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
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
          {selected.size > 0 && !loading && <Button variant="outline" size="sm" onClick={exportSelected}><Download />Export selected ({selected.size})</Button>}
          <Select value={status} onValueChange={records.setStatus}><SelectTrigger aria-label="Filter by status" size="sm" className="h-8 w-auto min-w-36 font-normal"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="all">All statuses</SelectItem>{config.statuses.map((value) => <SelectItem key={value} value={value}>{value === "notActive" ? "Not Active" : commerceLabel(value)}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={records.setSort}><SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-36 font-normal">{sort === "desc" ? <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" /> : <ArrowUpNarrowWide className="size-3.5 text-muted-foreground" />}<SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent></Select>
          <Select value={String(pageSize)} onValueChange={(value) => records.setPageSize(Number(value))}><SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-24 font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger><SelectContent align="end">{[10, 15, 30, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select>
          {filtered && <Button variant="ghost" size="sm" onClick={records.reset}><X />Reset</Button>}
        </div>
      </TableToolbar>

      <Table aria-label={config.title}>
        <TableHeader><TableRow>
          <TableHead className="w-12"><Checkbox aria-label="Select all records on this page for export" disabled={loading || Boolean(error) || !rows.length} checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(checked) => setSelected(checked === true ? new Set(rows.map(rowKey)) : new Set())} /></TableHead>
          <TableHead className="w-14">#</TableHead>
          {columns.map((column) => <TableHead key={column.key} className={column.className}>{column.label}</TableHead>)}
          <TableHead className="w-24 text-right"><span className="sr-only">Actions</span></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {loading ? Array.from({ length: 5 }, (_, row) => <TableRow key={row}>{Array.from({ length: columns.length + 3 }, (_, cell) => <TableCell key={cell}><Skeleton className={cell < 2 ? "h-4 w-4" : "h-4 w-24"} /></TableCell>)}</TableRow>) : error ? (
            <TableRow><TableCell colSpan={columns.length + 3} className="whitespace-normal p-5"><div role="alert"><EmptyCard icon={RefreshCw} title="Could not load records" description={error} action={<Button variant="outline" onClick={records.reload}>Try again</Button>} /></div></TableCell></TableRow>
          ) : !rows.length ? (
            <TableRow><TableCell colSpan={columns.length + 3} className="whitespace-normal p-5"><EmptyCard icon={emptyIcon} title={filtered ? "No matching records" : config.emptyTitle} description={filtered ? "Try a different search or clear the filters to see all records." : config.emptyDescription} action={filtered ? <Button variant="outline" onClick={records.reset}>Clear filters</Button> : undefined} /></TableCell></TableRow>
          ) : rows.map((row, index) => <TableRow key={rowKey(row)} data-state={selected.has(rowKey(row)) ? "selected" : undefined}>
            <TableCell><Checkbox aria-label={`Select ${rowTitle(row)} for export`} checked={selected.has(rowKey(row))} onCheckedChange={(checked) => setSelected((current) => { const next = new Set(current); if (checked === true) next.add(rowKey(row)); else next.delete(rowKey(row)); return next; })} /></TableCell>
            <TableCell className="text-muted-foreground tabular-nums">{from + index}</TableCell>
            {columns.map((column) => <TableCell key={column.key} className={column.className}>{column.render(row)}</TableCell>)}
            <TableCell className="text-right">{rowActions(row)}</TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
      <RecordPagination from={from} to={from ? from + rows.length - 1 : 0} total={data?.total ?? 0} page={data?.current_page ?? 1} pageCount={data?.last_page ?? 1} onPageChange={records.setPage} disabled={loading || Boolean(error)} />
    </TablePanel>
  </div>;
}
