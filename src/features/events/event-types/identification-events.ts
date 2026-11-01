import type { EventTypeDefinition } from "./types";

export const identificationEventsType: EventTypeDefinition = {
  slug: "identification-events",
  code: "identification_events",
  name: "Identification Events",
  family: "identity",
  description: "Physical tag assignments, replacements and identification history across farms.",
  primaryAction: "Add identification event",
  searchPlaceholder: "Search identification number, farm or livestock tag…",
  supportsTabs: false,
  fields: [
    {
      key: "farmUuid",
      label: "Farm",
      type: "select",
      required: true,
      optionsKey: "farms",
      placeholder: "Select farm",
    },
    {
      key: "livestockUuid",
      label: "Livestock",
      type: "select",
      optionsKey: "livestock",
      placeholder: "Select livestock (optional)",
    },
    {
      key: "identificationNumber",
      label: "Identification Number",
      type: "text",
      required: true,
      placeholder: "e.g. TZ-TAG-00941",
    },
    {
      key: "eventDate",
      label: "Event Date",
      type: "date",
      required: true,
    },
    {
      key: "remarks",
      label: "Remarks",
      type: "textarea",
      placeholder: "Tag assignment or replacement notes",
    },
  ],
};
