"use client";

import { useState } from "react";
import { LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";

/** Uses the resource's existing per-record endpoint and reports partial failures. */
export function BulkRecordAction({ ids, action = "delete", getRequest, onComplete, disabled = false }: {
  ids: Array<string | number>;
  action?: "delete" | "archive" | "restore";
  getRequest: (id: string | number) => { url: string; method: "DELETE" | "POST" | "PATCH"; body?: Record<string, unknown> };
  onComplete: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const label = action === "restore" ? "Restore" : action === "archive" ? "Archive" : "Delete";

  async function confirm() {
    if (busy) return;
    const pending = [...ids];
    setBusy(true);
    let completed = 0;
    let failure = "";
    try {
      for (const id of pending) {
        try {
          const request = getRequest(id);
          const response = await authenticatedFetch(request.url, {
            method: request.method,
            ...(request.body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(request.body) } : {}),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || payload.status === false) throw new Error(payload.message ?? "The request failed.");
          completed += 1;
        } catch (error) {
          failure = error instanceof Error ? error.message : "The request failed.";
        }
      }
      if (completed) toast.success(`${completed} record${completed === 1 ? "" : "s"} ${action === "restore" ? "restored" : action === "archive" ? "archived" : "deleted"}.`);
      if (completed < pending.length) toast.error(`${pending.length - completed} record(s) could not be ${action === "restore" ? "restored" : action === "archive" ? "archived" : "deleted"}. ${failure}`);
      if (completed) await onComplete();
    } finally {
      setBusy(false);
    }
  }

  if (!ids.length && !busy) return null;
  return <>
    <Button type="button" variant={action === "restore" ? "outline" : "destructive"} size="sm" disabled={disabled || busy} onClick={() => setConfirming(true)}>
      {busy ? <LoaderCircle className="animate-spin" /> : action === "restore" ? <RotateCcw /> : <Trash2 />}
      {busy ? "Processing…" : `${label} (${ids.length})`}
    </Button>
    <ConfirmationAlertDialog open={confirming} onOpenChange={setConfirming} title={`${label} ${ids.length} selected records?`} description={action === "delete" ? "The selected records will be deleted. This action cannot be undone." : action === "archive" ? "The selected records will move to Archived and can be restored later." : "The selected records will return to the current list."} confirmLabel={label} destructive={action !== "restore"} onConfirm={confirm} />
  </>;
}
