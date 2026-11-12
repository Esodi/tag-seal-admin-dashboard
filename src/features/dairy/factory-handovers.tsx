"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, ClipboardCheck, Eye, MoreVertical, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RecordPagination } from "@/components/ui/record-pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyCard } from "@/components/ui/empty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomViewDetailsDialog, DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { reportDate } from "@/lib/report-print";

type Receipt = {
  uuid: string; action: string; status: string; received_volume_liters: string; accepted_volume_liters: string;
  discrepancy_liters: string; arrival_temperature_celsius: string | null; seals_intact: boolean;
  qa_status: string | null; quality: Record<string, unknown> | null; reason: string | null; notes: string | null;
  received_by_name: string | null; received_at: string | null; decided_by_name: string | null;
  decided_at: string | null; decision_notes: string | null;
};
type Trip = {
  uuid: string; trip_number: string; vehicle_plate_number: string; driver_name: string | null;
  phase: string; created_at: string; dispatch_count: number; received_count: number; awaiting_approval: number;
  dispatches: { uuid: string; dispatch_code: string; centre_name: string | null; quantity: string; receipt: Receipt | null }[];
};
type Result = { data: Trip[]; meta: { canApprove: boolean; total: number; currentPage: number; lastPage: number; from: number | null; to: number | null } };
const litres = (value: string) => `${Number(value).toLocaleString("en-TZ")} L`;

export function FactoryHandovers({ factoryUuid }: { factoryUuid: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Trip | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const [approving, setApproving] = useState<Trip | null>(null);
  const [rejecting, setRejecting] = useState<Trip | null>(null);
  const base = `/api/admin/dairy/factories/${encodeURIComponent(factoryUuid)}/handovers`;
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ search, status, sort, page: String(page), per_page: String(pageSize) });
        const response = await authenticatedFetch(`${base}?${params}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Handovers could not be loaded.");
        if (!controller.signal.aborted) { setResult(payload); if (page > payload.meta.lastPage) setPage(Math.max(1, payload.meta.lastPage)); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Handovers could not be loaded."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, search ? 300 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [base, search, status, sort, page, pageSize, revision]);
  useEffect(() => {
    const timer = window.setInterval(() => { if (!selected && document.visibilityState === "visible") setRevision((n) => n + 1); }, 30000);
    return () => window.clearInterval(timer);
  }, [selected]);

  const canDecide = (trip: Trip) => trip.awaiting_approval > 0 && Boolean(result?.meta.canApprove);

  async function send(trip: Trip, decision: "approved" | "rejected", reason: string) {
    const response = await authenticatedFetch(`${base}/${encodeURIComponent(trip.uuid)}/decision`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, notes: reason.trim() || null, receipt_uuids: trip.dispatches.flatMap((d) => d.receipt?.status === "waiting_approval" ? [d.receipt.uuid] : []) }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "The decision could not be saved.");
    toast.success(decision === "approved" ? `Handovers on ${trip.trip_number} approved.` : `Handovers on ${trip.trip_number} rejected.`);
    setRevision((n) => n + 1);
  }

  async function decide(decision: "approved" | "rejected") {
    if (!selected || saving) return;
    if (decision === "rejected" && !notes.trim()) { setDecisionError("Enter a reason for rejecting these handovers."); return; }
    setSaving(true); setDecisionError("");
    try { await send(selected, decision, notes); setSelected(null); }
    catch (e) { setDecisionError(e instanceof Error ? e.message : "The decision could not be saved."); }
    finally { setSaving(false); }
  }

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    if (!rejecting) return false;
    if (!reason) { toast.error("Give the reason for rejecting."); return false; }
    try { await send(rejecting, "rejected", reason); setRejecting(null); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : "The decision could not be saved."); return false; }
  }

  return <>
    <TablePanel>
      <TableToolbar>
        <div className="relative min-w-0 flex-1 lg:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search handovers" placeholder="Search trip or vehicle plate…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger aria-label="Handover status" size="sm" className="w-auto min-w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All handovers</SelectItem><SelectItem value="waiting_approval">Waiting approval</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}><SelectTrigger aria-label="Sort handovers" size="sm" className="w-auto"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent></Select>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}><SelectTrigger aria-label="Rows per page" size="sm" className="w-auto"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger><SelectContent>{[10, 30, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select>
        </div>
      </TableToolbar>
      {result && !result.meta.canApprove && <p className="border-b px-5 py-3 text-sm text-muted-foreground">Only a super admin, this factory’s MCU admin or an active factory manager can approve or reject handovers.</p>}
      {error ? <div className="p-5"><EmptyCard icon={ClipboardCheck} title="Could not load handovers" description={error} action={<Button onClick={() => setRevision((n) => n + 1)}>Try again</Button>} /></div>
        : loading ? <div className="p-5"><Skeleton className="h-36 w-full" /></div>
        : !result?.data.length ? <div className="p-5"><EmptyCard icon={ClipboardCheck} title="No matching handovers" description="Operator receipts appear here after they are synced from the app." /></div>
        : <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Trip / Vehicle</TableHead><TableHead>Driver</TableHead><TableHead>Received batches</TableHead><TableHead>Waiting approval</TableHead><TableHead>Phase</TableHead><TableHead>Created at</TableHead><TableHead className="text-right"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          <TableBody>{result.data.map((trip, index) => <TableRow key={trip.uuid}><TableCell>{(result.meta.from ?? 1) + index}</TableCell><TableCell><p className="font-medium">{trip.trip_number}</p><p className="text-xs text-muted-foreground">{trip.vehicle_plate_number}</p></TableCell><TableCell>{trip.driver_name || "—"}</TableCell><TableCell>{trip.received_count} / {trip.dispatch_count}</TableCell><TableCell>{trip.awaiting_approval}</TableCell><TableCell><StatusBadge status={trip.phase} /></TableCell><TableCell>{reportDate(trip.created_at, false)}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${trip.trip_number}`}><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => { setSelected(trip); setNotes(""); setDecisionError(""); }}><Eye />View details</DropdownMenuItem>
            {canDecide(trip) && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setApproving(trip)}><Check />Approve</DropdownMenuItem><DropdownMenuItem destructive onSelect={() => setRejecting(trip)}><X />Reject</DropdownMenuItem></>}
          </DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table>}
      {result && !error && !loading && <RecordPagination from={result.meta.from} to={result.meta.to} total={result.meta.total} page={result.meta.currentPage} pageCount={result.meta.lastPage} onPageChange={setPage} />}
    </TablePanel>
    <CustomViewDetailsDialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !saving) setSelected(null); }} title={`Handover review · ${selected?.trip_number ?? ""}`} description="Review the operator’s receipt for each batch. Your decision applies to all handovers waiting for approval on this trip."
      actions={selected && selected.awaiting_approval > 0 && result?.meta.canApprove ? <><Button variant="outline" disabled={saving} onClick={() => void decide("rejected")}>Reject handovers</Button><Button disabled={saving} onClick={() => void decide("approved")}>{saving ? "Saving…" : "Approve handovers"}</Button></> : undefined}>
      {selected?.dispatches.map((dispatch) => <DetailSection key={dispatch.uuid} title={dispatch.dispatch_code} description={dispatch.centre_name || undefined}>
        <DetailItem label="Dispatched">{litres(dispatch.quantity)}</DetailItem>
        {!dispatch.receipt ? <DetailItem label="Receipt">Not yet received</DetailItem> : <>
          <DetailItem label="Status"><StatusBadge status={dispatch.receipt.status} /></DetailItem>
          <DetailItem label="Operator action">{dispatch.receipt.action === "receive" ? "Received" : "Rejected at receipt"}</DetailItem>
          <DetailItem label="Received / Accepted">{litres(dispatch.receipt.received_volume_liters)} / {litres(dispatch.receipt.accepted_volume_liters)}</DetailItem>
          <DetailItem label="Variance">{litres(dispatch.receipt.discrepancy_liters)}</DetailItem>
          <DetailItem label="Arrival temperature">{dispatch.receipt.arrival_temperature_celsius == null ? "—" : `${dispatch.receipt.arrival_temperature_celsius} °C`}</DetailItem>
          <DetailItem label="Seals intact">{dispatch.receipt.seals_intact ? "Yes" : "No"}</DetailItem>
          <DetailItem label="Quality assessment">{dispatch.receipt.qa_status?.replaceAll("_", " ") || "—"}</DetailItem>
          {Object.entries(dispatch.receipt.quality ?? {}).map(([key, value]) => <DetailItem key={key} label={key.replaceAll("_", " ")}>{typeof value === "boolean" ? value ? "Yes" : "No" : typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</DetailItem>)}
          <DetailItem label="Reason / Notes">{[dispatch.receipt.reason, dispatch.receipt.notes].filter(Boolean).join(" · ") || "—"}</DetailItem>
          <DetailItem label="Received by">{dispatch.receipt.received_by_name || "—"}</DetailItem>
          <DetailItem label="Received at">{reportDate(dispatch.receipt.received_at)}</DetailItem>
          {dispatch.receipt.status !== "waiting_approval" && <><DetailItem label="Decided by">{dispatch.receipt.decided_by_name || "—"}</DetailItem><DetailItem label="Decided at">{reportDate(dispatch.receipt.decided_at)}</DetailItem><DetailItem label="Decision notes">{dispatch.receipt.decision_notes || "—"}</DetailItem></>}
        </>}
      </DetailSection>)}
      {selected && selected.awaiting_approval > 0 && result?.meta.canApprove && <div className="space-y-2"><label htmlFor="handover-notes" className="text-sm font-medium">Decision notes (required for rejection)</label><textarea id="handover-notes" className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm" maxLength={1000} value={notes} disabled={saving} onChange={(e) => setNotes(e.target.value)} />{selected.received_count < selected.dispatch_count && <p className="text-sm text-muted-foreground">Some batches have not been received. This trip remains open until every batch has a decision.</p>}</div>}
      {decisionError && <div className="space-y-3"><p role="alert" className="text-sm text-destructive">{decisionError}</p><Button variant="outline" disabled={saving} onClick={() => { setSelected(null); setRevision((n) => n + 1); }}>Reload handovers</Button></div>}
    </CustomViewDetailsDialog>
    {rejecting && <FormDialog open={Boolean(rejecting)} onOpenChange={(open) => !open && setRejecting(null)} title={`Reject handovers on ${rejecting.trip_number}?`}
      description={`All ${rejecting.awaiting_approval} handovers waiting for approval on this trip are rejected. The reason is saved with the decision.`} onSubmit={reject} submitLabel="Reject">
      <Field><FieldLabel htmlFor="handover-reject-reason" required>Reason</FieldLabel><Textarea id="handover-reject-reason" name="reason" required maxLength={1000} /></Field>
    </FormDialog>}
    <ConfirmationAlertDialog open={Boolean(approving)} onOpenChange={(open) => !open && setApproving(null)} title={`Approve handovers on ${approving?.trip_number ?? ""}?`}
      description={`All ${approving?.awaiting_approval ?? 0} handovers waiting for approval on this trip are approved. When every batch has a decision, the trip is completed.`}
      confirmLabel="Approve" onConfirm={async () => { if (!approving) return; try { await send(approving, "approved", ""); } catch (e) { toast.error(e instanceof Error ? e.message : "The decision could not be saved."); } }} />
  </>;
}
