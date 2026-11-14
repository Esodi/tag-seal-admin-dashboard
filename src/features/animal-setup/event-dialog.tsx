"use client";

import { useState } from "react";
import { Lock, Plus, Scale, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { SetupError, setupSend } from "./animal-setup-api";
import {
  APPLIES_TO, CAPTURE_MODES, FIELD_TYPES, UNITS, WEIGHT_UNITS, typeLabel,
  type AppliesTo, type FieldType, type SetupEvent, type SetupField, type Workspace,
} from "./types";

export type EventDialogMode = { kind: "standard" } | { kind: "custom" } | { kind: "edit"; event: SetupEvent };

type Errors = Record<string, string>;

const blankField = (): SetupField => ({ label: { en: "", sw: "" }, type: "text", required: false });

/** Adds a standard or custom event to the draft, or edits one already in it. */
export function EventDialog({ workspace, mode, open, onOpenChange, onSaved }: {
  workspace: Workspace;
  mode: EventDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (next: Workspace) => void;
}) {
  const editing = mode.kind === "edit" ? mode.event : null;
  const isStandard = mode.kind === "standard" || Boolean(editing?.standard);
  const [standardCode, setStandardCode] = useState("");
  const [name, setName] = useState({ en: editing?.name.en ?? "", sw: editing?.name.sw ?? "" });
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(editing?.appliesTo ?? "all");
  const [fields, setFields] = useState<SetupField[]>(editing ? editing.fields : mode.kind === "custom" ? [blankField()] : []);
  const [errors, setErrors] = useState<Errors>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const locked = fields.filter((field) => field.locked);
  const editable = fields.filter((field) => !field.locked);
  const lookupOptions = workspace.lookups.map((lookup) => ({ value: lookup.code, label: lookup.name }));

  function clearError(key: string) {
    setErrors((old) => Object.fromEntries(Object.entries(old).filter(([name]) => name !== key)));
  }

  function pickStandard(code: string) {
    setStandardCode(code);
    const picked = workspace.standardEvents.find((event) => event.code === code);
    if (picked) setAppliesTo(picked.appliesTo);
    clearError("standardCode");
  }

  function updateEditable(index: number, patch: Partial<SetupField>) {
    setFields([...locked, ...editable.map((field, i) => (i === index ? { ...field, ...patch } : field))]);
    setErrors((old) => Object.fromEntries(Object.entries(old).filter(([key]) => !key.startsWith(`fields.${index}.`))));
  }

  function updateLocked(key: string | undefined, patch: Partial<SetupField>) {
    setFields(fields.map((field) => (field.locked && field.key === key ? { ...field, ...patch } : field)));
  }

  function validate() {
    const found: Errors = {};
    if (mode.kind === "standard" && !standardCode) found.standardCode = "Choose a standard event.";
    if (!isStandard && !name.en.trim()) found.name = "Enter the event name.";
    if (!isStandard && editable.length === 0 && locked.length === 0) found.fields = "Add at least one field.";
    editable.forEach((field, index) => {
      if (!field.label.en.trim()) found[`fields.${index}.label`] = "Enter a label.";
      if (field.type === "measurement" && !field.unit) found[`fields.${index}.unit`] = "Choose a unit.";
      if ((field.type === "choice" || field.type === "multi_choice") && !field.lookupCode) found[`fields.${index}.lookupCode`] = "Choose an option list.";
    });
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function submit() {
    setServerErrors([]);
    if (!validate()) return false;
    const payload = {
      ...(mode.kind === "standard" ? { standardCode } : {}),
      ...(!isStandard ? { name } : {}),
      appliesTo,
      fields: [
        ...locked.map((field) => ({ key: field.key, label: field.label, type: "system", required: field.required, capture: field.capture ?? null })),
        ...editable.map((field) => ({
          key: field.key, label: field.label, type: field.type, required: field.required,
          unit: field.type === "measurement" ? field.unit : null,
          lookupCode: field.type === "choice" || field.type === "multi_choice" ? field.lookupCode : null,
          capture: field.type === "measurement" && WEIGHT_UNITS.includes(field.unit ?? "") ? field.capture ?? "manual_or_scale" : null,
        })),
      ],
    };
    try {
      const next = editing
        ? await setupSend<Workspace>(`/${workspace.type.id}/events/${editing.uuid}`, "PATCH", payload)
        : await setupSend<Workspace>(`/${workspace.type.id}/events`, "POST", payload);
      toast.success(editing ? "Event saved." : "Event added.");
      onSaved(next);
      return true;
    } catch (e) {
      setServerErrors(e instanceof SetupError ? e.messages : ["The event could not be saved."]);
      return false;
    }
  }

  const title = editing ? `Edit ${editing.name.en}` : mode.kind === "standard" ? "Add standard event" : "Add custom event";
  const description = isStandard
    ? "Standard events keep the built-in fields the app already uses. You can add extra fields below them."
    : "Name the event and list the details farmers fill in when they record it.";

  return <FormDialog open={open} onOpenChange={onOpenChange} size="xl" title={title} description={description}
    submitLabel={editing ? "Save event" : "Add event"} onSubmit={submit}>
    {serverErrors.length > 0 && <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      <p className="font-medium">Please fix the following:</p>
      <ul className="ml-4 mt-1 list-disc">{serverErrors.map((message) => <li key={message}>{message}</li>)}</ul>
    </div>}

    <FieldGrid>
      {mode.kind === "standard" ? <Field>
        <FieldLabel htmlFor="standard-event" required>Standard event</FieldLabel>
        <FormSelect id="standard-event" value={standardCode} onValueChange={pickStandard} invalid={Boolean(errors.standardCode)}
          placeholder={workspace.standardEvents.length ? "Choose an event" : "All standard events are already added"}
          disabled={!workspace.standardEvents.length} searchable
          options={workspace.standardEvents.map((event) => ({ value: event.code, label: event.name.en }))} />
        <FieldError>{errors.standardCode}</FieldError>
      </Field> : editing?.standard ? <Field>
        <FieldLabel>Event</FieldLabel>
        <p className="flex h-10 items-center gap-2 text-sm font-medium"><Lock className="size-4 text-muted-foreground" />{editing.name.en}</p>
      </Field> : <>
        <Field>
          <FieldLabel htmlFor="event-name" required>Event name (English)</FieldLabel>
          <Input id="event-name" value={name.en} aria-invalid={Boolean(errors.name)} placeholder="e.g. Hoof trimming"
            onChange={(e) => { setName({ ...name, en: e.target.value }); clearError("name"); }} />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="event-name-sw">Event name (Swahili)</FieldLabel>
          <Input id="event-name-sw" value={name.sw ?? ""} placeholder="e.g. Kukata kwato" onChange={(e) => setName({ ...name, sw: e.target.value })} />
        </Field>
      </>}
      <Field>
        <FieldLabel htmlFor="applies-to">Applies to</FieldLabel>
        <FormSelect id="applies-to" value={appliesTo} onValueChange={(value) => setAppliesTo(value as AppliesTo)} options={APPLIES_TO} />
        <FieldDescription>Farmers only see this event for these animals. Every event is optional to record.</FieldDescription>
      </Field>
    </FieldGrid>

    {locked.length > 0 && <section className="space-y-2">
      <h3 className="text-sm font-semibold">Built-in fields</h3>
      <ul className="divide-y rounded-xl border">
        {locked.map((field) => <li key={field.key} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
          <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1 font-medium">{field.label.en}</span>
          <Badge variant="outline">{typeLabel(field.type)}{field.unit ? ` · ${field.unit}` : ""}</Badge>
          <span className="text-xs text-muted-foreground">{field.required ? "Required" : "Optional"}</span>
          {field.type === "measurement" && WEIGHT_UNITS.includes(field.unit ?? "") && <CaptureSelect value={field.capture ?? "manual_or_scale"} onChange={(capture) => updateLocked(field.key, { capture })} />}
        </li>)}
      </ul>
    </section>}

    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{isStandard ? "Extra fields" : "Fields"}</h3>
          <p className="text-xs text-muted-foreground">{isStandard ? "Optional details you want farmers to add." : "What farmers fill in for this event."}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setFields([...fields, blankField()])}><Plus />Add field</Button>
      </div>
      {errors.fields && <FieldError>{errors.fields}</FieldError>}
      {editable.length === 0 && <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">No {isStandard ? "extra " : ""}fields yet.</p>}
      {editable.map((field, index) => <FieldCard key={field.key ?? `new-${index}`} index={index} field={field} errors={errors} lookupOptions={lookupOptions}
        onChange={(patch) => updateEditable(index, patch)}
        onRemove={() => setFields([...locked, ...editable.filter((_, i) => i !== index)])} />)}
    </section>
  </FormDialog>;
}

function FieldCard({ index, field, errors, lookupOptions, onChange, onRemove }: {
  index: number;
  field: SetupField;
  errors: Errors;
  lookupOptions: Array<{ value: string; label: string }>;
  onChange: (patch: Partial<SetupField>) => void;
  onRemove: () => void;
}) {
  const id = `field-${index}`;
  const error = (name: string) => errors[`fields.${index}.${name}`];
  const isChoice = field.type === "choice" || field.type === "multi_choice";
  const isWeight = field.type === "measurement" && WEIGHT_UNITS.includes(field.unit ?? "");

  return <div className="space-y-4 rounded-xl border bg-card p-4">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Field {index + 1}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove field ${index + 1}`}><Trash2 />Remove</Button>
    </div>
    <FieldGrid>
      <Field>
        <FieldLabel htmlFor={`${id}-label`} required>Label (English)</FieldLabel>
        <Input id={`${id}-label`} value={field.label.en} aria-invalid={Boolean(error("label"))} placeholder="e.g. Body weight"
          onChange={(e) => onChange({ label: { ...field.label, en: e.target.value } })} />
        <FieldError>{error("label")}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-label-sw`}>Label (Swahili)</FieldLabel>
        <Input id={`${id}-label-sw`} value={field.label.sw ?? ""} placeholder="e.g. Uzito wa mwili"
          onChange={(e) => onChange({ label: { ...field.label, sw: e.target.value } })} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-type`} required>Data type</FieldLabel>
        <FormSelect id={`${id}-type`} value={field.type} options={FIELD_TYPES}
          onValueChange={(type) => onChange({ type: type as FieldType, unit: type === "measurement" ? field.unit ?? "kg" : null, lookupCode: null })} />
      </Field>
      {field.type === "measurement" && <Field>
        <FieldLabel htmlFor={`${id}-unit`} required>Unit</FieldLabel>
        <FormSelect id={`${id}-unit`} value={field.unit ?? ""} options={UNITS} invalid={Boolean(error("unit"))} placeholder="Choose a unit"
          onValueChange={(unit) => onChange({ unit })} />
        <FieldError>{error("unit")}</FieldError>
      </Field>}
      {isChoice && <Field>
        <FieldLabel htmlFor={`${id}-lookup`} required>Option list</FieldLabel>
        <FormSelect id={`${id}-lookup`} value={field.lookupCode ?? ""} options={lookupOptions} invalid={Boolean(error("lookupCode"))} searchable
          placeholder={lookupOptions.length ? "Choose an option list" : "No published option lists yet"} onValueChange={(lookupCode) => onChange({ lookupCode })} />
        <FieldDescription>Options come from Animal Setup → Event Field Options.</FieldDescription>
        <FieldError>{error("lookupCode")}</FieldError>
      </Field>}
      {isWeight && <Field>
        <FieldLabel htmlFor={`${id}-capture`}>How weight is entered</FieldLabel>
        <CaptureSelect id={`${id}-capture`} value={field.capture ?? "manual_or_scale"} onChange={(capture) => onChange({ capture })} wide />
      </Field>}
    </FieldGrid>
    <label className={cn("flex w-fit cursor-pointer items-center gap-2 text-sm")}>
      <Checkbox checked={field.required} onCheckedChange={(value) => onChange({ required: value === true })} />
      Farmers must fill this in
    </label>
  </div>;
}

function CaptureSelect({ id, value, onChange, wide }: { id?: string; value: string; onChange: (value: SetupField["capture"]) => void; wide?: boolean }) {
  return <div className={cn("flex items-center gap-2", !wide && "w-56")}>
    {!wide && <Scale className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    <div className="min-w-0 flex-1">
      <FormSelect id={id} size={wide ? "default" : "sm"} value={value} options={CAPTURE_MODES} onValueChange={(next) => onChange(next as SetupField["capture"])} />
    </div>
  </div>;
}
