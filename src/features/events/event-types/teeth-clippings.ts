import type { EventTypeDefinition } from "./types";

export const teethClippingsType: EventTypeDefinition = {
  slug: "teeth-clippings",
  code: "record_teeth_clipping",
  name: "Teeth Clippings",
  family: "growth",
  description: "Piglet needle-teeth clipping and grinding procedures and clinical notes.",
  primaryAction: "Record teeth clipping",
  searchPlaceholder: "Search animal tag, farm or clipping method…",
  supportsTabs: true,
  fields: [
    { key: "method", label: "Method", type: "text", required: true, placeholder: "e.g. Tooth Grinding / Clippers" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Procedure notes" },
  ],
};
