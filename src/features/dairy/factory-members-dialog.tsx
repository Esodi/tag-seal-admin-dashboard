"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatNida, isNidaType, isValidNida, NIDA_ERROR, NIDA_PATTERN, NIDA_PLACEHOLDER } from "@/lib/identity-format";
import { FormDialog } from "@/components/ui/form-dialog";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";

const roleOptions = [
  { value: "operator", label: "Factory Operator (receives milk)" },
  { value: "manager", label: "Factory Manager (approves arrivals)" },
] as const;
const initialValues = {
  first_name: "", middle_name: "", last_name: "", phone: "",
  identity_card_type_id: "", identity_number: "", tin_number: "", role: "operator",
};
export type FactoryMember = {
  uuid: string; user_id?: number; created_at?: string; name: string | null; phone: string | null; staff_id: string | null;
  first_name?: string | null; middle_name?: string | null; last_name?: string | null;
  identity_card_type_id?: number | null; identity_number?: string | null; tin_number?: string | null;
  role: "manager" | "operator"; is_active: boolean;
};

function valuesOf(member?: FactoryMember): Record<string, string> {
  if (!member) return { ...initialValues };
  return {
    first_name: member.first_name ?? "", middle_name: member.middle_name ?? "", last_name: member.last_name ?? "",
    phone: member.phone ?? "", identity_card_type_id: member.identity_card_type_id ? String(member.identity_card_type_id) : "",
    identity_number: member.identity_number ?? "", tin_number: member.tin_number ?? "", role: member.role,
  };
}

/** Mirrors the server: a Tanzanian 07/06 number, or an international number with its country code. */
function isValidPhone(phone: string) {
  const value = phone.trim();
  if (!/^\+?[0-9\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  if (!value.startsWith("+") && /^0?[67]\d{8}$/.test(digits)) return true;
  return /^[1-9]\d{7,14}$/.test(digits);
}

const required = ["first_name", "last_name", "phone", "identity_card_type_id", "identity_number", "role"];

/** Adds a factory member, or edits [member]. The phone is the member's app sign-in. */
export function FactoryMembersDialog({ factory, member, open, onOpenChange, onSaved }: {
  factory: { uuid: string; name: string };
  member?: FactoryMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const base = `/api/admin/dairy/factories/${encodeURIComponent(factory.uuid)}/members`;
  const [values, setValues] = useState<Record<string, string>>(() => valuesOf(member));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [identityTypes, setIdentityTypes] = useState<{ value: string; label: string }[]>([]);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (open) { setValues(valuesOf(member)); setErrors({}); }
  }, [open, base, member]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIdentityTypes([]);
    setLoadError("");
    authenticatedFetch(base).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not load ID types.");
      if (!cancelled) {
        const options = (payload.identity_card_types ?? []).map((item: { id: number; name: string }) => ({ value: String(item.id), label: item.name }));
        setIdentityTypes(options);
        if (!options.length) setLoadError("No ID types are configured. Add an identity card type before registering a member.");
      }
    }).catch((error) => { if (!cancelled) setLoadError(error instanceof Error ? error.message : "Could not load ID types."); });
    return () => { cancelled = true; };
  }, [open, base, revision]);

  const identityLabel = identityTypes.find((option) => option.value === values.identity_card_type_id)?.label ?? "";
  const nida = isNidaType(identityLabel);
  function set(key: string, value: string) {
    setValues((old) => ({ ...old, [key]: key === "identity_number" && nida ? formatNida(value) : value,
      ...(key === "identity_card_type_id" && value !== old.identity_card_type_id ? { identity_number: "" } : {}),
    }));
    setErrors((old) => ({ ...old, [key]: "" }));
  }

  function validate(keys: string[]) {
    const found: Record<string, string> = {};
    for (const key of keys) if (required.includes(key) && !values[key]?.trim()) found[key] = "This field is required.";
    if (keys.includes("phone") && values.phone.trim() && !isValidPhone(values.phone)) found.phone = "Enter a valid phone number, for example 0754 123 456.";
    if (keys.includes("tin_number") && values.tin_number.trim() && !/^(\d{9}|\d{3}-\d{3}-\d{3})$/.test(values.tin_number.trim())) found.tin_number = "Enter a 9-digit TIN, for example 123-456-789.";
    if (keys.includes("identity_card_type_id") && !identityTypes.some((option) => option.value === values.identity_card_type_id)) found.identity_card_type_id = "Select an available ID type.";
    if (keys.includes("role") && !roleOptions.some((option) => option.value === values.role)) found.role = "Select a factory role.";
    if (keys.includes("identity_number") && nida && values.identity_number && !isValidNida(values.identity_number)) found.identity_number = NIDA_ERROR;
    setErrors((old) => ({ ...old, ...Object.fromEntries(keys.map((key) => [key, found[key] ?? ""])) }));
    return Object.keys(found).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(Object.keys(values))) return false;
    try {
      const body: Record<string, unknown> = { ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() || null])), identity_card_type_id: Number(values.identity_card_type_id) };
      if (member && values.phone.trim() === (member.phone ?? "")) delete body.phone;
      const response = await authenticatedFetch(member ? `${base}/${encodeURIComponent(member.uuid)}` : base, {
        method: member ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.errors) setErrors(Object.fromEntries(Object.entries(payload.errors).map(([key, messages]) => [key, Array.isArray(messages) ? String(messages[0]) : String(messages)])));
        throw new Error(payload.message ?? "Could not save member.");
      }
      toast.success(member ? "Member updated." : "Member saved. They sign in to the app with this phone number.");
      onSaved?.();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save member.");
      return false;
    }
  }

  function input(key: string, label: string, maxLength = 100, type = "text", autoComplete?: string, placeholder?: string) {
    return <Field><FieldLabel htmlFor={`member-${key}`} required={required.includes(key)}>{label}</FieldLabel>
      <Input id={`member-${key}`} name={key} type={type} value={values[key]} onChange={(event) => set(key, event.target.value)} required={required.includes(key)} maxLength={key === "identity_number" && nida ? 23 : maxLength} inputMode={key === "identity_number" && nida ? "numeric" : undefined} pattern={key === "identity_number" && nida ? NIDA_PATTERN : undefined} autoComplete={autoComplete} placeholder={key === "identity_number" && nida ? NIDA_PLACEHOLDER : placeholder} aria-invalid={Boolean(errors[key])} />
      <FieldError>{errors[key]}</FieldError></Field>;
  }

  return <FormDialog open={open} onOpenChange={onOpenChange} title={member ? `Edit ${member.name || "member"}` : "Add user or manager"} size="xl" submitLabel={member ? "Save changes" : "Add member"} onSubmit={submit} errors={errors} stepperThreshold={6}
    onValidateStep={(_index, step) => validate(step.fieldNames ?? [])}
    steps={[
      { id: "personal", title: "Personal details", description: member ? "The member’s name and phone number. Changing the phone changes the number they sign in to the app with." : "The member’s name and phone number for signing in to the app.", fieldNames: ["first_name", "middle_name", "last_name", "phone"], content: <FieldGrid>
        {input("first_name", "First name", 100, "text", "given-name")}
        {input("middle_name", "Middle name (optional)", 100, "text", "additional-name")}
        {input("last_name", "Last name", 100, "text", "family-name")}
        {input("phone", "Phone number", 32, "tel", "tel", "0754 123 456")}
      </FieldGrid> },
      { id: "identity", title: "Identification & role", description: "Identification details and the member’s responsibilities at the factory.", fieldNames: ["identity_card_type_id", "identity_number", "tin_number", "role"], content: <FieldGrid>
        <Field><FieldLabel htmlFor="member-id-type" required>ID type</FieldLabel>
          <FormSelect id="member-id-type" value={values.identity_card_type_id} onValueChange={(value) => set("identity_card_type_id", value)} options={identityTypes} placeholder={identityTypes.length ? "Select ID type" : "Loading ID types…"} disabled={!identityTypes.length} invalid={Boolean(errors.identity_card_type_id)} />
          <FieldError>{errors.identity_card_type_id}</FieldError></Field>
        {input("identity_number", identityLabel ? `${identityLabel} number` : "Identification number")}
        {input("tin_number", "TIN number (optional)", 20, "text", undefined, "123-456-789")}
        <Field><FieldLabel htmlFor="member-role" required>Role</FieldLabel><FormSelect id="member-role" value={values.role} onValueChange={(value) => set("role", value)} options={roleOptions} invalid={Boolean(errors.role)} /><FieldError>{errors.role}</FieldError></Field>
        <FieldDescription className="sm:col-span-2">Operators receive milk at the gate. Managers approve or reject each arrival.</FieldDescription>
        {loadError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{loadError} <button type="button" className="underline" onClick={() => setRevision((value) => value + 1)}>Try again</button></p>}
      </FieldGrid> },
    ]} />;
}
