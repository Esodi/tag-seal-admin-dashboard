import type { EventTypeDefinition } from "./types";

export const stageChangesType: EventTypeDefinition = {
  slug: "stage-changes",
  code: "record_stage_change",
  name: "Stage Changes",
  family: "growth",
  description: "Lifecycle stage transitions across growth, maturity and production phases.",
  primaryAction: "Record stage change",
  searchPlaceholder: "Search animal tag, farm or lifecycle stage…",
  supportsTabs: true,
  fields: [
    { key: "newStage", label: "New Stage", type: "text", required: true, placeholder: "e.g. Weaner / Heifer / Lactating Cow", badge: "info" },
    { key: "previousStage", label: "Previous Stage", type: "text", placeholder: "e.g. Calf / Piglet" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Transition remarks" },
  ],
};
