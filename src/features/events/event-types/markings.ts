import type { EventTypeDefinition } from "./types";

export const markingsType: EventTypeDefinition = {
  slug: "markings",
  code: "record_marking",
  name: "Livestock Markings",
  family: "growth",
  description: "Ear notching, branding, tattooing and physical marking logs.",
  primaryAction: "Record marking",
  searchPlaceholder: "Search animal tag, farm or marking type…",
  supportsTabs: true,
  fields: [
    { key: "markingType", label: "Marking Type", type: "text", required: true, placeholder: "e.g. Ear Tag / Ear Notch / Brand" },
    { key: "description", label: "Description", type: "text", placeholder: "e.g. Left ear notch #14" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Marking observations" },
  ],
};
