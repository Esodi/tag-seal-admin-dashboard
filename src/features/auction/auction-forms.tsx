"use client";

import { useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { MapLocationPicker } from "@/components/ui/map-location-picker";
import { Textarea } from "@/components/ui/textarea";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { roleOptions } from "./auction-config";
import { useActiveCentres } from "./auction-hooks";
import { RegionDistrictFields } from "./auction-location-fields";
import type { AuctionCentreRecord } from "./types";

type FormProps = { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void };

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim() || null;
const number = (form: FormData, key: string) => { const value = text(form, key); return value === null ? null : Number(value); };
const id = (value: string) => value ? Number(value) : null;

function randomFourDigits() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function buildCentreCode(name: string, digits: string) {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24)
    .replace(/-+$/g, "");
  return base ? `${base}-${digits}` : "";
}

function TextField({ name, label, prefix, required, defaultValue, type, hint, className, step, min, max, placeholder }: {
  name: string; label: string; prefix: string; required?: boolean; defaultValue?: string | number | null; type?: string; hint?: string; className?: string;
  step?: string; min?: number; max?: number; placeholder?: string;
}) {
  return <Field className={className}>
    <FieldLabel htmlFor={`${prefix}-${name}`} required={required}>{label}</FieldLabel>
    <Input id={`${prefix}-${name}`} name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} required={required} maxLength={255} step={step} min={min} max={max} />
    {hint && <FieldDescription>{hint}</FieldDescription>}
  </Field>;
}

/** Adds a livestock market, or edits one when [centre] is given. */
export function CentreForm({ centre, ...props }: FormProps & { centre?: AuctionCentreRecord }) {
  const [name, setName] = useState(centre?.name ?? "");
  const [digits, setDigits] = useState(randomFourDigits);
  const [code, setCode] = useState(centre?.code ?? "");
  const [codeCustomized, setCodeCustomized] = useState(Boolean(centre?.code));
  const [status, setStatus] = useState(centre?.status ?? "active");
  const [place, setPlace] = useState({ regionId: centre?.regionId ? String(centre.regionId) : "", districtId: centre?.districtId ? String(centre.districtId) : "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      code: (text(form, "code") ?? code.trim()).toUpperCase() || null,
      name: text(form, "name"), phone: text(form, "phone"), address: text(form, "address"), description: text(form, "description"), status,
      regionId: id(place.regionId), districtId: id(place.districtId), latitude: number(form, "latitude"), longitude: number(form, "longitude"),
    };
    const ok = await registryRun(
      () => centre ? registrySend(`/api/admin/auction/centres/${encodeURIComponent(centre.uuid)}`, "PUT", body) : registrySend("/api/admin/auction/centres", "POST", body),
      centre ? "Changes saved." : `${body.name} added. You can now add its manager and auctioneers.`,
      props.onSaved,
    );
    if (ok) props.onOpenChange(false);
    return ok;
  }

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel={centre ? "Save changes" : "Add centre"} fieldsClassName="sm:grid-cols-2"
    title={centre ? `Edit ${centre.name}` : "Add auction centre"} description={centre ? undefined : "A livestock market where auctions are held."}>
    <Field>
      <FieldLabel htmlFor="centre-name" required>Centre name</FieldLabel>
      <Input
        id="centre-name"
        name="name"
        required
        maxLength={150}
        placeholder="e.g. Pugu"
        value={name}
        onChange={(event) => {
          const nextName = event.target.value;
          setName(nextName);
          if (!codeCustomized) {
            setCode(buildCentreCode(nextName, digits));
          }
        }}
      />
    </Field>
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor="centre-code" required>Code</FieldLabel>
        <button
          type="button"
          onClick={() => {
            const nextDigits = randomFourDigits();
            setDigits(nextDigits);
            setCodeCustomized(false);
            setCode(buildCentreCode(name, nextDigits));
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          title="Generate a new 4-digit code from the centre name"
        >
          <RefreshCw className="size-3" />
          Auto-generate
        </button>
      </div>
      <Input
        id="centre-code"
        name="code"
        required
        readOnly={false}
        maxLength={30}
        placeholder="e.g. PUGU-4821"
        value={code}
        onChange={(event) => {
          const nextCode = event.target.value.toUpperCase();
          setCode(nextCode);
          setCodeCustomized(nextCode.trim().length > 0);
        }}
      />
      <FieldDescription>Auto-filled from the centre name + 4 digits (e.g. PUGU-4821). Editable.</FieldDescription>
    </Field>
    <TextField
      prefix="centre"
      name="phone"
      label="Centre office / enquiries phone"
      type="tel"
      placeholder="+255 7XX XXX XXX"
      defaultValue={centre?.phone}
      hint="Public market office or desk phone for buyer and seller enquiries."
    />
    <RegionDistrictFields prefix="centre" open={props.open} regionId={place.regionId} districtId={place.districtId} onChange={setPlace} />
    <TextField prefix="centre" name="address" label="Address" defaultValue={centre?.address} />
    <MapLocationPicker
      prefix="centre"
      defaultLatitude={centre?.latitude}
      defaultLongitude={centre?.longitude}
    />
    {centre && <Field><FieldLabel htmlFor="centre-status">Status</FieldLabel>
      <FormSelect id="centre-status" value={status} onValueChange={setStatus} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
    </Field>}
    <Field className="sm:col-span-2"><FieldLabel htmlFor="centre-description">Description</FieldLabel>
      <Textarea id="centre-description" name="description" rows={3} maxLength={2000} defaultValue={centre?.description ?? ""} />
    </Field>
  </FormDialog>;
}

/** Adds an approved officer. They sign in to the app with their phone number and set a PIN. */
export function OfficerForm(props: FormProps) {
  const centres = useActiveCentres(props.open);
  const [centreUuid, setCentreUuid] = useState("");
  const [role, setRole] = useState("auctioneer");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [place, setPlace] = useState({ regionId: "", districtId: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!centreUuid) { setErrors({ centreUuid: "Choose the centre." }); return false; }
    const form = new FormData(event.currentTarget);
    const body = {
      centreUuid, role, firstName: text(form, "firstName"), middleName: text(form, "middleName"), lastName: text(form, "lastName"),
      phone: text(form, "phone"), email: text(form, "email"), nationalId: text(form, "nationalId"), licenceNo: text(form, "licenceNo"), address: text(form, "address"),
      regionId: id(place.regionId), districtId: id(place.districtId),
    };
    const ok = await registryRun(() => registrySend("/api/admin/auction/officers", "POST", body), "Officer added. They sign in to the app with their phone number.", props.onSaved);
    if (ok) props.onOpenChange(false);
    return ok;
  }

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Add officer" size="lg" errors={errors}
    title="Add auction officer" description="The officer is approved straight away. They sign in to the app with this phone number and set their own PIN.">
    <FieldGrid>
      <Field><FieldLabel htmlFor="officer-centre" required>Centre</FieldLabel>
        {centres.error ? <p role="alert" className="text-sm text-destructive">{centres.error}</p> : <FormSelect id="officer-centre" value={centreUuid} onValueChange={(value) => { setCentreUuid(value); setErrors({}); }} searchable disabled={centres.loading}
          placeholder={centres.loading ? "Loading centres…" : "Choose a centre"} options={centres.data.map((centre) => ({ value: centre.uuid, label: `${centre.name} · ${centre.code}` }))} />}
        <FieldError>{errors.centreUuid}</FieldError>
      </Field>
      <Field><FieldLabel htmlFor="officer-role">Role at the centre</FieldLabel>
        <FormSelect id="officer-role" value={role} onValueChange={setRole} options={roleOptions} />
      </Field>
      <TextField prefix="officer" name="firstName" label="First name" required />
      <TextField prefix="officer" name="middleName" label="Middle name" />
      <TextField prefix="officer" name="lastName" label="Last name" required />
      <TextField prefix="officer" name="phone" label="Phone number" type="tel" required hint="Used to sign in to the app." />
      <TextField prefix="officer" name="email" label="Email" type="email" />
      <TextField prefix="officer" name="nationalId" label="National ID (NIDA)" />
      <TextField prefix="officer" name="licenceNo" label="Auctioneer licence number" />
      <RegionDistrictFields prefix="officer" open={props.open} regionId={place.regionId} districtId={place.districtId} onChange={setPlace} />
      <TextField prefix="officer" name="address" label="Address" />
    </FieldGrid>
  </FormDialog>;
}
