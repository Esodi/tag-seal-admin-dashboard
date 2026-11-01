import type { EventTypeDefinition } from "./types";

export const abortedPregnanciesType: EventTypeDefinition = {
  slug: "aborted-pregnancies",
  code: "record_abortion",
  name: "Aborted Pregnancies",
  family: "births",
  description: "Reproductive loss records, abortion dates, clinical causes and diagnostic notes.",
  primaryAction: "Record abortion",
  searchPlaceholder: "Search animal tag, farm or reproductive problem…",
  supportsTabs: true,
  fields: [
    { key: "abortionDate", label: "Abortion Date", type: "date", required: true },
    { key: "reproductiveProblem", label: "Reproductive Problem", type: "text", required: true, placeholder: "e.g. Brucellosis / Trauma / Heat stress" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Clinical loss observations" },
  ],
};
