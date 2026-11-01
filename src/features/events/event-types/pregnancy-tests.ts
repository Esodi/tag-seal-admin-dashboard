import type { EventTypeDefinition } from "./types";

export const pregnancyTestsType: EventTypeDefinition = {
  slug: "pregnancy-tests",
  code: "record_pregnancy_test",
  name: "Pregnancy Tests",
  family: "breeding",
  description: "Gestation diagnosis results, estimated months pregnant and examination dates.",
  primaryAction: "Record pregnancy test",
  searchPlaceholder: "Search animal tag, farm or test result…",
  supportsTabs: true,
  fields: [
    {
      key: "testResult",
      label: "Test Result",
      type: "select",
      required: true,
      staticOptions: [
        { value: "Positive", label: "Positive (Pregnant)" },
        { value: "Negative", label: "Negative (Open)" },
        { value: "Inconclusive", label: "Inconclusive / Recheck" },
      ],
      badge: "success",
    },
    { key: "noOfMonths", label: "Months Pregnant", type: "number", placeholder: "3" },
    { key: "testDate", label: "Test Date", type: "date", required: true },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Palpation notes" },
  ],
};
