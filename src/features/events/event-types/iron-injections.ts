import type { EventTypeDefinition } from "./types";

export const ironInjectionsType: EventTypeDefinition = {
  slug: "iron-injections",
  code: "record_iron_injection",
  name: "Iron Injections",
  family: "growth",
  description: "Neonatal and supplemental iron administrations, medicines and dosages.",
  primaryAction: "Record iron injection",
  searchPlaceholder: "Search animal tag, farm or medicine…",
  supportsTabs: true,
  fields: [
    { key: "medicine", label: "Medicine", type: "text", required: true, placeholder: "e.g. Iron Dextran 10%", badge: "info" },
    { key: "dose", label: "Dosage", type: "text", required: true, placeholder: "e.g. 2 ml IM" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Administration observations" },
  ],
};
