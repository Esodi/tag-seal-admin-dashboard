import type { EventTypeDefinition } from "./types";

export const dewormingsType: EventTypeDefinition = {
  slug: "dewormings",
  code: "record_deworming",
  name: "Dewormings",
  family: "health",
  description: "Parasite control administrations, anthelmintic medicines, routes and next schedules.",
  primaryAction: "Record deworming",
  searchPlaceholder: "Search animal tag, farm, medicine or route…",
  supportsTabs: true,
  fields: [
    { key: "medicine", label: "Medicine", type: "text", required: true, placeholder: "e.g. Albendazole 10% / Ivermectin", badge: "info" },
    {
      key: "administrationRoute",
      label: "Administration Route",
      type: "select",
      staticOptions: [
        { value: "Oral", label: "Oral Drench" },
        { value: "Subcutaneous", label: "Subcutaneous (SC)" },
        { value: "Intramuscular", label: "Intramuscular (IM)" },
        { value: "Pour-on", label: "Pour-on / Topical" },
      ],
    },
    { key: "quantity", label: "Quantity", type: "text", placeholder: "e.g. 20 ml" },
    { key: "dose", label: "Dose", type: "text", placeholder: "e.g. 10 mg/kg" },
    { key: "nextAdministrationDate", label: "Next Administration", type: "date" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Administration notes" },
  ],
};
