"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { useCooperativeLocations } from "./use-cooperative-locations";
import { Input } from "@/components/ui/input";
import { authenticatedFetch } from "@/lib/auth/session";
import { toast } from "@/components/ui/toast";
import { CooperativeOrganisationForm } from "./cooperative-organisation-form";
import type { OrganisationType, RegistryRow } from "./cooperative-registry-types";

type FormProps = {
  type: OrganisationType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  record?: RegistryRow;
};

export function CooperativeRegistryForm(props: FormProps) {
  if (props.type === "mcus" || props.type === "amcos") {
    return <CooperativeOrganisationForm {...props} type={props.type} />;
  }
  return <FactoryRegistryForm {...props} />;
}

type UnionOption = { value: string; label: string; country_id?: number | null; all_regions?: boolean | number | null; region_id?: number | null; district_id?: number | null; ward_id?: number | null };

function FactoryRegistryForm({ open, onOpenChange, onSaved, record }: FormProps) {
  const [unions, setUnions] = useState<UnionOption[]>([]);
  const [optionError, setOptionError] = useState("");
  const [optionsReady, setOptionsReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const [uuid] = useState(() => crypto.randomUUID());
  const [values, setValues] = useState<Record<string, string>>(() => ({
    name: record?.name ?? "", registration_number: record?.registration_number ?? "", tin_number: record?.tin_number ?? "",
    dairy_board_license_no: record?.dairy_board_license_no ?? "", mcu_uuid: record?.mcu_uuid ?? "",
    region_id: String(record?.region_id ?? ""), district_id: String(record?.district_id ?? ""), ward_id: String(record?.ward_id ?? ""),
    contact_phone: record?.contact_phone ?? "", contact_email: record?.contact_email ?? "", address: record?.address ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const required = ["name", "registration_number", "tin_number", "mcu_uuid", "region_id", "district_id", "contact_phone"];
  const selectedUnion = unions.find((union) => union.value === values.mcu_uuid);
  const regions = useCooperativeLocations("regions", selectedUnion?.country_id ? String(selectedUnion.country_id) : null, open);
  const districts = useCooperativeLocations("districts", values.region_id || null, open);
  const wards = useCooperativeLocations("wards", values.district_id || null, open);
  function set(key: string, value: string) {
    setValues((old) => ({ ...old, [key]: value, ...(key === "region_id" ? { district_id: "", ward_id: "" } : {}), ...(key === "district_id" ? { ward_id: "" } : {}) }));
    setErrors((old) => ({ ...old, [key]: "" }));
  }
  function selectUnion(uuid: string) {
    const union = unions.find((item) => item.value === uuid);
    setValues((old) => ({ ...old, mcu_uuid: uuid,
      region_id: !union?.all_regions && union?.region_id ? String(union.region_id) : "",
      district_id: "",
      ward_id: "",
    }));
    setErrors((old) => ({ ...old, mcu_uuid: "", region_id: "", district_id: "", ward_id: "" }));
  }
  function validate(keys: string[]) {
    const found: Record<string, string> = {};
    for (const key of keys) if (required.includes(key) && !values[key]?.trim()) found[key] = "This field is required.";
    if (keys.includes("tin_number") && !/^\d{3}-?\d{3}-?\d{3}$/.test(values.tin_number.trim())) found.tin_number = "Enter a 9-digit TIN, for example 123-456-789.";
    if (keys.includes("contact_email") && values.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact_email)) found.contact_email = "Enter a valid email address.";
    setErrors((old) => ({ ...old, ...Object.fromEntries(keys.map((key) => [key, found[key] ?? ""])) }));
    return Object.keys(found).length === 0;
  }
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setOptionsReady(false); setOptionError("");
    authenticatedFetch("/api/admin/dairy/cooperatives/options", { signal: controller.signal }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not load MCUs.");
      if (controller.signal.aborted) return;
      const options: UnionOption[] = (payload.data ?? []).map((item: RegistryRow) => ({ ...item, value: item.uuid, label: item.name }));
      if (record?.mcu_uuid && !options.some((item: { value: string }) => item.value === record.mcu_uuid)) options.unshift({ value: record.mcu_uuid, label: record.mcu_name || "Current MCU" });
      setUnions(options); setOptionsReady(true);
      const current = options.find((item) => item.value === record?.mcu_uuid);
      if (current && !current.all_regions) setValues((old) => ({ ...old,
        ...(current.region_id ? { region_id: String(current.region_id) } : {}),

      }));
    }).catch((error: unknown) => { if (!controller.signal.aborted) setOptionError(error instanceof Error ? error.message : "Could not load MCUs."); });
    return () => controller.abort();
  }, [open, revision, record]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(Object.keys(values)) || !optionsReady) return false;
    try {
      const body: Record<string, unknown> = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() || null]));
      body.region_id = Number(values.region_id); body.district_id = Number(values.district_id); body.ward_id = values.ward_id ? Number(values.ward_id) : null;
      if (record && values.mcu_uuid === record.mcu_uuid) delete body.mcu_uuid;
      if (!record) body.uuid = uuid;
      const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/factories${record ? `/${encodeURIComponent(record.uuid)}` : ""}`, { method: record ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.errors) setErrors(Object.fromEntries(Object.entries(payload.errors).map(([key, messages]) => [key, Array.isArray(messages) ? String(messages[0]) : String(messages)])));
        throw new Error(payload.message ?? "Could not save the factory.");
      }
      toast.success(record ? "Factory details updated." : "Factory registered. Add managers and operators from its details page.");
      onSaved(); onOpenChange(false); return true;
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save the factory."); return false; }
  }
  function input(key: string, label: string, full = false, type = "text") {
    return <Field className={full ? "sm:col-span-2" : undefined}><FieldLabel htmlFor={`factory-${key}`} required={required.includes(key)}>{label}</FieldLabel>
      <Input id={`factory-${key}`} name={key} type={type} value={values[key]} required={required.includes(key)} maxLength={key === "tin_number" ? 20 : key === "registration_number" || key === "dairy_board_license_no" ? 100 : key === "contact_phone" ? 50 : 255} onChange={(event) => set(key, event.target.value)} aria-invalid={Boolean(errors[key])} />
      <FieldError>{errors[key]}</FieldError></Field>;
  }
  return <FormDialog open={open} onOpenChange={onOpenChange} title={record ? "Edit factory company" : "Register factory company"} size="xl" submitLabel={record ? "Save changes" : "Register factory"} onSubmit={submit} errors={errors}
    onValidateStep={(_index, step) => { if (step.id === "location" && !optionsReady) { toast.error("Load the MCU choices before continuing."); return false; } return validate(step.fieldNames ?? []); }}
    steps={[
      { id: "company", title: "Company details", description: "Registered business and tax information.", fieldNames: ["name", "registration_number", "tin_number", "dairy_board_license_no"], content: <FieldGrid>
        {input("name", "Registered company name", true)}
        {input("registration_number", "Company registration number")}
        {input("tin_number", "TIN number")}
        {input("dairy_board_license_no", "Dairy board licence number", true)}
      </FieldGrid> },
      { id: "location", title: "MCU & location", description: "The cooperative union and the factory’s physical location.", fieldNames: ["mcu_uuid", "region_id", "district_id", "ward_id"], content: <FieldGrid>
        <Field className="sm:col-span-2"><FieldLabel htmlFor="factory-mcu" required>Cooperative union (MCU)</FieldLabel>
          {optionError ? <p role="alert" className="text-sm text-destructive">{optionError} <button type="button" className="underline" onClick={() => setRevision((n) => n + 1)}>Try again</button></p> : <FormSelect id="factory-mcu" value={values.mcu_uuid} onValueChange={selectUnion} options={unions} placeholder={optionsReady ? "Select MCU" : "Loading MCUs…"} />}
          <FieldError>{errors.mcu_uuid}</FieldError></Field>
        <Field><FieldLabel htmlFor="factory-region" required>Region</FieldLabel><FormSelect id="factory-region" value={values.region_id} onValueChange={(v) => set("region_id", v)} options={regions.options} placeholder="Select region" disabled={!values.mcu_uuid || Boolean(selectedUnion && !selectedUnion.all_regions && selectedUnion.region_id)} /><FieldError>{errors.region_id || regions.error}</FieldError></Field>
        <Field><FieldLabel htmlFor="factory-district" required>District</FieldLabel><FormSelect id="factory-district" value={values.district_id} onValueChange={(v) => set("district_id", v)} options={districts.options} placeholder="Select district" disabled={!values.region_id} /><FieldError>{errors.district_id || districts.error}</FieldError></Field>
        <Field><FieldLabel htmlFor="factory-ward">Ward</FieldLabel><FormSelect id="factory-ward" value={values.ward_id} onValueChange={(v) => set("ward_id", v)} options={wards.options} placeholder="Select ward" disabled={!values.district_id} /><FieldError>{errors.ward_id || wards.error}</FieldError></Field>
        {selectedUnion && <FieldDescription className="sm:col-span-2">{selectedUnion.all_regions ? "This MCU covers all regions. Select the factory’s region, district and ward." : "The MCU’s region is filled automatically. Select the factory’s district and ward."}</FieldDescription>}
      </FieldGrid> },
      { id: "contact", title: "Company contact", description: "Official business contact details, separate from staff accounts.", fieldNames: ["contact_phone", "contact_email", "address"], content: <FieldGrid>
        {input("contact_phone", "Company phone number", false, "tel")}
        {input("contact_email", "Company email address", false, "email")}
        <Field className="sm:col-span-2"><FieldLabel htmlFor="factory-address">Physical address</FieldLabel><textarea id="factory-address" className="min-h-24 rounded-lg border bg-background p-3 text-sm" maxLength={255} value={values.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <FieldDescription className="sm:col-span-2">Add managers and operators separately in Factory details → Add user or manager.</FieldDescription>
      </FieldGrid> },
    ]} />;
}
