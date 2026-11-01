import type { EventTypeDefinition } from "./types";

export const feedingsType: EventTypeDefinition = {
  slug: "feedings",
  code: "record_feeding",
  name: "Feedings",
  family: "growth",
  description: "Ration distributions, feed types, quantities and next feeding schedules.",
  primaryAction: "Record feeding",
  searchPlaceholder: "Search animal tag, farm or feed type…",
  supportsTabs: true,
  fields: [
    { key: "feedingType", label: "Feed Type", type: "text", required: true, placeholder: "e.g. Dairy Meal / Napier Grass" },
    { key: "amount", label: "Amount", type: "text", required: true, placeholder: "e.g. 6 kg" },
    { key: "nextFeedingTime", label: "Next Feeding Time", type: "text", placeholder: "e.g. 17:00" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Ration notes" },
  ],
};
