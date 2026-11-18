"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";
import type { VetRecord } from "./types";
import { requiredVetDocuments, vetDocumentLabel } from "./vet-document-rules";

/** Mirrors the app's "I am a veterinarian" form: same fields, same rules. */
export type VetRegistration = {
  firstName: string; middleName: string; lastName: string; dateOfBirth: string; gender: string; phoneNumber: string; email: string;
  identityCardTypeId: string; identityNo: string;
  medicalLicenseNo: string; licenseAuthority: string; licenseExpiryDate: string; specializations: string[];
  yearsOfExperience: string; clinicName: string; bio: string;
  countryId: string; regionId: string; districtId: string; serviceRadiusKm: string; address: string; latitude: string; longitude: string;
  schoolLevelId: string; documents: Partial<Record<string, File>>; otherDocuments: File[];
};

export const emptyRegistration = (): VetRegistration => ({
  firstName: "", middleName: "", lastName: "", dateOfBirth: "", gender: "", phoneNumber: "", email: "",
  identityCardTypeId: "", identityNo: "",
  medicalLicenseNo: "", licenseAuthority: "", licenseExpiryDate: "", specializations: [],
  yearsOfExperience: "", clinicName: "", bio: "",
  countryId: "", regionId: "", districtId: "", serviceRadiusKm: "30", address: "", latitude: "", longitude: "",
  schoolLevelId: "", documents: {}, otherDocuments: [],
});

/** Pre-fills the vet registration form from an existing [VetRecord] for editing. */
export function registrationFromVet(vet: VetRecord): VetRegistration {
  const parts = (vet.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
  return {
    firstName,
    middleName,
    lastName,
    dateOfBirth: vet.dateOfBirth ? vet.dateOfBirth.slice(0, 10) : "",
    gender: vet.gender ?? "",
    phoneNumber: vet.phoneNumber ?? "",
    email: vet.email ?? "",
    identityCardTypeId: vet.identityCardTypeId != null ? String(vet.identityCardTypeId) : "",
    identityNo: vet.identityNo ?? "",
    medicalLicenseNo: vet.medicalLicenseNo ?? "",
    licenseAuthority: vet.licenseAuthority ?? "",
    licenseExpiryDate: vet.licenseExpiryDate ? vet.licenseExpiryDate.slice(0, 10) : "",
    specializations: Array.isArray(vet.specializations) ? [...vet.specializations] : [],
    yearsOfExperience: vet.yearsOfExperience != null ? String(vet.yearsOfExperience) : "",
    clinicName: vet.clinicName ?? "",
    bio: vet.bio ?? "",
    countryId: vet.countryId != null ? String(vet.countryId) : "",
    regionId: vet.regionId != null ? String(vet.regionId) : "",
    districtId: vet.districtId != null ? String(vet.districtId) : "",
    serviceRadiusKm: vet.serviceRadiusKm != null ? String(vet.serviceRadiusKm) : "30",
    address: vet.address ?? "",
    latitude: vet.latitude != null ? String(vet.latitude) : "",
    longitude: vet.longitude != null ? String(vet.longitude) : "",
    schoolLevelId: vet.schoolLevelId != null ? String(vet.schoolLevelId) : "",
    documents: {},
    otherDocuments: [],
  };
}

export const specializationLabels: Record<string, string> = {
  cattle: "Cattle", goats_sheep: "Goats & sheep", poultry: "Poultry", pigs: "Pigs", dairy: "Dairy", reproduction: "Reproduction",
  surgery: "Surgery", vaccination: "Vaccination", nutrition: "Nutrition", laboratory: "Laboratory", general: "General practice",
};

export const genderOptions = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }];

export const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const MAX_DOCUMENT_MB = 8;
export const MAX_DOCUMENT_BYTES = MAX_DOCUMENT_MB * 1024 * 1024;

export const formatDocumentSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;

export const vetDocumentPurpose = (type: string) => {
  if (type === "license") return "vet_license";
  if (type === "education_certificate") return "vet_education_certificate";
  if (type === "college_certificate") return "vet_college_certificate";
  return "vet_document";
};

const uploadedFileKeys = new WeakMap<File, string>();

/** Uploads one credential to object storage (`/api/admin/media`) and returns its storage key. */
export async function uploadVetDocument(file: File, type: string): Promise<string> {
  const cached = uploadedFileKeys.get(file);
  if (cached) return cached;
  const form = new FormData();
  form.append("purpose", vetDocumentPurpose(type));
  form.append("file", file);
  const response = await authenticatedFetch("/api/admin/media", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });
  const payload = await response.json().catch(() => ({}));
  const key = payload?.data?.key;
  if (!response.ok || typeof key !== "string" || !key) {
    const firstError =
      payload?.errors && typeof payload.errors === "object"
        ? Object.values(payload.errors as Record<string, string[]>)[0]?.[0]
        : undefined;
    throw new Error(
      firstError ??
        payload?.message ??
        (response.status === 413
          ? `${file.name} (${formatDocumentSize(file.size)}) exceeds the ${MAX_DOCUMENT_MB} MB limit.`
          : `Could not upload ${file.name}.`),
    );
  }
  uploadedFileKeys.set(file, key);
  return key;
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const today = () => isoDay(new Date());
/** The latest birth date that makes the vet 18 today. */
export const adultBirthLimit = () => {
  const now = new Date();
  return isoDay(new Date(Date.UTC(now.getFullYear() - 18, now.getMonth(), now.getDate())));
};
export const tomorrow = () => isoDay(new Date(Date.now() + 86_400_000));

export const stepFields = {
  identity: ["firstName", "middleName", "lastName", "dateOfBirth", "gender", "phoneNumber", "email", "identityCardTypeId", "identityNo"],
  practice: ["medicalLicenseNo", "licenseAuthority", "licenseExpiryDate", "specializations", "yearsOfExperience", "clinicName", "bio"],
  documents: ["schoolLevelId", ...requiredVetDocuments.map((type) => `documents.${type}`), "documents.other"],
  coverage: ["countryId", "regionId", "districtId", "serviceRadiusKm", "address", "latitude", "longitude"],
  review: [],
} as const;
export type VetStepId = keyof typeof stepFields;

const required = (label: string) => `${label} is required`;

/** Field errors for one step, keyed like the server's validation errors. */
export function validateStep(step: VetStepId, v: VetRegistration, existing?: VetRecord): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "identity") {
    if (!v.firstName.trim()) e.firstName = required("First name");
    if (!v.lastName.trim()) e.lastName = required("Surname");
    if (!v.dateOfBirth && !existing) e.dateOfBirth = required("Date of birth");
    else if (v.dateOfBirth && v.dateOfBirth > adultBirthLimit()) e.dateOfBirth = "The vet must be at least 18 years old";
    if (!v.gender && !existing) e.gender = required("Sex");
    if (!v.phoneNumber.trim()) e.phoneNumber = required("Phone number");
    if (v.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) e.email = "Enter a valid email address";
    if (v.identityCardTypeId && !v.identityNo.trim()) e.identityNo = required("Identity card number");
    if (v.identityNo.trim() && !v.identityCardTypeId) e.identityCardTypeId = required("Identity card type");
  }
  if (step === "practice") {
    if (!v.medicalLicenseNo.trim() && !existing) e.medicalLicenseNo = required("Licence number");
    if (!v.licenseExpiryDate && !existing) e.licenseExpiryDate = required("Licence expiry date");
    else if (
      v.licenseExpiryDate &&
      v.licenseExpiryDate <= today() &&
      (!existing || v.licenseExpiryDate !== existing.licenseExpiryDate?.slice(0, 10))
    ) {
      e.licenseExpiryDate = "The licence must not have expired";
    }
    if (v.specializations.length === 0 && !existing) e.specializations = "Select at least one specialisation";
    const years = v.yearsOfExperience.trim();
    if (years && !(Number.isInteger(Number(years)) && Number(years) >= 0 && Number(years) <= 60)) e.yearsOfExperience = "Enter a whole number from 0 to 60";
  }
  if (step === "documents") {
    if (!v.schoolLevelId && !existing) e.schoolLevelId = required("Secondary education level");
    for (const type of requiredVetDocuments) {
      const file = v.documents[type];
      if (!file && !existing) e[`documents.${type}`] = required(vetDocumentLabel(type));
      else if (file && file.size > MAX_DOCUMENT_BYTES) e[`documents.${type}`] = `The file must be ${MAX_DOCUMENT_MB} MB or smaller`;
    }
    if (v.otherDocuments.length > 5) e["documents.other"] = "Attach at most 5 supporting documents";
    else if (v.otherDocuments.some((f) => f.size > MAX_DOCUMENT_BYTES)) e["documents.other"] = `Each file must be ${MAX_DOCUMENT_MB} MB or smaller`;
  }
  if (step === "coverage") {
    const radius = Number(v.serviceRadiusKm);
    if (!Number.isInteger(radius) || radius < 5 || radius > 150) e.serviceRadiusKm = "Enter a radius from 5 to 150 km";
    if (v.latitude.trim()) {
      const lat = Number(v.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) e.latitude = "Latitude must be between -90 and 90";
    }
    if (v.longitude.trim()) {
      const lng = Number(v.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) e.longitude = "Longitude must be between -180 and 180";
    }
  }
  return e;
}

/** JSON body for POST /api/admin/vet/vets or PUT /api/admin/vet/vets/{id}. */
export function registrationPayload(
  v: VetRegistration,
  documentKeys: Record<string, string>,
  otherDocumentKeys: string[],
  isEdit = false,
): Record<string, unknown> {
  const str = (val: string) => (val.trim() ? val.trim() : isEdit ? null : undefined);
  const num = (val: string) => (val.trim() && !Number.isNaN(Number(val)) ? Number(val) : isEdit ? null : undefined);
  const fullName = [v.firstName, v.middleName, v.lastName].map((s) => s.trim()).filter(Boolean).join(" ");
  const payload: Record<string, unknown> = {
    fullName: fullName || undefined,
    firstName: str(v.firstName),
    middleName: str(v.middleName),
    lastName: str(v.lastName),
    dateOfBirth: str(v.dateOfBirth),
    gender: str(v.gender),
    phoneNumber: str(v.phoneNumber),
    email: str(v.email),
    identityCardTypeId: num(v.identityCardTypeId),
    identityNo: str(v.identityNo),
    medicalLicenseNo: str(v.medicalLicenseNo),
    licenseAuthority: str(v.licenseAuthority),
    licenseExpiryDate: str(v.licenseExpiryDate),
    specializations: v.specializations,
    yearsOfExperience: num(v.yearsOfExperience),
    clinicName: str(v.clinicName),
    bio: str(v.bio),
    countryId: num(v.countryId),
    regionId: num(v.regionId),
    districtId: num(v.districtId),
    serviceRadiusKm: num(v.serviceRadiusKm) ?? 30,
    address: str(v.address),
    latitude: num(v.latitude),
    longitude: num(v.longitude),
    schoolLevelId: num(v.schoolLevelId),
  };

  if (!isEdit || Object.keys(documentKeys).length > 0) {
    payload.documentKeys = documentKeys;
  }
  if (!isEdit || otherDocumentKeys.length > 0) {
    payload.otherDocumentKeys = otherDocumentKeys;
  }
  if (!isEdit) {
    payload.verificationStatus = "verified";
  }

  return payload;
}

/** Multipart fallback body for POST /vet/vets; the vet is approved straight away. */
export function registrationFormData(v: VetRegistration): FormData {
  const form = new FormData();
  const put = (key: string, value: string) => { if (value.trim()) form.append(key, value.trim()); };
  put("firstName", v.firstName); put("middleName", v.middleName); put("lastName", v.lastName);
  put("dateOfBirth", v.dateOfBirth); put("gender", v.gender); put("phoneNumber", v.phoneNumber); put("email", v.email);
  put("identityCardTypeId", v.identityCardTypeId); put("identityNo", v.identityNo);
  put("medicalLicenseNo", v.medicalLicenseNo); put("licenseAuthority", v.licenseAuthority); put("licenseExpiryDate", v.licenseExpiryDate);
  v.specializations.forEach((code, i) => form.append(`specializations[${i}]`, code));
  put("yearsOfExperience", v.yearsOfExperience); put("clinicName", v.clinicName); put("bio", v.bio);
  put("countryId", v.countryId); put("regionId", v.regionId); put("districtId", v.districtId); put("serviceRadiusKm", v.serviceRadiusKm); put("address", v.address);
  put("latitude", v.latitude); put("longitude", v.longitude);
  put("schoolLevelId", v.schoolLevelId);
  for (const type of requiredVetDocuments) {
    const file = v.documents[type];
    if (file) form.append(`documents[${type}]`, file);
  }
  v.otherDocuments.forEach((file, i) => form.append(`documents[other][${i}]`, file));
  form.append("verificationStatus", "verified");
  return form;
}

export type VetFormOptions = {
  schoolLevels: Array<{ id: number; name: string }>;
  specializations: string[];
  identityCardTypes?: Array<{ id: number; name: string }>;
  countries?: Array<{ id: number; name: string }>;
};

/** Secondary school levels, identity card types, countries, and specialisation codes. */
export function useVetFormOptions(open: boolean) {
  const [state, setState] = useState<{ data: VetFormOptions; error: string | null; loading: boolean }>({
    data: { schoolLevels: [], specializations: Object.keys(specializationLabels), identityCardTypes: [], countries: [] },
    error: null,
    loading: false,
  });
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setState((old) => ({ ...old, loading: true }));
    authenticatedFetch("/api/admin/vet/form-options", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load the form options.");
        setState({ data: payload.data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState((old) => ({ ...old, error: error instanceof Error ? error.message : "Could not load the form options.", loading: false }));
      });
    return () => controller.abort();
  }, [open]);
  return state;
}
