import type { VetRecord } from "./types";

export const requiredVetDocuments = ["license", "education_certificate", "college_certificate"] as const;

const labels: Record<string, string> = {
  license: "Practising licence",
  education_certificate: "Secondary education certificate",
  college_certificate: "Veterinary college certificate",
  other: "Supporting document",
};

export const vetDocumentLabel = (type: string) => labels[type] ?? labels.other;

export function missingVetDocuments(row: VetRecord): string[] {
  const types = new Set((row.documents ?? []).map((d) => d.type));
  return requiredVetDocuments.filter((type) => !types.has(type));
}
