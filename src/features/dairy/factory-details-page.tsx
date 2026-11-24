"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Factory, Pencil, Search, UserPlus, Users } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MediaPreviewList } from "@/components/media/media-preview";
import { mediaSourcesFrom } from "@/components/media/media-source";
import { DashboardPage } from "@/components/ui/dashboard";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/ui/empty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RecordPagination } from "@/components/ui/record-pagination";
import { authenticatedFetch } from "@/lib/auth/session";
import { formatRecordDate } from "@/lib/resource-table";
import { CooperativeRegistryForm } from "./cooperative-registry-form";
import { FactoryMembersDialog, type FactoryMember } from "./factory-members-dialog";
import { FactoryMemberActions } from "./factory-member-actions";
import { BulkRecordAction } from "@/components/ui/bulk-record-action";
import { Checkbox } from "@/components/ui/checkbox";
import { FactoryHandovers } from "./factory-handovers";
import { FactoryTransactions } from "./factory-transactions";
import styles from "./factory-details-page.module.css";
import type { RegistryRow } from "./cooperative-registry-types";

type Member = FactoryMember;
type FactoryResponse = { data: RegistryRow; members: Member[] | null; meta: { canManage: boolean } };

export function FactoryDetailsPage({ uuid }: { uuid: string }) {
  const [result, setResult] = useState<FactoryResponse | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(false);
  const [managing, setManaging] = useState(false);
  const [tab, setTab] = useState("details");
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    void (async () => {
      try {
        const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/factories/${encodeURIComponent(uuid)}`, { signal: controller.signal, cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Factory could not be loaded.");
        if (!controller.signal.aborted) setResult(payload);
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Factory could not be loaded.");
      }
    })();
    return () => controller.abort();
  }, [uuid, revision]);
  const reload = () => setRevision((n) => n + 1);
  if (error) return <DashboardPage><Button variant="outline" asChild><Link href="/dashboard/dairy/factories"><ArrowLeft />Factories</Link></Button><EmptyCard icon={Factory} title="Could not load factory" description={error} action={<Button onClick={reload}>Try again</Button>} /></DashboardPage>;
  if (!result) return <DashboardPage><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /></DashboardPage>;
  const { data: row, members, meta } = result;
  const managers = members?.filter((member) => member.role === "manager") ?? [];
  const operators = members?.filter((member) => member.role === "operator") ?? [];
  const initials = row.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const details = [
    ["Registered company name", row.name], ["Factory code", row.factory_code],
    ["Cooperative union (MCU)", row.mcu_name],
    ["TIN number", row.tin_number], ["Dairy board licence number", row.dairy_board_license_no],
    ["Company registration number", row.registration_number],
    ["Location", [row.ward_name, row.district_name, row.region_name].filter(Boolean).join(", ")],
    ["Physical address", row.address], ["Company phone number", row.contact_phone],
    ["Company email address", row.contact_email], ["Created at", formatRecordDate(row.created_at)],
  ];
  return <DashboardPage>
    <DashboardHeader parent="Factories" parentHref="/dashboard/dairy/factories" title="Factory details" description="Factory information and the people who receive and approve milk deliveries."
      actions={<Button variant="outline" asChild><Link href="/dashboard/dairy/factories"><ArrowLeft />Back to factories</Link></Button>} />
    <section className={styles.summary} aria-label="Factory summary">
      <div className={styles.identity}>
        <div aria-hidden="true" className={styles.avatar}>{initials || <Factory />}</div>
        <div className="min-w-0">
          <h2 className={styles.name}>{row.name}</h2>
          <div className="mt-3"><StatusBadge status={row.is_active ? "active" : "inactive"} /></div>
          <dl className={styles.metadata}>
            <div><dt>Cooperative union (MCU)</dt><dd>{row.mcu_name || "Not assigned"}</dd></div>
            <div><dt>Factory code</dt><dd>{row.factory_code || "—"}</dd></div>
          </dl>
        </div>
        {meta.canManage && <div className={styles.actions}>
          <Button variant="outline" onClick={() => setEditing(true)}><Pencil />Update details</Button>
          <Button onClick={() => setManaging(true)}><UserPlus />Add user or manager</Button>
        </div>}
      </div>
      {members && <dl className={styles.totals}>
        {[["Managers", managers.length], ["Factory users", operators.length], ["Active members", members.filter((m) => m.is_active).length]].map(([label, value]) => (
          <div key={label}><dt className={styles.totalLabel}>{label}</dt><dd className={styles.totalValue}>{value}</dd></div>
        ))}
      </dl>}
    </section>
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className={styles.tabs} style={{ gridTemplateColumns: `repeat(${members ? 5 : 3}, minmax(0, 1fr))` }}><TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="details">Factory details</TabsTrigger><TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="handovers">Handover approvals</TabsTrigger><TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="transactions">Transactions</TabsTrigger>{members && <><TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="managers">Managers ({managers.length})</TabsTrigger><TabsTrigger className="w-full min-w-0 justify-self-stretch" style={{ width: "100%" }} value="users">Factory users ({operators.length})</TabsTrigger></>}</TabsList>
      <TabsContent value="details"><section className="rounded-2xl border bg-card p-5 sm:p-7"><h3 className="mb-5 text-lg font-semibold">Details</h3><dl className="divide-y border-t">{details.map(([label, value]) => <div key={label} className="grid gap-2 py-4 text-sm sm:grid-cols-2"><dt className="font-medium text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value || "—"}</dd></div>)}</dl>
        <h3 className="mb-3 mt-6 text-lg font-semibold">Documents</h3>
        <MediaPreviewList items={mediaSourcesFrom(row.document_urls)} emptyText="No registration certificates or licences on file." />
      </section></TabsContent>
      {members && <><TabsContent value="managers"><MembersTable members={managers} title="managers" factory={row} canManage={meta.canManage} onChanged={reload} /></TabsContent><TabsContent value="users"><MembersTable members={operators} title="factory users" factory={row} canManage={meta.canManage} onChanged={reload} /></TabsContent></>}
      <TabsContent value="handovers"><FactoryHandovers factoryUuid={uuid} /></TabsContent>
      <TabsContent value="transactions"><FactoryTransactions factoryUuid={uuid} /></TabsContent>
    </Tabs>
    {editing && <CooperativeRegistryForm type="factories" record={row} open={editing} onOpenChange={setEditing} onSaved={reload} />}
    {managing && <FactoryMembersDialog factory={row} open={managing} onOpenChange={(open) => { setManaging(open); if (!open) reload(); }} />}
  </DashboardPage>;
}

function MembersTable({ members, title, factory, canManage, onChanged }: { members: Member[]; title: string; factory: { uuid: string; name: string }; canManage: boolean; onChanged: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const filtered = members.filter((m) =>
    (status === "all" || (status === "active" ? m.is_active : !m.is_active)) &&
    [m.name, m.phone, m.identity_number].some((v) => v?.toLowerCase().includes(search.trim().toLowerCase()))
  ).sort((a, b) => {
    if (sort.startsWith("alpha")) return (a.name || "").localeCompare(b.name || "") * (sort === "alpha-asc" ? 1 : -1);
    const time = (value?: string) => value ? Date.parse(value) || 0 : 0;
    return (time(a.created_at) - time(b.created_at)) * (sort === "asc" ? 1 : -1) || a.uuid.localeCompare(b.uuid);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const visibleSelected = rows.filter((member) => selected.has(member.uuid));
  const allSelected = rows.length > 0 && visibleSelected.length === rows.length;
  const toggle = (uuid: string, on: boolean) => setSelected((old) => { const next = new Set(old); if (on) next.add(uuid); else next.delete(uuid); return next; });
  return <TablePanel><TableToolbar>
    <div className="relative min-w-0 flex-1 lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" aria-label={`Search ${title}`} placeholder={`Search ${title}…`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
    <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
      {canManage && <BulkRecordAction ids={[...selected].filter((uuid) => members.some((m) => m.uuid === uuid))} action="delete"
        getRequest={(id) => ({ url: `/api/admin/dairy/factories/${encodeURIComponent(factory.uuid)}/members/${encodeURIComponent(String(id))}`, method: "DELETE" })}
        onComplete={() => { setSelected(new Set()); onChanged(); }} />}
      <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
        <SelectTrigger aria-label="Filter members by status" size="sm" className="h-8 w-auto min-w-32 font-normal"><SelectValue /></SelectTrigger>
        <SelectContent align="end"><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
      </Select>
      <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
        <SelectTrigger aria-label="Sort members" size="sm" className="h-8 w-auto min-w-[9.5rem] font-normal"><SelectValue /></SelectTrigger>
        <SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem><SelectItem value="alpha-asc">Name (A–Z)</SelectItem><SelectItem value="alpha-desc">Name (Z–A)</SelectItem></SelectContent>
      </Select>
      <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
        <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger>
        <SelectContent align="end">{[10, 30, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  </TableToolbar>
    {rows.length ? <Table><TableHeader><TableRow>
      {canManage && <TableHead className="w-12"><Checkbox aria-label={`Select all ${title} on this page`} checked={allSelected ? true : visibleSelected.length ? "indeterminate" : false} onCheckedChange={(v) => setSelected((old) => { const next = new Set(old); rows.forEach((m) => v === true ? next.add(m.uuid) : next.delete(m.uuid)); return next; })} /></TableHead>}
      <TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Identification number</TableHead><TableHead>Status</TableHead><TableHead>Created at</TableHead><TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
    </TableRow></TableHeader><TableBody>{rows.map((member, index) => <TableRow key={member.uuid} data-state={selected.has(member.uuid) ? "selected" : undefined}>
      {canManage && <TableCell><Checkbox aria-label={`Select ${member.name || member.phone || "member"}`} checked={selected.has(member.uuid)} onCheckedChange={(v) => toggle(member.uuid, v === true)} /></TableCell>}
      <TableCell>{(current - 1) * pageSize + index + 1}</TableCell><TableCell className="font-medium">{member.name || "—"}</TableCell><TableCell>{member.phone || "—"}</TableCell><TableCell>{member.identity_number || "—"}</TableCell><TableCell><StatusBadge status={member.is_active ? "active" : "inactive"} /></TableCell><TableCell className="text-muted-foreground">{formatRecordDate(member.created_at)}</TableCell>
      <TableCell className="text-right"><FactoryMemberActions factory={factory} member={member} canManage={canManage} onChanged={onChanged} /></TableCell>
    </TableRow>)}</TableBody></Table> : <div className="p-5"><EmptyCard icon={Users} title={`No ${title} found`} description="Add a member or adjust your search." /></div>}
    <RecordPagination from={rows.length ? (current - 1) * pageSize + 1 : 0} to={Math.min(current * pageSize, filtered.length)} total={filtered.length} page={current} pageCount={pages} onPageChange={setPage} />
  </TablePanel>;
}
