"use client";

import type { FormEvent } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import type { RegistryRow } from "./cooperative-registry-types";

export function CollectionCentreEditForm({ record, open, onOpenChange, onSaved }: {
  record: RegistryRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    try {
      const response = await authenticatedFetch(`/api/admin/dairy/cooperatives/centres/${encodeURIComponent(record.uuid)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          contact_name: String(form.get("contact_name") ?? "").trim() || null,
          contact_phone: String(form.get("contact_phone") ?? "").trim() || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not update the centre.");
      toast.success("Collection centre updated.");
      onSaved();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the centre.");
      return false;
    }
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} fieldsClassName="sm:grid-cols-2" title="Edit collection centre" onSubmit={submit} submitLabel="Save changes">
      <Field className="sm:col-span-2"><FieldLabel htmlFor="centre-name" required>Centre name</FieldLabel><Input id="centre-name" name="name" defaultValue={record.name} required maxLength={255} /></Field>
      <Field><FieldLabel htmlFor="centre-contact">Contact name</FieldLabel><Input id="centre-contact" name="contact_name" defaultValue={record.contact_name ?? ""} maxLength={255} /></Field>
      <Field><FieldLabel htmlFor="centre-phone">Contact phone</FieldLabel><Input id="centre-phone" name="contact_phone" defaultValue={record.contact_phone ?? ""} maxLength={50} /></Field>
      <p className="sm:col-span-2 text-sm text-muted-foreground">Cooperative, location and stock details are not changed here.</p>
    </FormDialog>
  );
}
