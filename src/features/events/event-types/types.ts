export type EventTypeField = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  description?: string;
  unit?: string;
  badge?: "success" | "danger" | "info" | "warning" | "default";
  optionsKey?: "farms" | "subjects" | "livestock" | "eventCodes";
  staticOptions?: { value: string; label: string }[];
};

export type EventTypeDefinition = {
  slug: string;
  code: string | null;
  name: string;
  family: string;
  description: string;
  primaryAction: string;
  searchPlaceholder?: string;
  status?: "new" | "stable" | "migration";
  supportsTabs?: boolean;
  fields: EventTypeField[];
};
