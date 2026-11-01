import type { EventTypeDefinition } from "./types";

export const dryoffsType: EventTypeDefinition = {
  slug: "dryoffs",
  code: "record_dryoff",
  name: "Dry-offs",
  family: "breeding",
  description: "Lactation cessation dates, dry-off windows and udder preparation reasons.",
  primaryAction: "Record dry-off",
  searchPlaceholder: "Search cow tag, farm or dry-off reason…",
  supportsTabs: true,
  fields: [
    { key: "startDate", label: "Dry-off Start", type: "date", required: true },
    { key: "endDate", label: "Dry-off End", type: "date" },
    { key: "reason", label: "Reason", type: "text", required: true, placeholder: "e.g. Pre-calving rest" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Dry therapy notes" },
  ],
};
