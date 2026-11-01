import type { EventTypeDefinition } from "./types";

export const vaccinationsType: EventTypeDefinition = {
  slug: "vaccinations",
  code: "record_vaccination",
  name: "Vaccinations",
  family: "health",
  description: "Preventive immunization logs, vaccine batches, target diseases and attending officers.",
  primaryAction: "Record vaccination",
  searchPlaceholder: "Search animal tag, farm, vaccine or disease…",
  supportsTabs: true,
  fields: [
    { key: "vaccinationNo", label: "Vaccination Number", type: "text", placeholder: "e.g. VAC-2026-001" },
    { key: "vaccine", label: "Vaccine", type: "text", required: true, placeholder: "e.g. ECF Muguga Cocktail / FMD", badge: "info" },
    { key: "disease", label: "Disease", type: "text", required: true, placeholder: "e.g. East Coast Fever / Foot and Mouth", badge: "danger" },
    { key: "vet", label: "Veterinarian", type: "text", placeholder: "Veterinarian name or license" },
    { key: "extensionOfficer", label: "Extension Officer", type: "text", placeholder: "Field officer name" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Vaccination batch notes" },
  ],
};
