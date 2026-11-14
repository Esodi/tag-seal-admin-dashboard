"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, MoreVertical, RotateCcw, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Textarea } from "@/components/ui/textarea";
import { commerceDateTime, commerceLabel } from "@/features/commerce/commerce-config";
import { RegistryStatus } from "@/features/registry/registry-status";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { formatRecordDate } from "@/lib/resource-table";
import { animalLabel } from "./vet-columns";
import { missingVetDocuments } from "./vet-document-rules";
import { VetDocumentsSection } from "./vet-documents";
import type { VetRecord, VetServiceRequestRecord } from "./types";

type ActionProps<T> = { row: T; onChanged: () => void };

export function VetActions({ row, onChanged }: ActionProps<VetRecord>) {
  const [viewing, setViewing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const path = `/api/admin/vet/vets/${row.id}`;
  const pending = row.verificationStatus === "pending";
  const complete = missingVetDocuments(row).length === 0;
  const location = [row.address, row.district?.name, row.region?.name].filter(Boolean).join(", ");

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const remarks = String(new FormData(event.currentTarget).get("remarks") ?? "").trim();
    const ok = await registryRun(() => registrySend(`${path}/reject`, "POST", { remarks }), `${row.fullName} rejected.`, onChanged);
    if (ok) setRejecting(false);
    return ok;
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.fullName}`}><MoreVertical /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>
        {pending && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!complete} onSelect={() => setApproving(true)}><Check />{complete ? "Approve" : "Approve (documents missing)"}</DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setRejecting(true)}><X />Reject</DropdownMenuItem>
        </>}
        <DropdownMenuSeparator />
        {row.status === "active"
          ? <DropdownMenuItem destructive onSelect={() => setDeactivating(true)}><UserX />Deactivate</DropdownMenuItem>
          : <DropdownMenuItem onSelect={() => void registryRun(() => registrySend(path, "PUT", { status: "active" }), `${row.fullName} activated.`, onChanged)}><RotateCcw />Activate</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>

    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={row.fullName} description={row.clinicName ? `Veterinarian · ${row.clinicName}` : "Veterinarian"} size="lg"
      actions={pending && complete ? <Button onClick={() => { setViewing(false); setApproving(true); }}><Check />Approve</Button> : undefined}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Approval"><RegistryStatus status={row.verificationStatus} /></DetailItem>
        <DetailItem label="Status"><RegistryStatus status={row.status} /></DetailItem>
        <DetailItem label="Phone">{row.phoneNumber || "—"}</DetailItem>
        <DetailItem label="Email">{row.email || "—"}</DetailItem>
        <DetailItem label="Sex"><span className="capitalize">{row.gender || "—"}</span></DetailItem>
        <DetailItem label="Date of birth">{formatRecordDate(row.dateOfBirth)}</DetailItem>
        <DetailItem label="Licence number">{row.medicalLicenseNo || "—"}</DetailItem>
        <DetailItem label="Licensing authority">{row.licenseAuthority || "—"}</DetailItem>
        <DetailItem label="Licence expires">{formatRecordDate(row.licenseExpiryDate)}</DetailItem>
        <DetailItem label="Secondary education">{row.schoolLevel || "—"}</DetailItem>
        <DetailItem label="Location">{location || "—"}</DetailItem>
        <DetailItem label="Experience">{row.yearsOfExperience ? `${row.yearsOfExperience} years` : "—"}</DetailItem>
        <DetailItem label="Visits done">{row.completedRequestsCount ?? 0}</DetailItem>
        <DetailItem label="Rating">{row.ratingCount ? `${Number(row.ratingAverage ?? 0).toFixed(1)} from ${row.ratingCount} reviews` : "No reviews yet"}</DetailItem>
        {row.specializations && row.specializations.length > 0 && <DetailItem label="Specializations" className="sm:col-span-2">{row.specializations.map(commerceLabel).join(", ")}</DetailItem>}
        {row.verificationNotes && <DetailItem label="Remarks" className="sm:col-span-2">{row.verificationNotes}</DetailItem>}
      </div>
      <VetDocumentsSection row={row} path={path} />
    </CustomViewDetailsDialog>

    {rejecting && <FormDialog open={rejecting} onOpenChange={setRejecting} title={`Reject ${row.fullName}?`} description="The vet sees this reason in the app and can update their details and apply again." onSubmit={reject} submitLabel="Reject">
      <Field><FieldLabel htmlFor="vet-remarks" required>Reason</FieldLabel><Textarea id="vet-remarks" name="remarks" required maxLength={1000} /></Field>
    </FormDialog>}

    <ConfirmationAlertDialog open={approving} onOpenChange={setApproving} title={`Approve ${row.fullName}?`}
      description="Farmers can then find this vet and request visits from the app."
      confirmLabel="Approve" onConfirm={async () => { await registryRun(() => registrySend(`${path}/approve`, "POST"), `${row.fullName} approved.`, onChanged); }} />
    <ConfirmationAlertDialog open={deactivating} onOpenChange={setDeactivating} title={`Deactivate ${row.fullName}?`}
      description="Farmers can no longer request this vet. Past visits are kept and you can activate the vet again."
      confirmLabel="Deactivate" destructive onConfirm={async () => { await registryRun(() => registrySend(path, "PUT", { status: "notActive" }), `${row.fullName} deactivated.`, onChanged); }} />
  </>;
}

const timelineSteps: Array<[string, string]> = [["createdAt", "Requested"], ["acceptedAt", "Accepted"], ["travellingAt", "Travelling"], ["arrivedAt", "Arrived"], ["startedAt", "Treatment started"], ["completedAt", "Completed"], ["cancelledAt", "Cancelled"]];

export function RequestActions({ row }: ActionProps<VetServiceRequestRecord>) {
  const [viewing, setViewing] = useState(false);
  return <>
    <Button variant="ghost" size="icon-sm" aria-label={`View request ${row.uuid}`} onClick={() => setViewing(true)}><Eye /></Button>
    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={commerceLabel(row.problemCategory)} description={`Service request · ${row.uuid.slice(0, 8).toUpperCase()}`} size="lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Status"><RegistryStatus status={row.status} /></DetailItem>
        <DetailItem label="Urgency">{commerceLabel(row.urgency)}</DetailItem>
        <DetailItem label="Farmer">{[row.farmer?.name, row.contactPhone].filter(Boolean).join(" · ") || "—"}</DetailItem>
        <DetailItem label="Animal">{animalLabel(row)}</DetailItem>
        <DetailItem label="Vet">{row.vet ? [row.vet.fullName, row.vet.phoneNumber].filter(Boolean).join(" · ") : "Not assigned"}</DetailItem>
        <DetailItem label="Location">{row.locationAddress || "—"}</DetailItem>
        {row.description && <DetailItem label="Description" className="sm:col-span-2">{row.description}</DetailItem>}
        {row.symptoms && row.symptoms.length > 0 && <DetailItem label="Symptoms" className="sm:col-span-2">{row.symptoms.map(commerceLabel).join(", ")}</DetailItem>}
        {timelineSteps.filter(([key]) => row.timeline?.[key]).map(([key, label]) => <DetailItem key={key} label={`${label} (EAT)`}>{commerceDateTime(row.timeline?.[key])}</DetailItem>)}
        {row.cancelReason && <DetailItem label="Cancel reason" className="sm:col-span-2">{row.cancelReason}</DetailItem>}
        {row.treatmentSummary && <DetailItem label="Treatment" className="sm:col-span-2">{row.treatmentSummary}</DetailItem>}
        {row.farmerRating && <DetailItem label="Farmer rating" className="sm:col-span-2">{row.farmerRating} / 5{row.farmerReview ? ` · ${row.farmerReview}` : ""}</DetailItem>}
      </div>
    </CustomViewDetailsDialog>
  </>;
}
