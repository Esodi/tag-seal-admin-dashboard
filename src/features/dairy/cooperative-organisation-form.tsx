"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { Field, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect, type FormSelectOption } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import type { RegistryRow } from "./cooperative-registry-types";
import { registrationNumberError, registrationNumberUpdate } from "./cooperative-registration";
import { useCooperativeLocations, type LocationLevel } from "./use-cooperative-locations";

type Values = {
  name: string; registration_number: string; tin_number: string; website: string;
  country_id: string; region_id: string; district_id: string; ward_id: string; village_id: string;
  contact_name: string; contact_title: string; contact_email: string; contact_phone: string;
};
type Key = keyof Values;
type Level = LocationLevel | "countries";

const TIN_PATTERN = /^\d{3}-?\d{3}-?\d{3}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i;
const STEP_FIELDS: Key[][] = [
  ["name", "registration_number", "tin_number", "website"],
  ["country_id", "region_id", "district_id", "ward_id", "village_id"],
  ["contact_name", "contact_title", "contact_email", "contact_phone"],
];
const REQUIRED: Key[] = ["name", "region_id", "district_id", "contact_name", "contact_title", "contact_email", "contact_phone"];
/** Region value for a union that covers every region of its country. */
const ALL_REGIONS = "all";

/** Unions also need a country; their coverage stops at region. */
function requiredKeys(type: "mcus" | "amcos", values: Values): Key[] {
  if (type !== "mcus") return REQUIRED;
  const keys: Key[] = [...REQUIRED, "country_id"];
  return keys.filter((key) => key !== "district_id");
}
const LABELS: Record<Key, string> = {
  name: "Name", registration_number: "Registration number", tin_number: "TIN number", website: "Website",
  country_id: "Country", region_id: "Region", district_id: "District", ward_id: "Ward", village_id: "Village",
  contact_name: "Full name", contact_title: "Title / position", contact_email: "Email", contact_phone: "Phone",
};

function initialValues(record?: RegistryRow): Values {
  const text = (value: unknown) => (value === null || value === undefined ? "" : String(value));
  return {
    name: text(record?.name), registration_number: text(record?.registration_number), tin_number: text(record?.tin_number),
    website: text(record?.website), country_id: text(record?.country_id),
    region_id: record?.all_regions ? ALL_REGIONS : text(record?.region_id), district_id: text(record?.district_id),
    ward_id: text(record?.ward_id), village_id: text(record?.village_id), contact_name: text(record?.contact_name),
    contact_title: text(record?.contact_title), contact_email: text(record?.contact_email), contact_phone: text(record?.contact_phone),
  };
}

function validate(values: Values, keys: Key[], required: Key[], originalRegistration?: string | null): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of keys) {
    const value = values[key].trim();
    if (!value) {
      if (required.includes(key)) errors[key] = `${LABELS[key]} is required.`;
      continue;
    }
    if (key === "registration_number") {
      const error = registrationNumberError(value, originalRegistration);
      if (error) errors[key] = error;
    }
    if (key === "tin_number" && !TIN_PATTERN.test(value)) errors[key] = "TIN must have 9 digits.";
    if (key === "contact_email" && !EMAIL_PATTERN.test(value)) errors[key] = "Enter a valid email address.";
    if (key === "website" && !WEBSITE_PATTERN.test(value)) errors[key] = "Enter a valid website address.";
  }
  return errors;
}

export function CooperativeOrganisationForm({
  type, open, onOpenChange, onSaved, record,
}: {
  type: "mcus" | "amcos";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  record?: RegistryRow;
}) {
  const [values, setValues] = useState<Values>(() => initialValues(record));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unions, setUnions] = useState<FormSelectOption[]>([]);
  const [union, setUnion] = useState("");
  const [unionError, setUnionError] = useState<string | null>(null);
  const [unionsReady, setUnionsReady] = useState(false);
  const [unionRevision, setUnionRevision] = useState(0);
  const [uuid] = useState(() => crypto.randomUUID());
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const needsUnion = type === "amcos" && !record;
  const noun = type === "mcus" ? "union" : "cooperative";

  const isUnion = type === "mcus";
  const allRegions = isUnion && values.region_id === ALL_REGIONS;
  const required = requiredKeys(type, values);
  const countries = useCooperativeLocations("countries", null, open && isUnion);
  const regions = useCooperativeLocations("regions", isUnion ? values.country_id || null : null, open && (!isUnion || Boolean(values.country_id)));
  const districts = useCooperativeLocations("districts", allRegions ? null : values.region_id || null, open && !isUnion);
  const wards = useCooperativeLocations("wards", values.district_id || null, open && !isUnion);
  const villages = useCooperativeLocations("villages", values.ward_id || null, open && !isUnion);
  const locations: Record<Level, ReturnType<typeof useCooperativeLocations>> = { countries, regions, districts, wards, villages };

  useEffect(() => {
    if (!open || !needsUnion) return;
    const controller = new AbortController();
    setUnionsReady(false);
    setUnionError(null);
    authenticatedFetch("/api/admin/dairy/cooperatives/options", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load unions.");
        setUnions((payload.data ?? []).map((item: { uuid: string; name: string }) => ({ value: item.uuid, label: item.name })));
        setUnionsReady(true);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setUnionError(reason instanceof Error ? reason.message : "Could not load unions.");
      });
    return () => controller.abort();
  }, [open, needsUnion, unionRevision]);

  function set(key: Key, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "country_id") Object.assign(next, { region_id: "", district_id: "", ward_id: "", village_id: "" });
      if (key === "region_id") Object.assign(next, { district_id: "", ward_id: "", village_id: "" });
      if (key === "district_id") Object.assign(next, { ward_id: "", village_id: "" });
      if (key === "ward_id") next.village_id = "";
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function optionLabel(level: Level, id: string) {
    if (level === "regions" && id === ALL_REGIONS) return "All regions";
    const label = locations[level].options.find((option) => option.value === id)?.label;
    return typeof label === "string" ? label : "";
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values, STEP_FIELDS.flat(), required, record?.registration_number);
    setErrors(found);
    if (Object.keys(found).length) return false;
    if (needsUnion && !unionsReady) {
      toast.error("Load the unions before registering.");
      return false;
    }
    setConfirming(true);
    return false;
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    const text = (key: Key) => values[key].trim() || null;
    const id = (key: Key) => (values[key] ? Number(values[key]) : null);
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/${type}${record ? `/${encodeURIComponent(record.uuid)}` : ""}`, {
        method: record ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(!record ? { uuid } : {}),
          ...(needsUnion ? { mcu_uuid: union || null } : {}),
          name: values.name.trim(),
          ...registrationNumberUpdate(values.registration_number, record?.registration_number),
          tin_number: text("tin_number"), website: text("website"),
          ...(isUnion ? { country_id: id("country_id"), all_regions: allRegions } : {}),
          region_id: allRegions ? null : id("region_id"),
          ...(!isUnion ? { district_id: id("district_id"), ward_id: id("ward_id"), village_id: id("village_id") } : {}),
          contact_name: text("contact_name"), contact_title: text("contact_title"),
          contact_email: text("contact_email"), contact_phone: text("contact_phone"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const serverErrors = Object.fromEntries(Object.entries(payload.errors ?? {}).map(([key, list]) => [key, String((list as string[])[0] ?? "")]));
        setErrors(serverErrors);
        throw new Error(payload.message ?? "Registration failed.");
      }
      toast.success(record ? "Changes saved." : type === "mcus" ? "Union registered." : "Cooperative registered.");
      setConfirming(false);
      onOpenChange(false);
      onSaved();
    } catch (error) {
      setConfirming(false);
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setSaving(false);
    }
  }

  const input = (key: Key, props: { type?: string; placeholder?: string; maxLength?: number; full?: boolean } = {}) => (
    <Field className={props.full ? "sm:col-span-2" : undefined}>
      <FieldLabel htmlFor={`org-${key}`} required={required.includes(key)}>{LABELS[key]}</FieldLabel>
      <Input id={`org-${key}`} type={props.type ?? "text"} value={values[key]} placeholder={props.placeholder}
        maxLength={props.maxLength ?? 255} aria-invalid={Boolean(errors[key]) || undefined}
        onChange={(event) => set(key, event.target.value)} />
      <FieldError>{errors[key]}</FieldError>
    </Field>
  );

  const locationSelect = (key: Key, level: Level, parent?: { key: Key; label: string }) => {
    const state = locations[level];
    const waiting = Boolean(parent && !values[parent.key]);
    const parentLabel = parent?.label;
    return (
      <Field>
        <FieldLabel htmlFor={`org-${key}`} required={required.includes(key)}>{LABELS[key]}</FieldLabel>
        <FormSelect id={`org-${key}`} value={values[key]} onValueChange={(value) => set(key, value)} searchable
          options={[
            ...(required.includes(key) ? [] : [{ value: "", label: "Not set" }]),
            ...(isUnion && key === "region_id" ? [{ value: ALL_REGIONS, label: "All regions" }] : []),
            ...state.options,
          ]}
          placeholder={state.loading ? "Loading…" : waiting && parentLabel ? `Choose a ${parentLabel} first` : `Select ${LABELS[key].toLowerCase()}`}
          disabled={state.loading || waiting} invalid={Boolean(errors[key])} />
        <FieldError>{errors[key] || state.error}</FieldError>
      </Field>
    );
  };

  const unionName = unions.find((item) => item.value === union)?.label;
  const review: Array<{ title: string; wide?: boolean; rows: Array<[string, string]> }> = [
    { title: "Organisation", rows: [["Name", values.name], ...(needsUnion ? [["Union", typeof unionName === "string" ? unionName : "Independent cooperative"] as [string, string]] : []), ["Registration number", registrationNumberUpdate(values.registration_number, record?.registration_number).registration_number ?? values.registration_number], ["TIN number", values.tin_number], ["Website", values.website]] },
    { title: "Location", rows: [...(isUnion ? [["Country", optionLabel("countries", values.country_id)] as [string, string]] : []), ["Region", optionLabel("regions", values.region_id)], ...(!isUnion ? [["District", optionLabel("districts", values.district_id)], ["Ward", optionLabel("wards", values.ward_id)], ["Village", optionLabel("villages", values.village_id)]] as [string, string][] : [])] },
    { title: "Contact person", wide: true, rows: [["Full name", values.contact_name], ["Title / position", values.contact_title], ["Email", values.contact_email], ["Phone", values.contact_phone]] },
  ];

  return (
    <>
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${record ? "Edit" : "Register"} ${noun}`}
      description={type === "mcus" ? "Milk Cooperative Union details, location, and the person to contact." : "Cooperative (AMCOS) details, location, and the person to contact."}
      submitLabel={record ? "Save changes" : "Register"}
      size="xl"
      stepperThreshold={5}
      errors={errors}
      onSubmit={submit}
      onValidateStep={(index) => {
        if (index >= STEP_FIELDS.length) return true;
        const found = validate(values, STEP_FIELDS[index], required, record?.registration_number);
        setErrors((current) => ({ ...current, ...Object.fromEntries(STEP_FIELDS[index].map((key) => [key, found[key] ?? ""])) }));
        return !Object.keys(found).length;
      }}
      steps={[
        {
          id: "organisation", title: "Organisation", description: "Name, registration, tax, and website details.",
          fieldNames: STEP_FIELDS[0], fieldCount: needsUnion ? 5 : 4,
          content: (
            <FieldGrid>
              {input("name", { full: true })}
              {needsUnion && (
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="org-union">Union (MCU)</FieldLabel>
                  {unionError ? <div role="alert" className="text-sm text-destructive">{unionError}{" "}<button type="button" className="underline" onClick={() => setUnionRevision((n) => n + 1)}>Try again</button></div>
                    : !unionsReady ? <p className="text-sm text-muted-foreground">Loading unions…</p>
                    : <FormSelect id="org-union" value={union} onValueChange={setUnion} searchable options={[{ value: "", label: "Independent cooperative" }, ...unions]} />}
                </Field>
              )}
              {input("registration_number", { placeholder: "e.g. COP-ARS-MRU-DC-2021-0458", maxLength: 100 })}
              {input("tin_number", { placeholder: "e.g. 105-482-913", maxLength: 11 })}
              {input("website", { type: "url", placeholder: "e.g. https://example.co.tz", full: true })}
            </FieldGrid>
          ),
        },
        {
          id: "location", title: "Location",
          description: isUnion
            ? "The country and the region the union covers. Choose All regions for a union that serves the whole country."
            : "Where the office is. Region and district are required.",
          fieldNames: isUnion ? ["country_id", "region_id"] : STEP_FIELDS[1], fieldCount: isUnion ? 2 : 4,
          content: (
            <FieldGrid>
              {isUnion && locationSelect("country_id", "countries")}
              {isUnion
                ? locationSelect("region_id", "regions", { key: "country_id", label: "country" })
                : locationSelect("region_id", "regions")}
              {!isUnion && <>
                {locationSelect("district_id", "districts", { key: "region_id", label: "region" })}
                {locationSelect("ward_id", "wards", { key: "district_id", label: "district" })}
                {locationSelect("village_id", "villages", { key: "ward_id", label: "ward" })}
              </>}
            </FieldGrid>
          ),
        },
        {
          id: "contact", title: "Contact person", description: "Who the platform contacts about this organisation.",
          fieldNames: STEP_FIELDS[2], fieldCount: 4,
          content: (
            <FieldGrid>
              {input("contact_name")}
              {input("contact_title", { placeholder: "e.g. Chairperson", maxLength: 120 })}
              {input("contact_email", { type: "email", placeholder: "e.g. office@example.co.tz" })}
              {input("contact_phone", { type: "tel", placeholder: "e.g. 0754 000 111", maxLength: 50 })}
            </FieldGrid>
          ),
        },
        {
          id: "review", title: "Review", description: "Check the details before saving.", fieldCount: 0,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              {review.map((section) => (
                <section key={section.title} className={`rounded-lg border bg-background p-4 ${section.wide ? "sm:col-span-2" : ""}`}>
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {section.rows.map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="truncate font-medium">{value?.trim() ? value : "Not provided"}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          ),
        },
      ]}
    />
    <ConfirmationAlertDialog
      open={confirming}
      onOpenChange={(next) => !saving && setConfirming(next)}
      icon={<ShieldCheck />}
      title={record ? `Save changes to this ${noun}?` : `Register this ${noun}?`}
      description={`${values.name.trim()} will be ${record ? "updated" : "added to the registry"} with the details you reviewed.`}
      confirmLabel={saving ? "Saving…" : record ? "Save changes" : "Register"}
      onConfirm={save}
    />
    </>
  );
}
