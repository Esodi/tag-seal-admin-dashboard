"use client";

import { BulkRecordAction } from "@/components/ui/bulk-record-action";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Eye, KeyRound, MoreVertical, Plus, Search, ShieldAlert, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button, Card, CardContent, ConfirmationAlertDialog, CustomViewDetailsDialog, DataTable, DetailItem, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Field, FieldLabel, FormDialog, FormSelect, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, StatNumber, StatusBadge, toast } from "@/components/ui";
import { authenticatedFetch } from "@/lib/auth/session";

type OtpRecord = {
  id: number; source: "phone" | "legacy"; recipient: string; channel: string;
  purpose: string; attempts: number | null; status: string; expires_at: string;
  verified_at: string | null; created_at: string; updated_at: string;
};
type OtpResponse = {
  data: OtpRecord[]; meta: { currentPage: number; lastPage: number; perPage: number; total: number };
  stats: { total: number; pending: number; verified: number; expired: number; locked: number };
  canManage: boolean;
};
const purposeLabels: Record<string, string> = { register: "Phone registration", reset: "PIN reset", "password-recovery": "Password recovery" };
const formatDate = (value: string | null) => value ? new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : value.replace(" ", "T") + "Z").toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam", dateStyle: "medium", timeStyle: "short" }) : "—";

export function OtpDashboard() {
  const [result, setResult] = useState<OtpResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [viewing, setViewing] = useState<OtpRecord | null>(null);
  const [deleting, setDeleting] = useState<OtpRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("register");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setSelected(new Set());
    setError(null);
    const params = new URLSearchParams({ page: String(page), per_page: pageSize, sort });
    if (query.trim()) params.set("search", query.trim());
    if (status !== "all") params.set("status", status);
    if (channel !== "all") params.set("channel", channel);
    try {
      const response = await authenticatedFetch(`/api/admin/otp-verifications?${params}`, { signal, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "OTP records could not be loaded.");
      if (!signal?.aborted) {
        setResult(payload);
        if (page > payload.meta.lastPage) setPage(Math.max(1, payload.meta.lastPage));
      }
    } catch (error) {
      if (!signal?.aborted) setError(error instanceof Error ? error.message : "OTP records could not be loaded.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, pageSize, sort, query, status, channel]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void load(controller.signal), 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [load]);

  async function createOtp() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await authenticatedFetch("/api/admin/otp-verifications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, purpose }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "OTP could not be created.");
      toast.success(payload.message);
      setCreating(false); setPhone("");
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "OTP could not be created."); }
    finally { setBusy(false); }
  }
  async function deleteOtp() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      const response = await authenticatedFetch(`/api/admin/otp-verifications/${deleting.source}/${deleting.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "OTP could not be deleted.");
      toast.success(payload.message); setDeleting(null); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "OTP could not be deleted."); }
    finally { setBusy(false); }
  }
  const stats = result?.stats;
  return <div className="mx-auto max-w-7xl space-y-6">
    <DashboardHeader parent="Security" parentHref="/dashboard/security" title="OTP Verifications" description="Monitor phone verification and password recovery codes across the platform." actions={result?.canManage ? <Button onClick={() => setCreating(true)}><Plus />Create OTP</Button> : undefined} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Total OTPs", value: stats?.total, note: "All verification records", icon: KeyRound },
        { label: "Pending", value: stats?.pending, note: "Awaiting verification", icon: Clock },
        { label: "Verified", value: stats?.verified, note: "Successfully verified", icon: CheckCircle2 },
        { label: "Expired / locked", value: stats ? stats.expired + stats.locked : undefined, note: "No longer available for verification", icon: ShieldAlert },
      ].map(({ label, value, note }) => <DashboardStatCard key={label} label={<>{label}</>} value={<StatNumber value={value} />} note={<>{note}</>} loading={value === undefined} />)}
    </div>
    {error && <Card role="alert"><CardContent className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-danger">{error}</p><Button variant="outline" onClick={() => void load()}>Try again</Button></CardContent></Card>}
    <DataTable rowNumberStart={(page - 1) * Number(pageSize) + 1} selection={result?.canManage ? { ids: selected, onChange: setSelected } : undefined} rows={loading || error ? [] : result?.data ?? []} getRowId={(row) => `${row.source}-${row.id}`} emptyTitle={loading ? "Loading OTP records…" : error ? "OTP records unavailable" : "No OTP records found"} emptyDescription={loading ? "Fetching verification activity." : error ? "Try loading the records again." : "Try another search or filter. New verification requests will appear here."} toolbar={<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search OTP records" className="pl-9" placeholder="Search recipient or purpose…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></div>
      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        {result?.canManage && <BulkRecordAction ids={[...selected]} disabled={loading || busy} getRequest={(id) => { const [source, recordId] = String(id).split("-"); return { url: `/api/admin/otp-verifications/${source}/${recordId}`, method: "DELETE" }; }} onComplete={() => load()} />}
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
          <SelectTrigger aria-label="Filter by status" size="sm" className="h-8 w-auto min-w-[8rem] font-normal"><SelectValue /></SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All statuses</SelectItem>
            {["pending", "verified", "expired", "locked"].map((value) => <SelectItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={(value) => { setChannel(value); setPage(1); }}>
          <SelectTrigger aria-label="Filter by channel" size="sm" className="h-8 w-auto min-w-[7.5rem] font-normal"><SelectValue /></SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
          <SelectTrigger aria-label="Sort OTP records" size="sm" className="h-8 w-auto min-w-[8.5rem] font-normal"><SelectValue /></SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pageSize} onValueChange={(value) => { setPageSize(value); setPage(1); }}>
          <SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-[6.25rem] font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger>
          <SelectContent align="end">
            {[10, 30, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>} columns={[
      { key: "recipient", header: "Recipient", cell: (row) => <span className="font-medium">{row.recipient || "—"}</span> },
      { key: "channel", header: "Channel", cell: (row) => row.channel === "sms" ? "SMS" : "Email" },
      { key: "purpose", header: "Purpose", cell: (row) => purposeLabels[row.purpose] ?? row.purpose },
      { key: "attempts", header: "Attempts", cell: (row) => row.attempts === null ? "—" : `${row.attempts} / 5` },
      { key: "expires", header: "Expires (EAT)", cell: (row) => formatDate(row.expires_at) },
      { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
      { key: "created", header: "Created at", cell: (row) => formatDate(row.created_at) },
      { key: "actions", header: <span className="sr-only">Actions</span>, cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${row.recipient}`} disabled={busy}><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setViewing(row)}><Eye />View details</DropdownMenuItem>{result?.canManage && <DropdownMenuItem className="text-danger" onSelect={() => setDeleting(row)}><Trash2 />Delete</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu> },
    ]} pagination={{ from: result?.data.length ? (page - 1) * Number(pageSize) + 1 : 0, to: Math.min(page * Number(pageSize), result?.meta.total ?? 0), total: result?.meta.total ?? 0, page, pageCount: result?.meta.lastPage ?? 1, onPageChange: setPage, disabled: loading || Boolean(error) }} />
    <CustomViewDetailsDialog open={Boolean(viewing)} onOpenChange={(open) => { if (!open) setViewing(null); }} title="OTP verification details" description="Verification metadata. All times are East Africa Time.">{viewing && <div className="grid gap-3 sm:grid-cols-2">{Object.entries({ Recipient: viewing.recipient, Channel: viewing.channel.toUpperCase(), Purpose: purposeLabels[viewing.purpose] ?? viewing.purpose, Status: viewing.status, Attempts: viewing.attempts ?? "Not recorded", Created: formatDate(viewing.created_at), Updated: formatDate(viewing.updated_at), Expires: formatDate(viewing.expires_at), Verified: formatDate(viewing.verified_at) }).map(([label, value]) => <DetailItem key={label} label={label}>{value}</DetailItem>)}</div>}</CustomViewDetailsDialog>
    <FormDialog open={creating} onOpenChange={(open) => { if (!busy) setCreating(open); }} title="Create OTP" description="Send a new verification code to a phone number. Codes expire after five minutes." submitLabel={busy ? "Sending…" : "Create OTP"} size="md" onSubmit={(event) => { event.preventDefault(); return createOtp(); }}>
      <Field><FieldLabel htmlFor="otp-phone">Phone number *</FieldLabel><Input id="otp-phone" type="tel" required value={phone} disabled={busy} onChange={(event) => setPhone(event.target.value)} placeholder="+255712345678" /></Field>
      <Field><FieldLabel htmlFor="otp-purpose">Purpose *</FieldLabel><FormSelect id="otp-purpose" value={purpose} disabled={busy} onValueChange={setPurpose} options={[{ value: "register", label: "Phone registration" }, { value: "reset", label: "PIN reset" }]} /></Field>
    </FormDialog>
    <ConfirmationAlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }} icon={<Trash2 />} title="Delete OTP record?" description={`Delete the verification record for ${deleting?.recipient ?? "this recipient"}? Any pending code or setup verification will stop working.`} confirmLabel="Delete OTP" destructive onConfirm={deleteOtp} />
  </div>;
}
