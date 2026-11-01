import type { EventTypeDefinition } from "./types";

export const milkingsType: EventTypeDefinition = {
  slug: "milkings",
  code: "record_milking",
  name: "Milkings",
  family: "production",
  description: "Daily milk yield sessions, milking methods, lactometer readings and milk composition metrics.",
  primaryAction: "Record milking",
  searchPlaceholder: "Search cow tag, farm, session or method…",
  supportsTabs: true,
  fields: [
    { key: "milkQuantity", label: "Milk Quantity", type: "number", required: true, unit: "L", placeholder: "14.5", badge: "success" },
    {
      key: "session",
      label: "Session",
      type: "select",
      required: true,
      staticOptions: [
        { value: "Morning", label: "Morning" },
        { value: "Afternoon", label: "Afternoon" },
        { value: "Evening", label: "Evening" },
      ],
      badge: "info",
    },
    {
      key: "milkingMethod",
      label: "Milking Method",
      type: "select",
      staticOptions: [
        { value: "Hand Milking", label: "Hand Milking" },
        { value: "Machine Milking", label: "Machine Milking" },
      ],
    },
    { key: "lactometerReading", label: "Lactometer Reading", type: "number", placeholder: "29.2" },
    { key: "totalSolids", label: "Total Solids", type: "number", unit: "%", placeholder: "12.8" },
    { key: "protein", label: "Protein", type: "number", unit: "%", placeholder: "3.4" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Milk quality notes" },
  ],
};
