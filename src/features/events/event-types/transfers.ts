import type { EventTypeDefinition } from "./types";

export const transfersType: EventTypeDefinition = {
  slug: "transfers",
  code: "record_transfer",
  name: "Transfers",
  family: "movement",
  description: "Inter-farm animal movements, destination farms, transfer prices and dates.",
  primaryAction: "Record transfer",
  searchPlaceholder: "Search animal tag, origin farm, destination or reason…",
  supportsTabs: true,
  fields: [
    {
      key: "toFarmUuid",
      label: "Destination Farm",
      type: "select",
      required: true,
      optionsKey: "farms",
      placeholder: "Select destination farm",
    },
    { key: "transferDate", label: "Transfer Date", type: "date", required: true },
    { key: "reason", label: "Reason", type: "text", required: true, placeholder: "e.g. Breeding stock sale" },
    { key: "price", label: "Price", type: "number", placeholder: "0" },
    { key: "transporterId", label: "Transporter", type: "text", placeholder: "Transporter name or permit ref" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Health clearance notes" },
  ],
};
