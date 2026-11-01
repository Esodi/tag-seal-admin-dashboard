import type { EventTypeDefinition } from "./types";

export const tailDockingsType: EventTypeDefinition = {
  slug: "tail-dockings",
  code: "record_tail_docking",
  name: "Tail Dockings",
  family: "growth",
  description: "Tail docking procedures, methods used and clinical observations.",
  primaryAction: "Record tail docking",
  searchPlaceholder: "Search animal tag, farm or docking method…",
  supportsTabs: true,
  fields: [
    { key: "method", label: "Method", type: "text", required: true, placeholder: "e.g. Cauterizing Docker / Elastrator" },
    { key: "remarks", label: "Notes", type: "textarea", placeholder: "Procedure notes" },
  ],
};
