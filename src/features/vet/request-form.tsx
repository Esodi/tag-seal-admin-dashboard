"use client";

import { useState, type FormEvent } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/form-select";
import { Textarea } from "@/components/ui/textarea";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { commerceLabel } from "@/features/commerce/commerce-config";

const problems = ["illness", "injury", "calving", "reproduction", "vaccination", "deworming", "nutrition", "sudden_death", "checkup", "other"];
const urgencies = ["low", "normal", "high", "emergency"];

type Props = { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void };

export function RequestForm({ open, onOpenChange, onSaved }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [value, setValue] = useState({
    farmerUserId: "",
    farmUuid: "",
    livestockUuid: "",
    problemCategory: "illness",
    description: "",
    urgency: "normal",
    latitude: "",
    longitude: "",
    locationAddress: "",
    contactPhone: "",
  });

  function change(patch: Partial<typeof value>) {
    setValue((current) => ({ ...current, ...patch }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!value.farmerUserId.trim()) nextErrors.farmerUserId = "Farmer user id is required";
    if (!value.farmUuid.trim()) nextErrors.farmUuid = "Farm UUID is required";
    if (!value.description.trim()) nextErrors.description = "Description is required";
    if (!value.latitude.trim() || Number.isNaN(Number(value.latitude))) nextErrors.latitude = "Valid latitude is required";
    if (!value.longitude.trim() || Number.isNaN(Number(value.longitude))) nextErrors.longitude = "Valid longitude is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return false;

    const body = {
      farmerUserId: Number(value.farmerUserId),
      farmUuid: value.farmUuid.trim(),
      livestockUuid: value.livestockUuid.trim() || null,
      problemCategory: value.problemCategory,
      description: value.description.trim(),
      urgency: value.urgency,
      latitude: Number(value.latitude),
      longitude: Number(value.longitude),
      locationAddress: value.locationAddress.trim() || null,
      contactPhone: value.contactPhone.trim() || null,
    };

    const ok = await registryRun(
      () => registrySend("/api/admin/vet/requests", "POST", body),
      "Service request created.",
      onSaved,
    );
    if (ok) onOpenChange(false);
    return ok;
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      submitLabel="Create request"
      size="lg"
      errors={errors}
      title="Add farmer service request"
      description="Create an on-demand veterinary visit for a farmer. Use the farmer’s user id and farm UUID from People / Farms."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="req-farmer" required>Farmer user id</FieldLabel>
          <Input id="req-farmer" type="number" value={value.farmerUserId} onChange={(e) => change({ farmerUserId: e.target.value })} aria-invalid={!!errors.farmerUserId || undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-farm" required>Farm UUID</FieldLabel>
          <Input id="req-farm" value={value.farmUuid} onChange={(e) => change({ farmUuid: e.target.value })} aria-invalid={!!errors.farmUuid || undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-livestock">Livestock UUID</FieldLabel>
          <Input id="req-livestock" value={value.livestockUuid} onChange={(e) => change({ livestockUuid: e.target.value })} />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-phone">Contact phone</FieldLabel>
          <Input id="req-phone" value={value.contactPhone} onChange={(e) => change({ contactPhone: e.target.value })} />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-problem" required>Problem</FieldLabel>
          <FormSelect
            id="req-problem"
            value={value.problemCategory}
            options={problems.map((p) => ({ value: p, label: commerceLabel(p) }))}
            onValueChange={(problemCategory) => change({ problemCategory })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-urgency" required>Urgency</FieldLabel>
          <FormSelect
            id="req-urgency"
            value={value.urgency}
            options={urgencies.map((u) => ({ value: u, label: commerceLabel(u) }))}
            onValueChange={(urgency) => change({ urgency })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-lat" required>Latitude</FieldLabel>
          <Input id="req-lat" value={value.latitude} onChange={(e) => change({ latitude: e.target.value })} aria-invalid={!!errors.latitude || undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="req-lng" required>Longitude</FieldLabel>
          <Input id="req-lng" value={value.longitude} onChange={(e) => change({ longitude: e.target.value })} aria-invalid={!!errors.longitude || undefined} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="req-address">Location address</FieldLabel>
          <Input id="req-address" value={value.locationAddress} onChange={(e) => change({ locationAddress: e.target.value })} placeholder="Optional place name or village" />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="req-desc" required>Description</FieldLabel>
          <Textarea id="req-desc" rows={4} value={value.description} onChange={(e) => change({ description: e.target.value })} aria-invalid={!!errors.description || undefined} />
        </Field>
      </div>
    </FormDialog>
  );
}
