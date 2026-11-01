import type { EventTypeDefinition } from "./types";

export const allEventsType: EventTypeDefinition = {
  slug: "all-events",
  code: null,
  name: "All Events",
  family: "ledger",
  description: "Unified dynamic ledger of all animal lifecycle events across farms and workflows.",
  primaryAction: "Record event",
  searchPlaceholder: "Search animal tag, farm, event code or payload…",
  status: "new",
  supportsTabs: true,
  fields: [
    {
      key: "eventCode",
      label: "Event Type",
      type: "select",
      required: true,
      optionsKey: "eventCodes",
      placeholder: "Select event type",
    },
    {
      key: "remarks",
      label: "Remarks / Notes",
      type: "textarea",
      placeholder: "Clinical or operational event observations",
    },
  ],
};
