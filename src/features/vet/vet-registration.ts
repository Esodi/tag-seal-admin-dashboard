"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";
import { requiredVetDocuments, vetDocumentLabel } from "./vet-document-rules";

/** Mirrors the app's "I am a veterinarian" form: same fields, same rules. */
export type VetRegistration = {
  firstName: string; middleName: string; lastName: string; dateOfBirth: string; gender: string; phoneNumber: string; email: string;
  medicalLicenseNo: string; licenseAuthority: string; licenseExpiryDate: string; specializations: string[];
  yearsOfExperience: string; clinicName: string; bio: string;
  regionId: string; districtId: string; serviceRadiusKm: string; address: string;
  schoolLevelId: string; documents: Partial<Record<string, File>>; otherDocuments: File[];
};

export const emptyRegistration = (): VetRegistration => ({
  firstName: "", middleName: "", lastName: "", dateOfBirth: "", gender: "", phoneNumber: "", email: "",
  medicalLicenseNo: "", licenseAuthority: "", licenseExpiryDate: "", specializations: [],
  yearsOfExperience: "", clinicName: "", bio: "",
  regionId: "", districtId: "", serviceRadiusKm: "30", address: "",
  schoolLevelId: "", documents: {}, otherDocuments: [],
});

export const specializationLabels: Record<string, string> = {
  cattle: "Cattle", goats_sheep: "Goats & sheep", poultry: "Poultry", pigs: "Pigs", dairy: "Dairy", reproduction: "Reproduction",
  surgery: "Surgery", vaccination: "Vaccination", nutrition: "Nutrition", laboratory: "Laboratory", general: "General practice",
};

export const genderOptions = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }];

export const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png";
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const today = () => isoDay(new Date());
/** The latest birth date that makes the vet 18 today. */
export const adultBirthLimit = () => {
  const now = new Date();
  return isoDay(new Date(Date.UTC(now.getFullYear() - 18, now.getMonth(), now.getDate())));
};
export const tomorrow = () => isoDay(new Date(Date.now() + 86_400_000));

export const stepFields = {
  identity: ["firstName", "lastName", "dateOfBirth", "gender", "phoneNumber", "email"],
  practice: ["medicalLicenseNo", "licenseExpiryDate", "specializations", "yearsOfExperience"],
  coverage: ["serviceRadiusKm"],
  documents: ["schoolLevelId", ...requiredVetDocuments.map((type) => `documents.${type}`), "documents.other"],
  review: [],
} as const;
export type VetStepId = keyof typeof stepFields;

const required = (label: string) => `${label} is required`;

/** Field errors for one step, keyed like the server's validation errors. */
export function validateStep(step: VetStepId, v: VetRegistration): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "identity") {
    if (!v.firstName.trim()) e.firstName = required("First name");
    if (!v.lastName.trim()) e.lastName = required("Surname");
    if (!v.dateOfBirth) e.dateOfBirth = required("Date of birth");
    else if (v.dateOfBirth > adultBirthLimit()) e.dateOfBirth = "The vet must be at least 18 years old";
    if (!v.gender) e.gender = required("Sex");
    if (!v.phoneNumber.trim()) e.phoneNumber = required("Phone number");
    if (v.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) e.email = "Enter a valid email address";
  }
  if (step === "practice") {
    if (!v.medicalLicenseNo.trim()) e.medicalLicenseNo = required("Licence number");
    if (!v.licenseExpiryDate) e.licenseExpiryDate = required("Licence expiry date");
    else if (v.licenseExpiryDate <= today()) e.licenseExpiryDate = "The licence must not have expired";
    if (v.specializations.length === 0) e.specializations = "Select at least one specialisation";
    const years = v.yearsOfExperience.trim();
    if (years && !(Number.isInteger(Number(years)) && Number(years) >= 0 && Number(years) <= 60)) e.yearsOfExperience = "Enter a whole number from 0 to 60";
  }
  if (step === "coverage") {
    const radius = Number(v.serviceRadiusKm);
    if (!Number.isInteger(radius) || radius < 5 || radius > 150) e.serviceRadiusKm = "Enter a radius from 5 to 150 km";
  }
  if (step === "documents") {
    if (!v.schoolLevelId) e.schoolLevelId = required("Secondary education level");
    for (const type of requiredVetDocuments) {
      const file = v.documents[type];
      if (!file) e[`documents.${type}`] = required(vetDocumentLabel(type));
      else if (file.size > MAX_DOCUMENT_BYTES) e[`documents.${type}`] = "The file must be 8 MB or smaller";
    }
    if (v.otherDocuments.length > 5) e["documents.other"] = "Attach at most 5 supporting documents";
    else if (v.otherDocuments.some((f) => f.size > MAX_DOCUMENT_BYTES)) e["documents.other"] = "Each file must be 8 MB or smaller";
  }
  return e;
}

/** Multipart body for POST /vet/vets; the vet is approved straight away. */
export function registrationFormData(v: VetRegistration): FormData {
  const form = new FormData();
  const put = (key: string, value: string) => { if (value.trim()) form.append(key, value.trim()); };
  put("firstName", v.firstName); put("middleName", v.middleName); put("lastName", v.lastName);
  put("dateOfBirth", v.dateOfBirth); put("gender", v.gender); put("phoneNumber", v.phoneNumber); put("email", v.email);
  put("medicalLicenseNo", v.medicalLicenseNo); put("licenseAuthority", v.licenseAuthority); put("licenseExpiryDate", v.licenseExpiryDate);
  v.specializations.forEach((code, i) => form.append(`specializations[${i}]`, code));
  put("yearsOfExperience", v.yearsOfExperience); put("clinicName", v.clinicName); put("bio", v.bio);
  put("regionId", v.regionId); put("districtId", v.districtId); put("serviceRadiusKm", v.serviceRadiusKm); put("address", v.address);
  put("schoolLevelId", v.schoolLevelId);
  for (const type of requiredVetDocuments) {
    const file = v.documents[type];
    if (file) form.append(`documents[${type}]`, file);
  }
  v.otherDocuments.forEach((file, i) => form.append(`documents[other][${i}]`, file));
  form.append("verificationStatus", "verified");
  return form;
}

export type VetFormOptions = { schoolLevels: Array<{ id: number; name: string }>; specializations: string[] };

/** Secondary school levels and specialisation codes, loaded while the form is open. */
export function useVetFormOptions(open: boolean) {
  const [state, setState] = useState<{ data: VetFormOptions; error: string | null; loading: boolean }>({
    data: { schoolLevels: [], specializations: Object.keys(specializationLabels) }, error: null, loading: false,
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
