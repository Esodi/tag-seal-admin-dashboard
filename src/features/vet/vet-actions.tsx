"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, MapPin, MoreVertical, Pencil, RefreshCw, RotateCcw, Trash2, UserX, X } from "lucide-react";
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
import { RequestForm } from "./request-form";
import { animalLabel } from "./vet-columns";
import { missingVetDocuments } from "./vet-document-rules";
import { VetDocumentsSection } from "./vet-documents";
import { VetForm } from "./vet-form";
import { requestCancellable, requestCoordinatesLabel, requestLocationLabel, requestMapsHref, type VetRecord, type VetServiceRequestRecord } from "./types";

type ActionProps<T> = { row: T; onChanged: () => void };

export function VetActions({ row, onChanged }: ActionProps<VetRecord>) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const path = `/api/admin/vet/vets/${row.id}`;
  const pending = row.verificationStatus === "pending";
  const complete = missingVetDocuments(row).length === 0;
  const location = [row.address, row.district?.name, row.region?.name].filter(Boolean).join(", ");
  const mapsHref = requestMapsHref(row);
  const coords = requestCoordinatesLabel(row);

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
        <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>
        {mapsHref && (
          <DropdownMenuItem onSelect={() => window.open(mapsHref, "_blank", "noopener,noreferrer")}>
            <MapPin />Open in maps
          </DropdownMenuItem>
        )}
        {pending && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!complete} onSelect={() => setApproving(true)}><Check />{complete ? "Approve" : "Approve (documents missing)"}</DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setRejecting(true)}><X />Reject</DropdownMenuItem>
        </>}
        <DropdownMenuSeparator />
        {row.status === "active"
          ? <DropdownMenuItem destructive onSelect={() => setDeactivating(true)}><UserX />Deactivate</DropdownMenuItem>
          : <DropdownMenuItem onSelect={() => void registryRun(() => registrySend(path, "PUT", { status: "active" }), `${row.fullName} activated.`, onChanged)}><RotateCcw />Activate</DropdownMenuItem>}
        <DropdownMenuItem destructive onSelect={() => setDeleting(true)}><Trash2 />Delete</DropdownMenuItem>
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
        {row.identityNo && <DetailItem label="Identity number">{row.identityNo}</DetailItem>}
        <DetailItem label="Licence number">{row.medicalLicenseNo || "—"}</DetailItem>
        <DetailItem label="Licensing authority">{row.licenseAuthority || "—"}</DetailItem>
        <DetailItem label="Licence expires">{formatRecordDate(row.licenseExpiryDate)}</DetailItem>
        <DetailItem label="Secondary education">{row.schoolLevel || "—"}</DetailItem>
        <DetailItem label="Location">{location || "—"}</DetailItem>
        {row.serviceRadiusKm != null && <DetailItem label="Service radius">{row.serviceRadiusKm} km</DetailItem>}
        {coords && (
          <DetailItem label="Base GPS">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums">{coords}</span>
              {mapsHref ? (
                <Button variant="outline" size="xs" asChild>
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                    <MapPin />Open map
                  </a>
                </Button>
              ) : null}
            </div>
          </DetailItem>
        )}
        <DetailItem label="Experience">{row.yearsOfExperience ? `${row.yearsOfExperience} years` : "—"}</DetailItem>
        <DetailItem label="Visits done">{row.completedRequestsCount ?? 0}</DetailItem>
        <DetailItem label="Rating">{row.ratingCount ? `${Number(row.ratingAverage ?? 0).toFixed(1)} from ${row.ratingCount} reviews` : "No reviews yet"}</DetailItem>
        {row.specializations && row.specializations.length > 0 && <DetailItem label="Specializations" className="sm:col-span-2">{row.specializations.map(commerceLabel).join(", ")}</DetailItem>}
        {row.bio && <DetailItem label="About" className="sm:col-span-2">{row.bio}</DetailItem>}
        {row.verificationNotes && <DetailItem label="Remarks" className="sm:col-span-2">{row.verificationNotes}</DetailItem>}
      </div>
      <VetDocumentsSection row={row} path={path} />
    </CustomViewDetailsDialog>

    {editing && <VetForm key={row.id} vet={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}

    {rejecting && <FormDialog open={rejecting} onOpenChange={setRejecting} title={`Reject ${row.fullName}?`} description="The vet sees this reason in the app and can update their details and apply again." onSubmit={reject} submitLabel="Reject">
      <Field><FieldLabel htmlFor="vet-remarks" required>Reason</FieldLabel><Textarea id="vet-remarks" name="remarks" required maxLength={1000} /></Field>
    </FormDialog>}

    <ConfirmationAlertDialog open={approving} onOpenChange={setApproving} title={`Approve ${row.fullName}?`}
      description="Farmers can then find this vet and request visits from the app."
      confirmLabel="Approve" onConfirm={async () => { await registryRun(() => registrySend(`${path}/approve`, "POST"), `${row.fullName} approved.`, onChanged); }} />
    <ConfirmationAlertDialog open={deactivating} onOpenChange={setDeactivating} title={`Deactivate ${row.fullName}?`}
      description="Farmers can no longer request this vet. Past visits are kept and you can activate the vet again."
      confirmLabel="Deactivate" destructive onConfirm={async () => { await registryRun(() => registrySend(path, "PUT", { status: "notActive" }), `${row.fullName} deactivated.`, onChanged); }} />
    <ConfirmationAlertDialog open={deleting} onOpenChange={setDeleting} title={`Delete ${row.fullName}?`}
      description="This veterinarian profile and its uploaded credentials will be permanently removed."
      confirmLabel="Delete" destructive onConfirm={async () => { await registryRun(() => registrySend(path, "DELETE"), `${row.fullName} deleted.`, onChanged); }} />
  </>;
}

const timelineSteps: Array<[string, string]> = [["createdAt", "Requested"], ["acceptedAt", "Accepted"], ["travellingAt", "Travelling"], ["arrivedAt", "Arrived"], ["startedAt", "Treatment started"], ["completedAt", "Completed"], ["cancelledAt", "Cancelled"]];

export function RequestActions({ row, onChanged }: ActionProps<VetServiceRequestRecord>) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const path = `/api/admin/vet/requests/${encodeURIComponent(row.uuid)}`;
  const canCancel = requestCancellable(row.status);
  const canRedispatch = row.status === "pending";
  const mapsHref = requestMapsHref(row);
  const coords = requestCoordinatesLabel(row);

  async function cancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    const ok = await registryRun(() => registrySend(`${path}/cancel`, "POST", { reason: reason || null }), "Service request cancelled.", onChanged);
    if (ok) setCancelling(false);
    return ok;
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for request ${row.uuid.slice(0, 8)}`}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setViewing(true)}><Eye />View details</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setEditing(true)}><Pencil />Edit</DropdownMenuItem>
        {mapsHref && (
          <DropdownMenuItem onSelect={() => window.open(mapsHref, "_blank", "noopener,noreferrer")}>
            <MapPin />Open in maps
          </DropdownMenuItem>
        )}
        {canRedispatch && (
          <DropdownMenuItem onSelect={() => void registryRun(() => registrySend(`${path}/redispatch`, "POST"), "Dispatch widened.", onChanged)}>
            <RefreshCw />Widen dispatch
          </DropdownMenuItem>
        )}
        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => setCancelling(true)}><X />Cancel request</DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => setDeleting(true)}><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <CustomViewDetailsDialog open={viewing} onOpenChange={setViewing} title={commerceLabel(row.problemCategory)} description="Service request" size="lg"
      actions={canCancel ? <Button variant="destructive" onClick={() => { setViewing(false); setCancelling(true); }}><X />Cancel</Button> : undefined}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Status"><RegistryStatus status={row.status} /></DetailItem>
        <DetailItem label="Urgency">{commerceLabel(row.urgency)}</DetailItem>
        <DetailItem label="Farmer">{[row.farmer?.name, row.contactPhone].filter(Boolean).join(" · ") || "—"}</DetailItem>
        <DetailItem label="Animal">{animalLabel(row)}</DetailItem>
        <DetailItem label="Vet">{row.vet ? [row.vet.fullName, row.vet.phoneNumber].filter(Boolean).join(" · ") : "Not assigned"}</DetailItem>
        <DetailItem label="Location" className="sm:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular-nums">{coords ?? requestLocationLabel(row)}</span>
            {mapsHref ? (
              <Button variant="outline" size="xs" asChild>
                <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                  <MapPin />Open map
                </a>
              </Button>
            ) : null}
          </div>
          {row.locationAddress?.trim() && coords && row.locationAddress.trim() !== coords ? (
            <p className="mt-1 text-xs text-muted-foreground">{row.locationAddress.trim()}</p>
          ) : null}
        </DetailItem>
        {row.description && <DetailItem label="Description" className="sm:col-span-2">{row.description}</DetailItem>}
        {row.symptoms && row.symptoms.length > 0 && <DetailItem label="Symptoms" className="sm:col-span-2">{row.symptoms.map(commerceLabel).join(", ")}</DetailItem>}
        {timelineSteps.filter(([key]) => row.timeline?.[key]).map(([key, label]) => <DetailItem key={key} label={`${label} (EAT)`}>{commerceDateTime(row.timeline?.[key])}</DetailItem>)}
        {row.cancelReason && <DetailItem label="Cancel reason" className="sm:col-span-2">{row.cancelReason}</DetailItem>}
        {row.treatmentSummary && <DetailItem label="Treatment" className="sm:col-span-2">{typeof row.treatmentSummary === "string" ? row.treatmentSummary : JSON.stringify(row.treatmentSummary)}</DetailItem>}
        {row.bills && row.bills.length > 0 && (
          <DetailItem label="Bills & Payments" className="sm:col-span-2">
            <div className="space-y-1.5">
              {row.bills.map((bill) => (
                <div key={bill.uuid} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs">
                  <span>
                    <span className="font-mono font-semibold">{bill.billNo || bill.uuid.slice(0, 8)}</span>
                    {bill.subjectType ? ` · ${bill.subjectType}` : ""}
                  </span>
                  <span className="font-semibold tabular-nums">
                    TZS {Number(bill.amount || 0).toLocaleString("en-TZ")} · {bill.status.toUpperCase()}
                    {bill.paymentMethod ? ` (${bill.paymentMethod})` : ""}
                  </span>
                </div>
              ))}
            </div>
          </DetailItem>
        )}
        {row.farmerRating && <DetailItem label="Farmer rating" className="sm:col-span-2">{row.farmerRating} / 5{row.farmerReview ? ` · ${row.farmerReview}` : ""}</DetailItem>}
      </div>
    </CustomViewDetailsDialog>

    {editing && <RequestForm key={row.uuid} request={row} open={editing} onOpenChange={setEditing} onSaved={onChanged} />}

    {cancelling && <FormDialog open={cancelling} onOpenChange={setCancelling} title="Cancel this service request?" description="The farmer and assigned vet (if any) will see the visit as cancelled." onSubmit={cancel} submitLabel="Cancel request">
      <Field><FieldLabel htmlFor="req-cancel-reason">Reason</FieldLabel><Textarea id="req-cancel-reason" name="reason" maxLength={500} /></Field>
    </FormDialog>}

    <ConfirmationAlertDialog open={deleting} onOpenChange={setDeleting} title="Delete this service request?"
      description="This service request and its dispatch history will be permanently removed."
      confirmLabel="Delete" destructive onConfirm={async () => { await registryRun(() => registrySend(path, "DELETE"), "Service request deleted.", onChanged); }} />
  </>;
}
