export type Localized = { en: string; sw?: string | null };

export type AppliesTo = "all" | "female" | "male";

export type FieldType =
  | "text"
  | "long_text"
  | "whole_number"
  | "decimal"
  | "measurement"
  | "date"
  | "date_time"
  | "yes_no"
  | "choice"
  | "multi_choice"
  | "photo"
  | "system";

export type CaptureMode = "manual" | "scale" | "manual_or_scale";

export type SetupField = {
  key?: string;
  label: Localized;
  type: FieldType;
  unit?: string | null;
  lookupCode?: string | null;
  required: boolean;
  capture?: CaptureMode | null;
  locked?: boolean;
};

export type SetupEvent = {
  uuid: string;
  code: string;
  name: Localized;
  standard: boolean;
  family: string | null;
  appliesTo: AppliesTo;
  fields: SetupField[];
};

export type StandardEvent = { code: string; name: Localized; family: string; appliesTo: AppliesTo };

export type AnimalTypeSummary = {
  id: number;
  name: string;
  configured: boolean;
  publishedVersion: number | null;
  publishedAt: string | null;
  hasDraft: boolean;
  live: boolean;
  eventsCount: number;
};

export type Workspace = {
  type: { id: number; name: string };
  species: { uuid: string; code: string; name: string };
  blueprint: { uuid: string; version: number; status: "draft" | "published" | "retired" };
  editable: boolean;
  published: { version: number; publishedAt: string | null } | null;
  live: boolean;
  events: SetupEvent[];
  standardEvents: StandardEvent[];
  lookups: Array<{ code: string; name: string }>;
};

export const FIELD_TYPES: Array<{ value: Exclude<FieldType, "system">; label: string }> = [
  { value: "text", label: "Text" },
  { value: "long_text", label: "Long text" },
  { value: "whole_number", label: "Whole number" },
  { value: "decimal", label: "Decimal number" },
  { value: "measurement", label: "Measurement (with unit)" },
  { value: "date", label: "Date" },
  { value: "date_time", label: "Date and time" },
  { value: "yes_no", label: "Yes / No" },
  { value: "choice", label: "Choice (one option)" },
  { value: "multi_choice", label: "Choice (several options)" },
  { value: "photo", label: "Photo" },
];

export const UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "l", label: "Litres (L)" },
  { value: "ml", label: "Millilitres (ml)" },
  { value: "cm", label: "Centimetres (cm)" },
  { value: "m", label: "Metres (m)" },
  { value: "celsius", label: "Degrees Celsius (°C)" },
  { value: "percent", label: "Percent (%)" },
  { value: "count", label: "Count" },
];

export const WEIGHT_UNITS = ["kg", "g"];

export const CAPTURE_MODES: Array<{ value: CaptureMode; label: string }> = [
  { value: "manual_or_scale", label: "Typed or weighing scale" },
  { value: "manual", label: "Typed only" },
  { value: "scale", label: "Weighing scale only" },
];

export const APPLIES_TO: Array<{ value: AppliesTo; label: string }> = [
  { value: "all", label: "All animals" },
  { value: "female", label: "Females only" },
  { value: "male", label: "Males only" },
];

export const typeLabel = (type: FieldType) => FIELD_TYPES.find((item) => item.value === type)?.label ?? "Built-in";
