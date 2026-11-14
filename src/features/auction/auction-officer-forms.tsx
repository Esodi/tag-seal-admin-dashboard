"use client";

import { useState, type FormEvent } from "react";
import { MediaPreviewButton } from "@/components/media/media-preview";
import { mediaSourceFrom } from "@/components/media/media-source";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { roleOptions } from "./auction-config";
import { useActiveCentres } from "./auction-hooks";
import { RegionDistrictFields } from "./auction-location-fields";
import type { AuctionOfficerRecord } from "./types";

type Props = { officer: AuctionOfficerRecord; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void };

const pathOf = (officer: AuctionOfficerRecord) => `/api/admin/auction/officers/${encodeURIComponent(officer.uuid)}`;

/** The licence or permit the officer uploaded, previewed through the admin media proxy. */
export function OfficerLicence({ officer, onViewed }: { officer: AuctionOfficerRecord; onViewed?: () => void }) {
  const source = mediaSourceFrom(officer.licenceDocumentKey, "Licence document");
  return source ? <MediaPreviewButton source={source} onViewed={onViewed} /> : <span className="text-muted-foreground">Not uploaded</span>;
}

/**
 * Approves a pending officer into a centre with a role. The centre the
 * officer asked for is chosen by default; the officer is told by SMS.
 */
export function OfficerApproveForm({ officer, ...props }: Props) {
  const centres = useActiveCentres(props.open);
  const [centreUuid, setCentreUuid] = useState(officer.requestedCentre?.uuid ?? "");
  const [role, setRole] = useState("auctioneer");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasLicence = Boolean(officer.licenceDocumentKey);
  const [reviewedLicence, setReviewedLicence] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasLicence && !reviewedLicence) { setErrors({ licence: "Open the licence document before approving." }); return false; }
    if (!centreUuid) { setErrors({ centreUuid: "Choose the centre." }); return false; }
    const ok = await registryRun(() => registrySend(`${pathOf(officer)}/approve`, "POST", { centreUuid, role }), `${officer.fullName} approved.`, props.onSaved);
    if (ok) props.onOpenChange(false);
    return ok;
  }

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Approve" errors={errors}
    title={`Approve ${officer.fullName}?`} description="They can then run auctions at this centre. They get an SMS once approved.">
    <Field><FieldLabel>Licence document</FieldLabel>
      <OfficerLicence officer={officer} onViewed={() => { setReviewedLicence(true); setErrors({}); }} />
      <FieldDescription>{hasLicence ? (reviewedLicence ? "Reviewed." : "Review the document before approving.") : `No document uploaded. Licence number: ${officer.licenceNo || "not provided"}.`}</FieldDescription>
      <FieldError>{errors.licence}</FieldError>
    </Field>
    <Field><FieldLabel htmlFor="approve-centre" required>Centre</FieldLabel>
      {centres.error ? <p role="alert" className="text-sm text-destructive">{centres.error}</p> : <FormSelect id="approve-centre" value={centreUuid} searchable disabled={centres.loading}
        onValueChange={(value) => { setCentreUuid(value); setErrors({}); }} placeholder={centres.loading ? "Loading centres…" : "Choose a centre"}
        options={centres.data.map((centre) => ({ value: centre.uuid, label: `${centre.name} · ${centre.code}${centre.uuid === officer.requestedCentre?.uuid ? " (requested)" : ""}` }))} />}
      {officer.requestedCentre && <FieldDescription>Requested: {officer.requestedCentre.name}</FieldDescription>}
      <FieldError>{errors.centreUuid}</FieldError>
    </Field>
    <Field><FieldLabel htmlFor="approve-role">Role at the centre</FieldLabel>
      <FormSelect id="approve-role" value={role} onValueChange={setRole} options={roleOptions} />
      <FieldDescription>Managers and auctioneers can run auctions; clerks record sales.</FieldDescription>
    </Field>
  </FormDialog>;
}

function TextField({ name, label, required, defaultValue, type }: { name: string; label: string; required?: boolean; defaultValue?: string | null; type?: string }) {
  return <Field>
    <FieldLabel htmlFor={`officer-edit-${name}`} required={required}>{label}</FieldLabel>
    <Input id={`officer-edit-${name}`} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} maxLength={255} />
  </Field>;
}

/** Corrects an officer's details. Approval and centre roles are managed separately. */
export function OfficerEditForm({ officer, ...props }: Props) {
  const [place, setPlace] = useState({ regionId: officer.regionId ? String(officer.regionId) : "", districtId: officer.districtId ? String(officer.districtId) : "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim() || null;
    const body = {
      firstName: value("firstName"), middleName: value("middleName"), lastName: value("lastName"), phone: value("phone"), email: value("email"),
      nationalId: value("nationalId"), licenceNo: value("licenceNo"), address: value("address"), bio: value("bio"),
      regionId: place.regionId ? Number(place.regionId) : null, districtId: place.districtId ? Number(place.districtId) : null,
    };
    const ok = await registryRun(() => registrySend(pathOf(officer), "PUT", body), "Changes saved.", props.onSaved);
    if (ok) props.onOpenChange(false);
    return ok;
  }

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Save changes" size="lg" title={`Edit ${officer.fullName}`}>
    <FieldGrid>
      <TextField name="firstName" label="First name" required defaultValue={officer.firstName} />
      <TextField name="middleName" label="Middle name" defaultValue={officer.middleName} />
      <TextField name="lastName" label="Last name" required defaultValue={officer.lastName} />
      <TextField name="phone" label="Phone number" type="tel" required defaultValue={officer.phone} />
      <TextField name="email" label="Email" type="email" defaultValue={officer.email} />
      <TextField name="nationalId" label="National ID (NIDA)" defaultValue={officer.nationalId} />
      <TextField name="licenceNo" label="Auctioneer licence number" defaultValue={officer.licenceNo} />
      <RegionDistrictFields prefix="officer-edit" open={props.open} regionId={place.regionId} districtId={place.districtId} onChange={setPlace} />
      <TextField name="address" label="Address" defaultValue={officer.address} />
      <Field className="sm:col-span-2"><FieldLabel htmlFor="officer-edit-bio">About</FieldLabel>
        <Textarea id="officer-edit-bio" name="bio" rows={3} maxLength={1000} defaultValue={officer.bio ?? ""} />
      </Field>
    </FieldGrid>
  </FormDialog>;
}
