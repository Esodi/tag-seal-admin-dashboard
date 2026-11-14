import type { BlueprintResource } from "./types";

export type BlueprintColumnConfig = {
  key: string;
  label: string;
  primary?: boolean;
  type?: "badge" | "status" | "date" | "count" | "code" | "text";
  secondaryKey?: string;
};

export type BlueprintResourceConfig = {
  resource: BlueprintResource;
  title: string;
  singular: string;
  description: string;
  badge: string;
  createLabel: string;
  searchPlaceholder: string;
  columns: BlueprintColumnConfig[];
};

export const blueprintResourceConfigs: Record<BlueprintResource, BlueprintResourceConfig> = {
  "animal-blueprints": {
    resource: "animal-blueprints",
    title: "Animal Blueprints",
    singular: "Animal Blueprint",
    description: "Versioned species blueprints defining identity rules, registration forms, operational events, and mobile manifest sync.",
    badge: "Control Plane",
    createLabel: "Create Blueprint",
    searchPlaceholder: "Search by blueprint code, species, or animal type...",
    columns: [
      { key: "species_name", label: "Species", primary: true, secondaryKey: "code" },
      { key: "code", label: "Blueprint Code", type: "code" },
      { key: "animal_type", label: "Mobile Type", type: "badge" },
      { key: "version", label: "Version", type: "badge" },
      { key: "events_count", label: "Events", type: "count" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Created At", type: "date" },
    ],
  },
  "event-definitions": {
    resource: "event-definitions",
    title: "Event Definitions",
    singular: "Event Definition",
    description: "Configurable business events bound to schemas, eligibility conditions, behavior projections, and subject lifecycles.",
    badge: "Workflows",
    createLabel: "Create Event",
    searchPlaceholder: "Search by event name, code, behavior, or blueprint...",
    columns: [
      { key: "name", label: "Event Name", primary: true, secondaryKey: "code" },
      { key: "code", label: "Event Code", type: "code" },
      { key: "blueprint_code", label: "Blueprint", type: "badge" },
      { key: "behavior_code", label: "Behaviour", type: "text" },
      { key: "family", label: "Family", type: "badge" },
      { key: "form_code", label: "Form Schema", type: "code" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Created At", type: "date" },
    ],
  },
  "form-definitions": {
    resource: "form-definitions",
    title: "Form Definitions",
    singular: "Form Definition",
    description: "Reusable dynamic form schemas for registration and field events with multi-language localizations.",
    badge: "Schema Builder",
    createLabel: "Build Form",
    searchPlaceholder: "Search by form code, purpose, or version...",
    columns: [
      { key: "code", label: "Form Code", primary: true },
      { key: "version", label: "Version", type: "badge" },
      { key: "purpose", label: "Purpose", type: "badge" },
      { key: "fields_count", label: "Sections", type: "count" },
      { key: "translations", label: "Languages", type: "text" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Created At", type: "date" },
    ],
  },
  "lookup-sets": {
    resource: "lookup-sets",
    title: "Event Field Options",
    singular: "Option List",
    description: "Approved answers farmers pick from when recording events, such as diseases, medicines, birth types and animal stages.",
    badge: "Options",
    createLabel: "Create Option List",
    searchPlaceholder: "Search by list name, code, or parent list...",
    columns: [
      { key: "name", label: "Option List", primary: true, secondaryKey: "code" },
      { key: "code", label: "Code", type: "code" },
      { key: "version", label: "Version", type: "badge" },
      { key: "parent_name", label: "Depends On", type: "text" },
      { key: "options_count", label: "Options", type: "count" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Created At", type: "date" },
    ],
  },
  "dynamic-species": {
    resource: "dynamic-species",
    title: "Dynamic Animal Species",
    singular: "Dynamic Species",
    description: "Species catalogue configured for blueprint-driven identification, reproduction models, and herd management.",
    badge: "Taxonomy",
    createLabel: "Add Species",
    searchPlaceholder: "Search by species name, code, or mobile type...",
    columns: [
      { key: "name", label: "Species Name", primary: true, secondaryKey: "code" },
      { key: "code", label: "Species Code", type: "code" },
      { key: "default_subject_mode", label: "Subject Mode", type: "badge" },
      { key: "group_display_name", label: "Group Label", type: "text" },
      { key: "mobile_type_name", label: "Mobile Type", type: "badge" },
      { key: "reproduction", label: "Reproduction", type: "badge" },
      { key: "status", label: "Status", type: "status" },
      { key: "created_at", label: "Created At", type: "date" },
    ],
  },
};

export const BEHAVIOR_FAMILIES = {
  health: { label: "Health & Veterinary", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200" },
  reproduction: { label: "Breeding & Reproduction", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
  production: { label: "Milk & Yield Production", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200" },
  inventory: { label: "Inventory & Growth", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200" },
  feeding: { label: "Nutrition & Feeding", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" },
  lifecycle: { label: "Lifecycle & Movement", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200" },
  other: { label: "General Husbandry", color: "text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200" },
};

export const MEASUREMENT_UNITS: Record<string, string> = {
  kg: "Kilogram (kg)",
  g: "Gram (g)",
  l: "Litre (L)",
  ml: "Millilitre (mL)",
  cm: "Centimetre (cm)",
  m: "Metre (m)",
  celsius: "Degrees Celsius (°C)",
  percent: "Percent (%)",
  count: "Count",
};

