"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, MoreVertical, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { MediaPreviewList } from "@/components/media/media-preview";
import { mediaSourcesFrom } from "@/components/media/media-source";
import { CustomViewDetailsDialog, DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import type { TransporterRow } from "./transporter-registry-types";

async function send(path: string, method: string, body?: Record<string, unknown>) {
  const response = await authenticatedFetch(`/api/admin/dairy/transport/companies/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? "The request failed.");
  return payload;
}

const editable: Array<[keyof TransporterRow, string, boolean]> = [
  ["name", "Company name", true],
  ["license_number", "Business licence number", true],
  ["tin_number", "Company TIN number", true],
  ["phone", "Company phone", true],
  ["email", "Company email", false],
  ["contact_person", "Contact person", true],
  ["contact_title", "Contact title", false],
  ["contact_email", "Contact email", false],
  ["physical_address", "Physical address", false],
  ["website", "Website", false],
];

export function TransporterRegistryActions({ row, onChanged }: { row: TransporterRow; onChanged: () => void }) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const archived = Boolean(row.archived_at);
  const pending = row.approval_status === "pending";
  const id = encodeURIComponent(row.uuid);

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
      onChanged();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request failed.");
      return false;
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(editable.map(([key]) => [key, String(form.get(key) ?? "").trim() || null]));
    const ok = await run(() => send(id, "PATCH", body), "Changes saved.");
    if (ok) setEditing(false);
    return ok;
  }

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const remarks = String(new FormData(event.currentTarget).get("remarks") ?? "").trim();
    if (!remarks) {
      toast.error("Give the reason for rejecting.");
      return false;
    }
    const ok = await run(() => send(`${id}/reject`, "POST", { remarks }), `${row.name} rejected. The applicant was notified by SMS.`);
    if (ok) setRejecting(false);
    return ok;
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}><MoreVertical /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>
        {!archived && <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>}
        {!archived && pending && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setApproving(true)}><Check />Approve</DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setRejecting(true)}><X />Reject</DropdownMenuItem>
        </>}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive={!archived} onSelect={() => archived ? void run(() => send(`${id}/restore`, "POST"), "Transporter restored.") : setArchiving(true)}>
          {archived ? <RotateCcw /> : <Trash2 />}{archived ? "Restore" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={row.name} description="Transporter company" size="lg"
      actions={!archived && pending ? <Button onClick={() => { setViewing(false); setApproving(true); }}><Check />Approve</Button> : undefined}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Approval">{row.approval_status === "approved" ? <Badge>Approved</Badge> : <StatusBadge status={row.approval_status} />}</DetailItem>
        <DetailItem label="Union (MCU)">{row.mcu_name || "—"}</DetailItem>
        <DetailItem label="Business licence">{row.license_number}</DetailItem>
        <DetailItem label="TIN">{row.tin_number || "—"}</DetailItem>
        <DetailItem label="Company phone">{row.phone}</DetailItem>
        <DetailItem label="Company email">{row.email || "—"}</DetailItem>
        <DetailItem label="Contact person">{[row.contact_person, row.contact_title].filter(Boolean).join(" · ")}</DetailItem>
        <DetailItem label="Contact phone">{row.contact_phone || "—"}</DetailItem>
        <DetailItem label="Location">{[row.physical_address, row.district_name, row.region_name].filter(Boolean).join(", ") || "—"}</DetailItem>
        <DetailItem label="Fleet">{row.vehicles_count} vehicles · {row.drivers_count} drivers</DetailItem>
        {row.approval_remarks && <DetailItem label="Remarks">{row.approval_remarks}</DetailItem>}
      </div>
      <DetailSection title="Documents" description="Business licence, carrier permit and insurance documents on file.">
        <MediaPreviewList items={mediaSourcesFrom(row.document_urls)} emptyText="No documents on file." />
      </DetailSection>
    </CustomViewDetailsDialog>

    {editing && <FormDialog open={editing} onOpenChange={setEditing} fieldsClassName="sm:grid-cols-2" title={`Edit ${row.name}`} onSubmit={saveEdit} submitLabel="Save changes">
      {editable.map(([key, label, required]) => <Field key={key} className={key === "name" ? "sm:col-span-2" : undefined}>
        <FieldLabel htmlFor={`transporter-${key}`} required={required}>{label}</FieldLabel>
        <Input id={`transporter-${key}`} name={key} defaultValue={String(row[key] ?? "")} required={required} maxLength={255} />
      </Field>)}
    </FormDialog>}

    {rejecting && <FormDialog open={rejecting} onOpenChange={setRejecting} title={`Reject ${row.name}?`} description="The applicant receives this reason by SMS and can apply again." onSubmit={reject} submitLabel="Reject">
      <Field><FieldLabel htmlFor="transporter-remarks" required>Reason</FieldLabel><Textarea id="transporter-remarks" name="remarks" required maxLength={500} /></Field>
    </FormDialog>}

    <ConfirmationAlertDialog open={approving} onOpenChange={setApproving} title={`Approve ${row.name}?`}
      description="The company can then register vehicles and drivers in the app. The applicant is notified by SMS."
      confirmLabel="Approve" onConfirm={async () => { await run(() => send(`${id}/approve`, "POST"), `${row.name} approved.`); }} />
    <ConfirmationAlertDialog open={archiving} onOpenChange={setArchiving} title={`Delete ${row.name}?`}
      description="The company is archived and loses access to its workspace. Its vehicles, drivers and trips are kept and it can be restored from the Archived tab."
      confirmLabel="Delete" destructive onConfirm={async () => { await run(() => send(id, "DELETE"), "Transporter archived."); }} />
  </>;
}
