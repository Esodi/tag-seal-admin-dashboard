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
import { useCooperativeLocations, type LocationLevel } from "./use-cooperative-locations";

type Values = { name: string; amcos_uuid: string; region_id: string; district_id: string; ward_id: string; village_id: string };
type Key = keyof Values;

const STEP_FIELDS: Key[][] = [["name", "amcos_uuid"], ["region_id", "district_id", "ward_id", "village_id"]];
const REQUIRED: Key[] = ["name", "amcos_uuid", "region_id", "district_id"];
const LABELS: Record<Key, string> = {
  name: "Centre name", amcos_uuid: "Cooperative (AMCOS)",
  region_id: "Region", district_id: "District", ward_id: "Ward", village_id: "Village",
};
const EMPTY: Values = { name: "", amcos_uuid: "", region_id: "", district_id: "", ward_id: "", village_id: "" };

function validate(values: Values, keys: Key[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of keys) {
    if (REQUIRED.includes(key) && !values[key].trim()) errors[key] = `${LABELS[key]} is required.`;
  }
  return errors;
}

/** Registers a collection centre under a cooperative, following the union and cooperative registration dialog. */
export function CollectionCentreRegistryForm({ open, onOpenChange, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooperatives, setCooperatives] = useState<FormSelectOption[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [optionsReady, setOptionsReady] = useState(false);
  const [optionsRevision, setOptionsRevision] = useState(0);
  const [uuid] = useState(() => crypto.randomUUID());
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const regions = useCooperativeLocations("regions", null, open);
  const districts = useCooperativeLocations("districts", values.region_id || null, open);
  const wards = useCooperativeLocations("wards", values.district_id || null, open);
  const villages = useCooperativeLocations("villages", values.ward_id || null, open);
  const locations: Record<LocationLevel, ReturnType<typeof useCooperativeLocations>> = { regions, districts, wards, villages };

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setOptionsReady(false);
    setOptionsError(null);
    authenticatedFetch("/api/admin/dairy/cooperatives/options", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load cooperatives.");
        setCooperatives((payload.amcos ?? []).map((item: { uuid: string; name: string }) => ({ value: item.uuid, label: item.name })));
        setOptionsReady(true);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setOptionsError(reason instanceof Error ? reason.message : "Could not load cooperatives.");
      });
    return () => controller.abort();
  }, [open, optionsRevision]);

  function set(key: Key, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "region_id") Object.assign(next, { district_id: "", ward_id: "", village_id: "" });
      if (key === "district_id") Object.assign(next, { ward_id: "", village_id: "" });
      if (key === "ward_id") next.village_id = "";
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function optionLabel(options: FormSelectOption[], id: string) {
    const label = options.find((option) => option.value === id)?.label;
    return typeof label === "string" ? label : "";
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values, STEP_FIELDS.flat());
    setErrors(found);
    if (Object.keys(found).length) return false;
    setConfirming(true);
    return false;
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    const id = (key: Key) => (values[key] ? Number(values[key]) : null);
    try {
      const response = await authenticatedFetch("/api/admin/dairy/cooperatives/centres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid, name: values.name.trim(), amcos_uuid: values.amcos_uuid,
          region_id: id("region_id"), district_id: id("district_id"), ward_id: id("ward_id"), village_id: id("village_id"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setErrors(Object.fromEntries(Object.entries(payload.errors ?? {}).map(([key, list]) => [key, String((list as string[])[0] ?? "")])));
        throw new Error(payload.message ?? "Registration failed.");
      }
      toast.success("Collection centre registered.");
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

  const locationSelect = (key: Key, level: LocationLevel, parent?: { key: Key; label: string }) => {
    const state = locations[level];
    const waiting = Boolean(parent && !values[parent.key]);
    return (
      <Field>
        <FieldLabel htmlFor={`centre-${key}`} required={REQUIRED.includes(key)}>{LABELS[key]}</FieldLabel>
        <FormSelect id={`centre-${key}`} value={values[key]} onValueChange={(value) => set(key, value)} searchable
          options={REQUIRED.includes(key) ? state.options : [{ value: "", label: "Not set" }, ...state.options]}
          placeholder={state.loading ? "Loading…" : waiting && parent ? `Choose a ${parent.label} first` : `Select ${LABELS[key].toLowerCase()}`}
          disabled={state.loading || waiting} invalid={Boolean(errors[key])} />
        <FieldError>{errors[key] || state.error}</FieldError>
      </Field>
    );
  };

  const review: Array<{ title: string; rows: Array<[string, string]> }> = [
    { title: "Centre", rows: [["Name", values.name], ["Cooperative", optionLabel(cooperatives, values.amcos_uuid)]] },
    { title: "Location", rows: [["Region", optionLabel(regions.options, values.region_id)], ["District", optionLabel(districts.options, values.district_id)], ["Ward", optionLabel(wards.options, values.ward_id)], ["Village", optionLabel(villages.options, values.village_id)]] },
  ];

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Register collection centre"
        description="Collection centre name, the cooperative it belongs to, and where it is."
        submitLabel="Register"
        size="xl"
        stepperThreshold={5}
        errors={errors}
        onSubmit={submit}
        onValidateStep={(index) => {
          if (index >= STEP_FIELDS.length) return true;
          const found = validate(values, STEP_FIELDS[index]);
          setErrors((current) => ({ ...current, ...Object.fromEntries(STEP_FIELDS[index].map((key) => [key, found[key] ?? ""])) }));
          return !Object.keys(found).length;
        }}
        steps={[
          {
            id: "centre", title: "Centre", description: "Name and the cooperative that runs it.",
            fieldNames: STEP_FIELDS[0], fieldCount: 2,
            content: (
              <FieldGrid>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="centre-name" required>{LABELS.name}</FieldLabel>
                  <Input id="centre-name" value={values.name} maxLength={255} aria-invalid={Boolean(errors.name) || undefined}
                    onChange={(event) => set("name", event.target.value)} />
                  <FieldError>{errors.name}</FieldError>
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="centre-amcos" required>{LABELS.amcos_uuid}</FieldLabel>
                  {optionsError ? <div role="alert" className="text-sm text-destructive">{optionsError}{" "}<button type="button" className="underline" onClick={() => setOptionsRevision((n) => n + 1)}>Try again</button></div>
                    : !optionsReady ? <p className="text-sm text-muted-foreground">Loading cooperatives…</p>
                    : <FormSelect id="centre-amcos" value={values.amcos_uuid} onValueChange={(value) => set("amcos_uuid", value)} searchable
                      options={cooperatives} placeholder="Select cooperative" invalid={Boolean(errors.amcos_uuid)} />}
                  <FieldError>{errors.amcos_uuid}</FieldError>
                </Field>
              </FieldGrid>
            ),
          },
          {
            id: "location", title: "Location", description: "Where the centre is. Region and district are required.",
            fieldNames: STEP_FIELDS[1], fieldCount: 4,
            content: (
              <FieldGrid>
                {locationSelect("region_id", "regions")}
                {locationSelect("district_id", "districts", { key: "region_id", label: "region" })}
                {locationSelect("ward_id", "wards", { key: "district_id", label: "district" })}
                {locationSelect("village_id", "villages", { key: "ward_id", label: "ward" })}
              </FieldGrid>
            ),
          },
          {
            id: "review", title: "Review", description: "Check the details before saving.", fieldCount: 0,
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                {review.map((section) => (
                  <section key={section.title} className="rounded-lg border bg-background p-4">
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
        title="Register this collection centre?"
        description={`${values.name.trim()} will be added under ${optionLabel(cooperatives, values.amcos_uuid) || "the selected cooperative"}.`}
        confirmLabel={saving ? "Saving…" : "Register"}
        onConfirm={save}
      />
    </>
  );
}
