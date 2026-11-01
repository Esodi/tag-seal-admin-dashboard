import type { EventTypeDefinition } from "./types";

export const weightChangesType: EventTypeDefinition = {
  slug: "weight-changes",
  code: "record_weight",
  name: "Weight Changes",
  family: "growth",
  description: "Body weight measurements, previous weight comparisons and growth tracking.",
  primaryAction: "Record weight",
  searchPlaceholder: "Search animal tag, farm or weight remarks…",
  supportsTabs: true,
  fields: [
    { key: "newWeight", label: "New Weight", type: "number", required: true, unit: "kg", placeholder: "320", badge: "success" },
    { key: "oldWeight", label: "Previous Weight", type: "number", unit: "kg", placeholder: "295" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Condition notes" },
  ],
};
