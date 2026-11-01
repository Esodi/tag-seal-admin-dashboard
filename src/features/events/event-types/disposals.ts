import type { EventTypeDefinition } from "./types";

export const disposalsType: EventTypeDefinition = {
  slug: "disposals",
  code: "record_disposal",
  name: "Disposals",
  family: "movement",
  description: "Animal sales, culling, mortality and herd exit records.",
  primaryAction: "Record disposal",
  searchPlaceholder: "Search animal tag, farm, disposal type or buyer…",
  supportsTabs: true,
  fields: [
    {
      key: "disposalType",
      label: "Disposal Type",
      type: "select",
      required: true,
      staticOptions: [
        { value: "Sale", label: "Sale" },
        { value: "Culling", label: "Culling" },
        { value: "Death / Mortality", label: "Death / Mortality" },
        { value: "Slaughter", label: "Home Slaughter" },
        { value: "Gift / Dowry", label: "Gift / Dowry" },
      ],
      badge: "danger",
    },
    { key: "reason", label: "Reasons", type: "text", required: true, placeholder: "e.g. Market sale / Old age" },
    { key: "saleWeight", label: "Sale Weight", type: "number", unit: "kg", placeholder: "380" },
    { key: "salePrice", label: "Sale Price", type: "number", placeholder: "1250000" },
    { key: "buyerName", label: "Buyer", type: "text", placeholder: "Buyer name or market" },
    { key: "remarks", label: "Remarks", type: "textarea", placeholder: "Disposal remarks" },
  ],
};
