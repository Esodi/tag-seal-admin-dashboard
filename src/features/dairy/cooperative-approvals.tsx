"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, ClipboardCheck, RefreshCw, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/ui/dashboard";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { CooperativeApprovalDetails } from "./cooperative-approval-details";
import { applicantName, applicationDate, type ApprovalsResponse, type CooperativeApplication } from "./cooperative-approval-types";

export function CooperativeApprovals() {
  const [data, setData] = useState<ApprovalsResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CooperativeApplication | null>(null);
  const [role, setRole] = useState("amcos_user");
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [saving, setSaving] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await authenticatedFetch("/api/admin/dairy/cooperatives/approvals", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not load applications.");
      if (id === requestId.current) setData(payload);
    } catch (error) {
      if (id === requestId.current) setLoadError(error instanceof Error ? error.message : "Could not load applications.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const activeRequest = requestId;
    void load();
    return () => { activeRequest.current++; };
  }, [load]);

  const review = async () => {
    if (!selected || !decision) return;
    setSaving(true);
    setReviewError(null);
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/approvals/${encodeURIComponent(selected.uuid)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, ...(decision === "approved" ? { role } : {}) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "The decision could not be saved.");
      toast.success(decision === "approved" ? "Membership approved." : "Membership request disapproved.");
      setSelected(null);
      setDecision(null);
      await load();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "The decision could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const rows = data?.data.filter((item) => [applicantName(item), item.amcos_name, item.phone].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase()))) ?? [];

  return <>
    <DashboardStatCard className="h-full" label="Pending approvals" value={<StatNumber value={data?.data.length ?? 0} />} loading={!data || Boolean(loadError)} note={
      <button type="button" aria-haspopup="dialog" onClick={() => { setSheet(true); void load(); }} className="inline-flex items-center gap-1 text-left font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
        {loadError ? "Open approvals to retry" : "Review membership requests"}<ChevronRight className="size-4" aria-hidden="true" />
      </button>
    } />
    <Dialog open={sheet} onOpenChange={setSheet}>
      <DialogContent size="lg" className="left-auto right-0 top-0 flex h-dvh max-h-dvh w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-5 pr-14">
          <DialogTitle>Pending approvals</DialogTitle>
          <DialogDescription>Review membership requests from cooperative users.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search membership requests" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, cooperative or phone…" className="pl-9" /></div>
          <Button variant="outline" size="icon" aria-label="Refresh applications" disabled={loading} onClick={() => void load()}><RefreshCw className={loading ? "animate-spin" : undefined} /></Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loadError ? <EmptyCard icon={RefreshCw} title="Could not load requests" description={loadError} action={<Button variant="outline" size="sm" onClick={() => void load()}>Try again</Button>} /> :
            !data ? <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div> :
            rows.length === 0 ? <EmptyCard icon={Users} title={search.trim() ? "No matching requests" : "No pending requests"} description={search.trim() ? "Try a different search." : "New membership requests will appear here."} /> :
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{rows.length} {rows.length === 1 ? "request" : "requests"}{search.trim() ? " found" : " waiting"}</p>
              {rows.map((item) => <button key={item.uuid} type="button" className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => { setSelected(item); setRole("amcos_user"); setDecision(null); setReviewError(null); }}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><ClipboardCheck className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{applicantName(item)}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{item.amcos_name}{item.phone ? ` · ${item.phone}` : ""}</span><span className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status="pending" />{item.farmer_details && <Badge variant="secondary">Farmer</Badge>}<span className="text-xs text-muted-foreground">{applicationDate(item.created_at)}</span></span></span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>)}
            </div>}
        </div>
      </DialogContent>
    </Dialog>
    <CooperativeApprovalDetails application={selected} role={role} saving={saving} error={reviewError}
      onClose={() => { setSelected(null); setDecision(null); }} onRole={setRole} onDecision={setDecision} />
    <ConfirmationAlertDialog
      open={decision !== null}
      onOpenChange={(open) => {
        if (!open && !saving) setDecision(null);
      }}
      title={decision === "approved" ? "Approve membership?" : "Disapprove membership?"}
      description={decision === "approved"
        ? `Approve ${selected ? applicantName(selected) : "this applicant"} for ${selected?.amcos_name ?? "this cooperative"}?`
        : `Disapprove ${selected ? applicantName(selected) : "this applicant"}'s membership request? Their login account and farmer record will be kept.`}
      confirmLabel={decision === "approved" ? "Approve" : "Disapprove"}
      destructive={decision === "rejected"}
      onConfirm={() => void review()}
    />
  </>;
}
