import type { EventTypeDefinition } from "./types";

export const treatmentsType: EventTypeDefinition = {
  slug: "treatments",
  code: "record_medication",
  name: "Treatments",
  family: "health",
  description: "Clinical medication logs, diseases treated, dosages and withdrawal periods.",
  primaryAction: "Record treatment",
  searchPlaceholder: "Search animal tag, farm, disease or medicine…",
  supportsTabs: true,
  fields: [
    { key: "disease", label: "Disease", type: "text", required: true, placeholder: "e.g. Mastitis / Trypanosomiasis", badge: "danger" },
    { key: "medicine", label: "Medicine", type: "text", required: true, placeholder: "e.g. Oxytetracycline 20%", badge: "info" },
    { key: "quantity", label: "Quantity", type: "text", placeholder: "e.g. 15 ml" },
    { key: "withdrawalPeriod", label: "Withdrawal Period", type: "text", placeholder: "e.g. 7 days milk / 28 days meat" },
    { key: "medicationDate", label: "Medication Date", type: "date" },
    { key: "nextMedicationDate", label: "Next Medication", type: "date" },
    { key: "remarks", label: "Clinical Remarks", type: "textarea", placeholder: "Treatment notes" },
  ],
};
