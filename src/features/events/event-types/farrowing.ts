import type { EventTypeDefinition } from "./types";

export const farrowingType: EventTypeDefinition = {
  slug: "farrowing",
  code: "record_farrowing",
  name: "Farrowing",
  family: "births",
  description: "Swine litter birth events, live and stillborn piglet counts and farrowing conditions.",
  primaryAction: "Record farrowing",
  searchPlaceholder: "Search sow tag, farm, birth type or remarks…",
  supportsTabs: true,
  fields: [
    { key: "bornAlive", label: "Born Alive", type: "number", required: true, placeholder: "8", badge: "success" },
    { key: "bornDead", label: "Born Dead", type: "number", placeholder: "0", badge: "danger" },
    {
      key: "birthType",
      label: "Birth Type",
      type: "select",
      staticOptions: [
        { value: "Normal", label: "Normal" },
        { value: "Assisted", label: "Assisted" },
        { value: "Induced", label: "Induced" },
      ],
    },
    { key: "birthProblem", label: "Birth Problem", type: "text", placeholder: "None / Prolonged labour" },
    { key: "labourStartedOn", label: "Labour Started On", type: "date" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Farrowing litter notes" },
  ],
};
