"use client";

import { useState, type FormEvent } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/form-select";
import { Textarea } from "@/components/ui/textarea";
import { registryRun, registrySend } from "@/features/registry/registry-api";
import { commerceLabel } from "@/features/commerce/commerce-config";
import type { VetServiceRequestRecord } from "./types";
import { vetConfig } from "./vet-config";

const problems = ["illness", "injury", "calving", "reproduction", "vaccination", "deworming", "nutrition", "sudden_death", "checkup", "other"];
const urgencies = ["low", "normal", "high", "emergency"];

type Props = { request?: VetServiceRequestRecord; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void };

export function RequestForm({ request, open, onOpenChange, onSaved }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [value, setValue] = useState(() => ({
    farmerUserId: request?.farmerUserId != null ? String(request.farmerUserId) : "",
    farmUuid: request?.farmUuid ?? "",
    livestockUuid: request?.livestockUuids?.length ? request.livestockUuids.join(", ") : (request?.livestockUuid ?? ""),
    problemCategory: request?.problemCategory ?? "illness",
    description: request?.description ?? "",
    urgency: request?.urgency ?? "normal",
    latitude: request?.latitude != null ? String(request.latitude) : "",
    longitude: request?.longitude != null ? String(request.longitude) : "",
    locationAddress: request?.locationAddress ?? "",
    contactPhone: request?.contactPhone ?? "",
    status: request?.status ?? "pending",
  }));

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

    const rawUuids = value.livestockUuid
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body: Record<string, unknown> = {
      farmerUserId: Number(value.farmerUserId),
      farmUuid: value.farmUuid.trim(),
      livestockUuid: rawUuids[0] || null,
      livestockUuids: rawUuids.length ? rawUuids : null,
      problemCategory: value.problemCategory,
      description: value.description.trim(),
      urgency: value.urgency,
      latitude: Number(value.latitude),
      longitude: Number(value.longitude),
      locationAddress: value.locationAddress.trim() || null,
      contactPhone: value.contactPhone.trim() || null,
      ...(request ? { status: value.status } : {}),
    };

    const ok = await registryRun(
      () => request
        ? registrySend(`/api/admin/vet/requests/${encodeURIComponent(request.uuid)}`, "PUT", body)
        : registrySend("/api/admin/vet/requests", "POST", body),
      request ? "Changes saved." : "Service request created.",
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
      submitLabel={request ? "Save changes" : "Create request"}
      size="lg"
      errors={errors}
      title={request ? `Edit service request · ${request.uuid.slice(0, 8).toUpperCase()}` : "Add farmer service request"}
      description={request
        ? "Update the problem details, location, contact phone or status for this visit."
        : "Create an on-demand veterinary visit for a farmer. Use the farmer’s user id and farm UUID from People / Farms."}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="req-farmer" required>Farmer user id</FieldLabel>
          <Input id="req-farmer" type="number" value={value.farmerUserId} onChange={(e) => change({ farmerUserId: e.target.value })} aria-invalid={!!errors.farmerUserId || undefined} />
          <FieldError>{errors.farmerUserId}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="req-farm" required>Farm UUID</FieldLabel>
          <Input id="req-farm" value={value.farmUuid} onChange={(e) => change({ farmUuid: e.target.value })} aria-invalid={!!errors.farmUuid || undefined} />
          <FieldError>{errors.farmUuid}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="req-livestock">Livestock UUID(s)</FieldLabel>
          <Input id="req-livestock" value={value.livestockUuid} onChange={(e) => change({ livestockUuid: e.target.value })} placeholder="Comma-separated UUIDs for multiple animals" />
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
        {request && (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="req-status" required>Status</FieldLabel>
            <FormSelect
              id="req-status"
              value={value.status}
              options={vetConfig.requests.statuses.map((s) => ({ value: s, label: commerceLabel(s) }))}
              onValueChange={(status) => change({ status })}
            />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="req-lat" required>Latitude</FieldLabel>
          <Input id="req-lat" value={value.latitude} onChange={(e) => change({ latitude: e.target.value })} aria-invalid={!!errors.latitude || undefined} />
          <FieldError>{errors.latitude}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="req-lng" required>Longitude</FieldLabel>
          <Input id="req-lng" value={value.longitude} onChange={(e) => change({ longitude: e.target.value })} aria-invalid={!!errors.longitude || undefined} />
          <FieldError>{errors.longitude}</FieldError>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="req-address">Location address</FieldLabel>
          <Input id="req-address" value={value.locationAddress} onChange={(e) => change({ locationAddress: e.target.value })} placeholder="Optional place name or village" />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="req-desc" required>Description</FieldLabel>
          <Textarea id="req-desc" rows={4} value={value.description} onChange={(e) => change({ description: e.target.value })} aria-invalid={!!errors.description || undefined} />
          <FieldError>{errors.description}</FieldError>
        </Field>
      </div>
    </FormDialog>
  );
}
