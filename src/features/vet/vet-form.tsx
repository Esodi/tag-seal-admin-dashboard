"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import type { FormStep } from "@/components/ui/form-stepper";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { RegionDistrictFields } from "@/features/auction/auction-location-fields";
import { useRegionDistrictOptions } from "@/features/auction/auction-hooks";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { cn } from "@/lib/utils";
import { requiredVetDocuments, vetDocumentLabel } from "./vet-document-rules";
import {
  DOCUMENT_ACCEPT, adultBirthLimit, emptyRegistration, genderOptions, registrationFormData, specializationLabels, stepFields, tomorrow,
  useVetFormOptions, validateStep, type VetRegistration, type VetStepId,
} from "./vet-registration";

type FormProps = { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void };
type Errors = Record<string, string>;

/**
 * Adds an approved vet with the same steps, fields and rules as the app's
 * "I am a veterinarian" form. They sign in with their phone number and set a PIN.
 */
export function VetForm(props: FormProps) {
  const [value, setValue] = useState<VetRegistration>(emptyRegistration);
  const [errors, setErrors] = useState<Errors>({});
  const options = useVetFormOptions(props.open);
  const places = useRegionDistrictOptions(props.open);

  function change(patch: Partial<VetRegistration>) {
    setValue((old) => ({ ...old, ...patch }));
    setErrors((old) => {
      const next = { ...old };
      for (const key of Object.keys(patch)) delete next[key];
      if (patch.documents) for (const type of requiredVetDocuments) if (patch.documents[type]) delete next[`documents.${type}`];
      if (patch.otherDocuments) delete next["documents.other"];
      return next;
    });
  }

  function check(step: VetStepId) {
    const found = validateStep(step, value);
    setErrors((old) => {
      const next = { ...old };
      for (const key of stepFields[step]) delete next[key];
      return { ...next, ...found };
    });
    if (Object.keys(found).length > 0) toast.error("Please complete the fields marked in red.");
    return Object.keys(found).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const order: VetStepId[] = ["identity", "practice", "coverage", "documents"];
    if (!order.every((step) => Object.keys(validateStep(step, value)).length === 0)) {
      order.forEach((step) => check(step));
      return false;
    }
    const name = [value.firstName, value.lastName].map((s) => s.trim()).join(" ");
    return registryRun(() => registrySend("/api/admin/vet/vets", "POST", registrationFormData(value)),
      `${name} added. They sign in to the app with their phone number.`, props.onSaved);
  }

  const field = (key: string) => ({ invalid: Boolean(errors[key]), error: errors[key] });
  const text = (key: keyof VetRegistration, label: string, extra: { required?: boolean; type?: string; hint?: string; wide?: boolean; max?: number } = {}) =>
    <Field className={extra.wide ? "sm:col-span-2" : undefined}>
      <FieldLabel htmlFor={`vet-${key}`} required={extra.required}>{label}</FieldLabel>
      <Input id={`vet-${key}`} type={extra.type} value={String(value[key])} maxLength={extra.max ?? 255} aria-invalid={field(key).invalid || undefined}
        onChange={(e) => change({ [key]: e.target.value } as Partial<VetRegistration>)} />
      {extra.hint && !errors[key] && <FieldDescription>{extra.hint}</FieldDescription>}
      <FieldError>{errors[key]}</FieldError>
    </Field>;

  const steps: FormStep[] = [
    { id: "identity", title: "Identity", description: "Who the vet is and how to reach them.", fieldNames: [...stepFields.identity], fieldCount: 7, content: <FieldGrid>
      {text("firstName", "First name", { required: true })}
      {text("middleName", "Middle name")}
      {text("lastName", "Surname", { required: true })}
      <Field><FieldLabel htmlFor="vet-dateOfBirth" required>Date of birth</FieldLabel>
        <Input id="vet-dateOfBirth" type="date" value={value.dateOfBirth} max={adultBirthLimit()} min="1900-01-01" aria-invalid={field("dateOfBirth").invalid || undefined}
          onChange={(e) => change({ dateOfBirth: e.target.value })} />
        <FieldError>{errors.dateOfBirth}</FieldError>
      </Field>
      <Field><FieldLabel htmlFor="vet-gender" required>Sex</FieldLabel>
        <FormSelect id="vet-gender" value={value.gender} placeholder="Choose sex" options={genderOptions} invalid={field("gender").invalid}
          onValueChange={(gender) => change({ gender })} />
        <FieldError>{errors.gender}</FieldError>
      </Field>
      {text("phoneNumber", "Phone number", { required: true, type: "tel", hint: "Used to sign in to the app." })}
      {text("email", "Email", { type: "email", wide: true })}
    </FieldGrid> },
    { id: "practice", title: "Practice", description: "Licence, specialisations and clinic.", fieldNames: [...stepFields.practice], fieldCount: 7, content: <FieldGrid>
      {text("medicalLicenseNo", "Licence number", { required: true, max: 100 })}
      {text("licenseAuthority", "Licensing authority", { hint: "For example, Veterinary Council of Tanzania." })}
      <Field><FieldLabel htmlFor="vet-licenseExpiryDate" required>Licence expiry date</FieldLabel>
        <Input id="vet-licenseExpiryDate" type="date" value={value.licenseExpiryDate} min={tomorrow()} aria-invalid={field("licenseExpiryDate").invalid || undefined}
          onChange={(e) => change({ licenseExpiryDate: e.target.value })} />
        <FieldError>{errors.licenseExpiryDate}</FieldError>
      </Field>
      {text("yearsOfExperience", "Years of experience", { type: "number" })}
      <Field className="sm:col-span-2">
        <FieldLabel required className={cn(errors.specializations && "text-danger")}>Specialisations</FieldLabel>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Specialisations">
          {options.data.specializations.map((code) => {
            const on = value.specializations.includes(code);
            return <button key={code} type="button" aria-pressed={on}
              onClick={() => change({ specializations: on ? value.specializations.filter((c) => c !== code) : [...value.specializations, code] })}
              className={cn("rounded-full border px-3 py-1 text-sm transition", on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/60",
                errors.specializations && !on && "border-destructive")}>
              {specializationLabels[code] ?? code}
            </button>;
          })}
        </div>
        <FieldError>{errors.specializations}</FieldError>
      </Field>
      {text("clinicName", "Clinic name", { wide: true })}
      <Field className="sm:col-span-2"><FieldLabel htmlFor="vet-bio">About</FieldLabel>
        <Textarea id="vet-bio" rows={3} maxLength={1000} value={value.bio} onChange={(e) => change({ bio: e.target.value })} />
      </Field>
    </FieldGrid> },
    { id: "coverage", title: "Coverage", description: "Where the vet works and how far they travel.", fieldNames: [...stepFields.coverage], fieldCount: 4, content: <FieldGrid>
      <RegionDistrictFields prefix="vet" open={props.open} regionId={value.regionId} districtId={value.districtId} onChange={change} />
      {text("serviceRadiusKm", "Service radius (km)", { type: "number", hint: "From 5 to 150 km." })}
      {text("address", "Address")}
    </FieldGrid> },
    { id: "documents", title: "Documents", description: "Secondary education level and the three required certificates. PDF, JPG or PNG up to 8 MB.", fieldNames: [...stepFields.documents], fieldCount: 5, content: <FieldGrid>
      <Field className="sm:col-span-2"><FieldLabel htmlFor="vet-schoolLevelId" required>Secondary education level</FieldLabel>
        {options.error ? <p role="alert" className="text-sm text-destructive">{options.error}</p> :
          <FormSelect id="vet-schoolLevelId" value={value.schoolLevelId} disabled={options.loading} invalid={field("schoolLevelId").invalid}
            placeholder={options.loading ? "Loading…" : "Choose the level"} onValueChange={(schoolLevelId) => change({ schoolLevelId })}
            options={options.data.schoolLevels.map((l) => ({ value: String(l.id), label: l.name }))} />}
        <FieldError>{errors.schoolLevelId}</FieldError>
      </Field>
      {requiredVetDocuments.map((type) => <FileField key={type} id={`vet-doc-${type}`} label={vetDocumentLabel(type)} required error={errors[`documents.${type}`]}
        files={value.documents[type] ? [value.documents[type]!] : []} onChange={([file]) => change({ documents: { ...value.documents, [type]: file } })} />)}
      <FileField id="vet-doc-other" label="Supporting documents" multiple hint="Optional, up to 5 files." error={errors["documents.other"]}
        files={value.otherDocuments} onChange={(otherDocuments) => change({ otherDocuments })} />
    </FieldGrid> },
    { id: "review", title: "Review", description: "Check the details. The vet is approved straight away.", fieldCount: 0, content:
      <Review value={value} schoolLevel={options.data.schoolLevels.find((l) => String(l.id) === value.schoolLevelId)?.name}
        place={[places.data.districts.find((d) => d.value === value.districtId)?.label, places.data.regions.find((r) => r.value === value.regionId)?.label].filter(Boolean).join(", ")} /> },
  ];

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Add vet" size="xl" steps={steps} errors={errors}
    onValidateStep={(_, step) => check(step.id as VetStepId)}
    title="Add veterinarian" description="The vet is approved straight away. They sign in to the app with this phone number and set their own PIN." />;
}

function FileField({ id, label, required, multiple, hint, error, files, onChange }: {
  id: string; label: string; required?: boolean; multiple?: boolean; hint?: string; error?: string; files: File[]; onChange: (files: File[]) => void;
}) {
  return <Field className="sm:col-span-2">
    <FieldLabel htmlFor={id} required={required} className={cn(error && "text-danger")}>{label}</FieldLabel>
    <Input id={id} type="file" accept={DOCUMENT_ACCEPT} multiple={multiple} aria-invalid={Boolean(error) || undefined}
      onChange={(e) => { const picked = Array.from(e.target.files ?? []); if (picked.length) onChange(multiple ? [...files, ...picked] : picked); e.target.value = ""; }} />
    {files.length > 0 && <ul className="grid gap-1 text-sm">
      {files.map((file, i) => <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1">
        <span className="truncate">{file.name}</span>
        <button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => onChange(files.filter((_, j) => j !== i))}>Remove</button>
      </li>)}
    </ul>}
    {hint && !error && <FieldDescription>{hint}</FieldDescription>}
    <FieldError>{error}</FieldError>
  </Field>;
}

function Review({ value: v, schoolLevel, place }: { value: VetRegistration; schoolLevel?: string; place: string }) {
  const show = (s: ReactNode) => s || "—";
  const day = (iso: string) => iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
  return <div className="grid gap-4">
    <DetailSection title="Identity">
      <DetailItem label="Name">{[v.firstName, v.middleName, v.lastName].map((s) => s.trim()).filter(Boolean).join(" ")}</DetailItem>
      <DetailItem label="Phone">{show(v.phoneNumber)}</DetailItem>
      <DetailItem label="Date of birth">{day(v.dateOfBirth)}</DetailItem>
      <DetailItem label="Sex">{show(genderOptions.find((g) => g.value === v.gender)?.label)}</DetailItem>
      <DetailItem label="Email">{show(v.email)}</DetailItem>
    </DetailSection>
    <DetailSection title="Practice">
      <DetailItem label="Licence number">{show(v.medicalLicenseNo)}</DetailItem>
      <DetailItem label="Licence expires">{day(v.licenseExpiryDate)}</DetailItem>
      <DetailItem label="Specialisations" className="sm:col-span-2">{v.specializations.map((c) => specializationLabels[c] ?? c).join(", ")}</DetailItem>
      <DetailItem label="Clinic">{show(v.clinicName)}</DetailItem>
      <DetailItem label="Experience">{v.yearsOfExperience ? `${v.yearsOfExperience} years` : "—"}</DetailItem>
    </DetailSection>
    <DetailSection title="Coverage">
      <DetailItem label="Area">{show(place)}</DetailItem>
      <DetailItem label="Service radius">{v.serviceRadiusKm} km</DetailItem>
    </DetailSection>
    <DetailSection title="Documents">
      <DetailItem label="Secondary education">{show(schoolLevel)}</DetailItem>
      {requiredVetDocuments.map((type) => <DetailItem key={type} label={vetDocumentLabel(type)}>{show(v.documents[type]?.name)}</DetailItem>)}
      {v.otherDocuments.length > 0 && <DetailItem label="Supporting documents">{v.otherDocuments.length} file(s)</DetailItem>}
    </DetailSection>
  </div>;
}
