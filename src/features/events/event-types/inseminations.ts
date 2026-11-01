import type { EventTypeDefinition } from "./types";

export const inseminationsType: EventTypeDefinition = {
  slug: "inseminations",
  code: "record_insemination",
  name: "Inseminations",
  family: "breeding",
  description: "Artificial and natural breeding service logs, heat signs, semen straw types and bull details.",
  primaryAction: "Record insemination",
  searchPlaceholder: "Search dam tag, farm, bull code or breed…",
  supportsTabs: true,
  fields: [
    {
      key: "heatType",
      label: "Heat Type",
      type: "select",
      staticOptions: [
        { value: "Natural Heat", label: "Natural Heat" },
        { value: "Synchronized Heat", label: "Synchronized Heat" },
      ],
    },
    {
      key: "inseminationService",
      label: "Service",
      type: "select",
      staticOptions: [
        { value: "Artificial Insemination (AI)", label: "Artificial Insemination (AI)" },
        { value: "Natural Service", label: "Natural Service" },
        { value: "Embryo Transfer", label: "Embryo Transfer" },
      ],
      badge: "info",
    },
    {
      key: "semenStrawType",
      label: "Semen Straw Type",
      type: "select",
      staticOptions: [
        { value: "Conventional", label: "Conventional" },
        { value: "Sexed Female", label: "Sexed Female" },
        { value: "Sexed Male", label: "Sexed Male" },
      ],
    },
    { key: "inseminationDate", label: "Insemination Date", type: "date", required: true },
    { key: "bullCode", label: "Bull Code", type: "text", placeholder: "e.g. FR-9082" },
    { key: "bullBreed", label: "Bull Breed", type: "text", placeholder: "e.g. Holstein Friesian" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Technician remarks" },
  ],
};
