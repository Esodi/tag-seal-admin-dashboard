import type { EventTypeDefinition } from "./types";

export const calvingType: EventTypeDefinition = {
  slug: "calving",
  code: "record_calving",
  name: "Calving",
  family: "births",
  description: "Cattle birth events, calf survival counts, birth types and labour diagnostics.",
  primaryAction: "Record calving",
  searchPlaceholder: "Search dam tag, farm, birth type or problem…",
  supportsTabs: true,
  fields: [
    { key: "bornAlive", label: "Born Alive", type: "number", required: true, placeholder: "1", badge: "success" },
    { key: "bornDead", label: "Born Dead", type: "number", placeholder: "0", badge: "danger" },
    {
      key: "birthType",
      label: "Birth Type",
      type: "select",
      staticOptions: [
        { value: "Normal", label: "Normal" },
        { value: "Assisted", label: "Assisted" },
        { value: "Caesarean", label: "Caesarean" },
        { value: "Twin", label: "Twin" },
      ],
    },
    { key: "birthProblem", label: "Birth Problem", type: "text", placeholder: "None / Dystocia / Retained placenta" },
    { key: "reproductiveProblem", label: "Reproductive Problem", type: "text", placeholder: "Reproductive complication" },
    { key: "labourStartedOn", label: "Labour Started On", type: "date" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Calving observations" },
  ],
};
