import type { EventTypeDefinition } from "./types";

export const prepuceConditionsType: EventTypeDefinition = {
  slug: "prepuce-conditions",
  code: "record_prepuce_condition",
  name: "Prepuce Conditions",
  family: "health",
  description: "Male reproductive health assessments, severity grading, treatment and healing status.",
  primaryAction: "Record condition",
  searchPlaceholder: "Search sire tag, farm, condition or status…",
  supportsTabs: true,
  fields: [
    { key: "conditionType", label: "Condition", type: "text", required: true, placeholder: "e.g. Posthitis / Prolapse", badge: "danger" },
    {
      key: "severity",
      label: "Severity",
      type: "select",
      staticOptions: [
        { value: "Mild", label: "Mild" },
        { value: "Moderate", label: "Moderate" },
        { value: "Severe", label: "Severe" },
      ],
    },
    { key: "causeRisk", label: "Cause Or Risk", type: "text", placeholder: "e.g. Thorny pasture / Fighting" },
    { key: "medicine", label: "Medicine", type: "text", placeholder: "Antiseptic or antibiotic" },
    {
      key: "breedingStatus",
      label: "Breeding Status",
      type: "select",
      staticOptions: [
        { value: "Rested", label: "Rested from Breeding" },
        { value: "Active", label: "Fit for Breeding" },
        { value: "Under Observation", label: "Under Observation" },
      ],
    },
    {
      key: "healingStatus",
      label: "Healing Status",
      type: "select",
      staticOptions: [
        { value: "Recovering", label: "Recovering" },
        { value: "Healed", label: "Healed" },
        { value: "Chronic", label: "Chronic" },
      ],
    },
    { key: "followUpDate", label: "Follow-up Date", type: "date" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Evaluation remarks" },
  ],
};
