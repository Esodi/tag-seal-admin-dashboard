import type { EventTypeDefinition } from "./types";

export const eggCollectionsType: EventTypeDefinition = {
  slug: "egg-collections",
  code: "record_egg_collection",
  name: "Egg Collections",
  family: "production",
  description: "Poultry flock egg production counts, collection sessions and shell quality grading.",
  primaryAction: "Record egg collection",
  searchPlaceholder: "Search flock ID, farm or session…",
  supportsTabs: true,
  fields: [
    { key: "productionDate", label: "Production Date", type: "date", required: true },
    {
      key: "session",
      label: "Collection Session",
      type: "select",
      staticOptions: [
        { value: "Morning", label: "Morning" },
        { value: "Midday", label: "Midday" },
        { value: "Evening", label: "Evening" },
      ],
      badge: "info",
    },
    { key: "totalEggs", label: "Total Eggs", type: "number", required: true, placeholder: "120", badge: "success" },
    { key: "brokenEggs", label: "Broken Eggs", type: "number", placeholder: "2", badge: "danger" },
    { key: "dirtyEggs", label: "Dirty Eggs", type: "number", placeholder: "4" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Flock production notes" },
  ],
};
