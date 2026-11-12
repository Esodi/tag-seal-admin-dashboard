"use client";

import { formatNida, isValidNida, NIDA_ERROR, NIDA_PATTERN, NIDA_PLACEHOLDER } from "@/lib/identity-format";
import { useEffect, useState, type FormEvent } from "react";
import { Field, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import type { FleetKind, FleetRow, TransportDriverRow, TransportVehicleRow } from "./transporter-registry-types";
import { VehicleColor } from "./vehicle-color";
import { VEHICLE_COLORS, findVehicleColor } from "./vehicle-colors";

const licenceClasses = ["A", "B", "C", "D", "E"].map((value) => ({ value, label: `Class ${value}` }));

/** Add or edit a vehicle or driver. A driver's phone is their login, so it is set once. */
export function TransporterFleetForm({ kind, record, open, onOpenChange, onSaved }: {
  kind: FleetKind;
  record?: FleetRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const isVehicles = kind === "vehicles";
  const vehicle = record as TransportVehicleRow | undefined;
  const driver = record as TransportDriverRow | undefined;
  const [companies, setCompanies] = useState<Array<{ value: string; label: string }>>([]);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [licenceClass, setLicenceClass] = useState(driver?.licence_class ?? "C");
  const [color, setColor] = useState<string>(() => findVehicleColor(vehicle?.color)?.code ?? "");

  const [values, setValues] = useState<Record<string, string>>(() => ({
    registration_number: vehicle?.registration_number ?? "", vehicle_type: vehicle?.vehicle_type ?? "TANKER",
    tanker_capacity_liters: String(vehicle?.tanker_capacity_liters ?? ""), tare_weight_kg: String(vehicle?.tare_weight_kg ?? ""),
    first_name: driver?.first_name ?? "", middle_name: driver?.middle_name ?? "", last_name: driver?.last_name ?? "",
    phone: "", email: driver?.email ?? "", licence_number: driver?.driver_license_number ?? "", licence_expiry: driver?.licence_expiry?.slice(0, 10) ?? "", national_id: formatNida(driver?.national_id ?? ""),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const required = isVehicles ? ["registration_number", "tanker_capacity_liters"] : ["first_name", "last_name", "licence_number", ...(!record ? ["phone"] : [])];
  function validate(keys: string[]) {
    const found: Record<string, string> = {};
    for (const key of keys) if (required.includes(key) && !values[key]?.trim()) found[key] = "This field is required.";
    if (keys.includes("email") && values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) found.email = "Enter a valid email address.";
    if (keys.includes("company_uuid") && !record && !company) found.company_uuid = "Choose an approved transporter.";
    if (keys.includes("national_id") && values.national_id && !isValidNida(values.national_id)) found.national_id = NIDA_ERROR;
    setErrors((old) => ({ ...old, ...Object.fromEntries(keys.map((key) => [key, found[key] ?? ""])) }));
    return Object.keys(found).length === 0;
  }

  useEffect(() => {
    if (!open || record) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ tab: "approved", sort: "alpha-asc", per_page: "100" });
    authenticatedFetch(`/api/admin/dairy/transport/companies?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load transporters.");
        setCompanies((payload.data ?? []).map((row: { uuid: string; name: string }) => ({ value: row.uuid, label: row.name })));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setCompaniesError(error instanceof Error ? error.message : "Could not load transporters.");
      });
    return () => controller.abort();
  }, [open, record]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record && !company) {
      toast.error("Choose the transporter.");
      return false;
    }
    if (!validate([...required, "email", ...(!isVehicles ? ["national_id"] : [])])) return false;
    const text = (name: string) => values[name]?.trim() || null;
    const body = isVehicles ? {
      registration_number: text("registration_number"),
      vehicle_type: text("vehicle_type"),
      color: color || null,
      tanker_capacity_liters: Number(values.tanker_capacity_liters),
      tare_weight_kg: text("tare_weight_kg") === null ? null : Number(values.tare_weight_kg),
    } : {
      first_name: text("first_name"),
      middle_name: text("middle_name"),
      last_name: text("last_name"),
      email: text("email"),
      licence_number: text("licence_number"),
      licence_class: licenceClass,
      licence_expiry: text("licence_expiry"),
      national_id: text("national_id"),
      ...(!record ? { phone: text("phone") } : {}),
    };
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/transport/${kind}${record ? `/${encodeURIComponent(record.uuid)}` : ""}`, {
        method: record ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record ? body : { ...body, company_uuid: company }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not save.");
      toast.success(record ? "Changes saved." : isVehicles ? "Vehicle added." : "Driver added. They sign in with this phone and set their PIN.");
      onOpenChange(false);
      onSaved();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
      return false;
    }
  }

  const field = (name: string, label: string, value?: string | number | null, options: { required?: boolean; type?: string; placeholder?: string } = {}) => (
    <Field key={name}>
      <FieldLabel htmlFor={`fleet-${name}`} required={options.required}>{label}</FieldLabel>
      <Input id={`fleet-${name}`} name={name} type={options.type} placeholder={name === "national_id" ? NIDA_PLACEHOLDER : options.placeholder} inputMode={name === "national_id" ? "numeric" : undefined} pattern={name === "national_id" ? NIDA_PATTERN : undefined} value={values[name] ?? String(value ?? "")} onChange={(e) => { setValues((old) => ({ ...old, [name]: name === "national_id" ? formatNida(e.target.value) : e.target.value })); setErrors((old) => ({ ...old, [name]: "" })); }} aria-invalid={Boolean(errors[name])} required={options.required} maxLength={name === "national_id" ? 23 : 255} />
      <FieldError>{errors[name]}</FieldError>
    </Field>
  );

  const companyField = !record && <Field className="sm:col-span-2">
    <FieldLabel htmlFor="fleet-company" required>Transporter</FieldLabel>
    {companiesError ? <p role="alert" className="text-sm text-destructive">{companiesError}</p> : <FormSelect id="fleet-company" value={company} onValueChange={(value) => { setCompany(value); setErrors((old) => ({ ...old, company_uuid: "" })); }} searchable placeholder="Choose an approved transporter" options={companies} />}
    <FieldError>{errors.company_uuid}</FieldError>
  </Field>;
  const licenceField = <Field><FieldLabel htmlFor="fleet-licence-class" required>Licence class</FieldLabel><FormSelect id="fleet-licence-class" value={licenceClass} onValueChange={setLicenceClass} options={licenceClasses} /></Field>;

  return <FormDialog open={open} onOpenChange={onOpenChange} onSubmit={submit} submitLabel={record ? "Save changes" : isVehicles ? "Add vehicle" : "Add driver"}
    title={`${record ? "Edit" : "Add"} ${isVehicles ? "vehicle" : "driver"}`} size="xl" errors={errors} stepperThreshold={6}
    description={record ? record.company_name : isVehicles ? "The vehicle is added to an approved transporter's fleet." : "The driver signs in with this phone and sets a PIN."}
    onValidateStep={(_index, step) => validate(step.fieldNames ?? [])}
    steps={isVehicles ? undefined : [
      { id: "driver", title: "Driver", description: "Transporter and driver identity.", fieldNames: ["company_uuid", "first_name", "middle_name", "last_name"], content: <FieldGrid>
        {companyField}
        {field("first_name", "First name", driver?.first_name, { required: true })}
        {field("middle_name", "Middle name", driver?.middle_name)}
        {field("last_name", "Surname", driver?.last_name, { required: true })}
      </FieldGrid> },
      { id: "contact", title: "Contact", description: "Contact information and national identification.", fieldNames: ["phone", "email", "national_id"], content: <FieldGrid>
        {!record && field("phone", "Phone (login)", null, { required: true, type: "tel", placeholder: "0712 345 678" })}
        {field("email", "Email", driver?.email, { type: "email" })}
        {field("national_id", "National ID (NIDA)", driver?.national_id)}
      </FieldGrid> },
      { id: "licence", title: "Driving licence", description: "Licence details and expiry date.", fieldNames: ["licence_number", "licence_class", "licence_expiry"], content: <FieldGrid>
        {field("licence_number", "Licence number", driver?.driver_license_number, { required: true })}
        {licenceField}
        {field("licence_expiry", "Licence expiry", driver?.licence_expiry?.slice(0, 10), { type: "date" })}
      </FieldGrid> },
    ]}>
    {isVehicles && <FieldGrid>
      {companyField}
      {field("registration_number", "Plate number", vehicle?.registration_number, { required: true, placeholder: "T 123 ABC" })}
      {field("vehicle_type", "Vehicle type", vehicle?.vehicle_type ?? "TANKER")}
      <Field><FieldLabel htmlFor="fleet-color">Colour</FieldLabel><FormSelect id="fleet-color" value={color} onValueChange={setColor} options={[{ value: "", label: "Not set" }, ...VEHICLE_COLORS.map((item) => ({ value: item.code, label: <VehicleColor code={item.code} /> }))]} /></Field>
      {field("tanker_capacity_liters", "Capacity (litres)", vehicle?.tanker_capacity_liters, { required: true, type: "number" })}
      {field("tare_weight_kg", "Tare weight (kg)", vehicle?.tare_weight_kg, { type: "number" })}
    </FieldGrid>}
  </FormDialog>;
}
