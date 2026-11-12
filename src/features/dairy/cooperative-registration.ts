const REGISTRATION_PATTERN = /^[A-Z]{2,6}(-[A-Z0-9]{2,8}){1,5}-(19|20)\d{2}-\d{1,8}$/;

/** Omit an unchanged saved identifier so unrelated edits preserve legacy formats exactly. */
export function registrationNumberUpdate(value: string, original?: string | null): { registration_number?: string | null } {
  const trimmed = value.trim();
  if (original !== undefined && trimmed === (original ?? "").trim()) return {};
  return { registration_number: trimmed.toUpperCase() || null };
}

export function registrationNumberError(value: string, original?: string | null): string | undefined {
  const updated = registrationNumberUpdate(value, original).registration_number;
  if (updated && !REGISTRATION_PATTERN.test(updated)) {
    return "For a new or changed registration number, use the registrar format, e.g. COP-ARS-MRU-DC-2021-0458.";
  }
}
