"use client";

import { useState, type FormEvent } from "react";
import { Field, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect, type FormSelectOption } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { careerConfig, label, type CareerCreatable } from "./resource-config";
import type { CareerOptions } from "./types";

type FieldDef = {
  key: string;
  title: string;
  kind?: "text" | "tel" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  wide?: boolean;
  choices?: (options: CareerOptions | null, values: Record<string, string>) => FormSelectOption[];
  hint?: string;
};

const phoneHint = "The person must already have signed in to Tag & Seal with this phone.";
const genders = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }];

const forms: Record<CareerCreatable, { description: string; submit: string; fields: FieldDef[] }> = {
  jobs: {
    description: "Post a vacancy for a registered employer. It opens to job seekers straight away.",
    submit: "Post vacancy",
    fields: [
      { key: "ownerUserId", title: "Employer", kind: "select", required: true, wide: true, choices: (o) => o?.employers ?? [] },
      { key: "title", title: "Job title", required: true },
      { key: "jobTypeId", title: "Job category", kind: "select", required: true, choices: (o) => (o?.jobTypes ?? []).map((t) => ({ value: String(t.value), label: t.label })) },
      { key: "positionsCount", title: "Positions", kind: "number", required: true },
      { key: "closesAt", title: "Closing date", kind: "date" },
      { key: "address", title: "Work location", wide: true },
      { key: "description", title: "Job description", kind: "textarea", required: true, wide: true },
    ],
  },
  applications: {
    description: "Submit an application for a job seeker. The employer is notified to review it.",
    submit: "Submit application",
    fields: [
      { key: "seekerUserId", title: "Job seeker", kind: "select", required: true, wide: true, choices: (o) => o?.seekers ?? [] },
      { key: "jobId", title: "Open vacancy", kind: "select", required: true, wide: true, choices: (o) => o?.openJobs ?? [] },
      { key: "coverLetter", title: "Cover letter", kind: "textarea", wide: true, hint: "Only for vacancies that accept cover letters." },
    ],
  },
  "job-seekers": {
    description: "Register an existing account as a job seeker.",
    submit: "Register job seeker",
    fields: [
      { key: "phone", title: "Phone number", kind: "tel", required: true, hint: phoneHint },
      { key: "name", title: "Full name", required: true },
      { key: "gender", title: "Gender", kind: "select", choices: () => genders },
      { key: "preferredRole", title: "Preferred role" },
      { key: "region", title: "Region", wide: true },
    ],
  },
  employers: {
    description: "Register an existing account as an individual employer so vacancies can be posted for it.",
    submit: "Register employer",
    fields: [
      { key: "phone", title: "Phone number", kind: "tel", required: true, hint: phoneHint },
      { key: "name", title: "Employer name", required: true },
    ],
  },
  memberships: {
    description: "Give an existing account a service membership.",
    submit: "Add membership",
    fields: [
      { key: "feature", title: "Membership", kind: "select", required: true, wide: true, choices: (o) => (o?.membershipFeatures ?? []).map((f) => ({ value: f, label: label(f) })) },
      { key: "phone", title: "Phone number", kind: "tel", required: true, hint: phoneHint },
      { key: "name", title: "Member name", required: true },
    ],
  },
  onboardings: {
    description: "Send joining details for an application on the employer's behalf. The candidate replies in the app and the farm owner still activates access.",
    submit: "Send joining details",
    fields: [
      { key: "applicationId", title: "Application", kind: "select", required: true, wide: true, choices: (o) => o?.openApplications ?? [] },
      { key: "farmUuid", title: "Employer farm", kind: "select", required: true, wide: true, choices: (o, v) => {
        const ownerId = o?.openApplications?.find((a) => a.value === v.applicationId)?.ownerId;
        return ownerId ? (o?.farms ?? []).filter((f) => f.ownerId === ownerId) : [];
      }, hint: "Farms owned by the employer of the selected vacancy." },
      { key: "roleTitle", title: "Role title", required: true, wide: true },
      { key: "startDate", title: "Proposed start date", kind: "date", required: true },
      { key: "responseDate", title: "Reply deadline", kind: "date", required: true },
      { key: "reportingName", title: "Contact person", required: true },
      { key: "reportingPhone", title: "Contact phone", kind: "tel", required: true },
      { key: "instructions", title: "Reporting instructions", kind: "textarea", wide: true },
    ],
  },
};

function payload(resource: CareerCreatable, values: Record<string, string>, requestUuid: string) {
  const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v !== ""));
  if (resource === "onboardings") {
    const { startDate, responseDate, reportingName, reportingPhone, instructions, ...rest } = clean;
    return { ...rest, requestUuid, terms: { startDate, responseDate, reportingName, reportingPhone, instructions } };
  }
  if (resource === "jobs") return { ...clean, positionsCount: Number(clean.positionsCount) };
  return clean;
}

export function CareerCreateForm({ resource, options, onClose, onSaved }: {
  resource: CareerCreatable; options: CareerOptions | null; onClose: () => void; onSaved: () => Promise<void>;
}) {
  const form = forms[resource];
  const [requestUuid] = useState(() => crypto.randomUUID());
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(form.fields.map((f) => [f.key, f.key === "positionsCount" ? "1" : ""])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value, ...(key === "applicationId" ? { farmUuid: "" } : {}) }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = Object.fromEntries(form.fields.filter((f) => f.required && !values[f.key]?.trim()).map((f) => [f.key, "This field is required."]));
    setErrors(missing);
    if (Object.keys(missing).length) return false;
    try {
      const response = await authenticatedFetch(`/api/admin/career/${resource}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(resource, values, requestUuid)),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (body.errors) setErrors(Object.fromEntries(Object.entries(body.errors as Record<string, string[]>).map(([k, v]) => [k.replace("terms.", ""), v[0]])));
        throw new Error(body.message ?? "The record could not be created.");
      }
      toast.success(`${careerConfig[resource].singular} created.`);
      await onSaved();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The record could not be created.");
      return false;
    }
  }

  return <FormDialog open onOpenChange={(open) => !open && onClose()} title={careerConfig[resource].create ?? `Add ${careerConfig[resource].singular.toLowerCase()}`}
    description={form.description} submitLabel={form.submit} onSubmit={submit} errors={errors} size="lg">
    <FieldGrid>
      {form.fields.map((f) => {
        const choices = f.choices?.(options, values) ?? [];
        return <Field key={f.key} className={f.wide ? "sm:col-span-2" : undefined}>
          <FieldLabel htmlFor={f.key} required={f.required}>{f.title}</FieldLabel>
          {f.kind === "select" ? <FormSelect id={f.key} value={values[f.key]} options={choices} searchable={choices.length > 8} invalid={Boolean(errors[f.key])}
            placeholder={choices.length ? `Select ${f.title.toLowerCase()}` : "No choices available"} disabled={!choices.length} onValueChange={(v) => set(f.key, v)} />
            : f.kind === "textarea" ? <Textarea id={f.key} value={values[f.key]} rows={4} maxLength={f.key === "instructions" ? 3000 : 10000} aria-invalid={Boolean(errors[f.key])} onChange={(e) => set(f.key, e.target.value)} />
            : <Input id={f.key} type={f.kind ?? "text"} value={values[f.key]} min={f.kind === "number" ? 1 : undefined} maxLength={f.kind === "number" || f.kind === "date" ? undefined : 255} aria-invalid={Boolean(errors[f.key])} onChange={(e) => set(f.key, e.target.value)} />}
          {f.hint && !errors[f.key] && <p className="text-xs text-muted-foreground">{f.hint}</p>}
          <FieldError>{errors[f.key]}</FieldError>
        </Field>;
      })}
    </FieldGrid>
  </FormDialog>;
}
