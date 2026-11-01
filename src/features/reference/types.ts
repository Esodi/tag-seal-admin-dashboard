export const referenceResources = [
  "vaccines",
  "vaccine-types",
  "medicine-types",
  "marking-types",
  "tail-docking-methods",
  "teeth-clipping-methods",
  "id-card-types",
  "school-levels",
  "legal-statuses",
] as const;

export type ReferenceResource = (typeof referenceResources)[number];

export type ReferenceRecord = {
  id: number;
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

export type ReferenceStat = {
  label: string;
  value: number;
  note: string;
};

export type ReferenceMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
  stats: ReferenceStat[];
};

export type ReferenceResponse = {
  status: boolean;
  message?: string;
  data: ReferenceRecord[];
  meta: ReferenceMeta;
};

export type ReferenceOption = {
  value: string;
  label: string;
  description?: string | null;
};

export type ReferenceOptions = Record<string, ReferenceOption[]>;

export type ReferenceOptionsResponse = {
  status: boolean;
  message?: string;
  data: ReferenceOptions;
};

export type ReferenceFieldType = "text" | "select";

export type ReferenceFormField = {
  name: string;
  label: string;
  type?: ReferenceFieldType;
  required?: boolean;
  full?: boolean;
  helper?: string;
  placeholder?: string;
  optionsKey?: string;
  options?: ReferenceOption[];
  defaultValue?: string;
};

export type ReferenceFormSection = {
  title: string;
  description: string;
  fields: ReferenceFormField[];
};

export type ReferenceColumnType =
  | "text"
  | "badge"
  | "count"
  | "date"
  | "status";

export type ReferenceTableColumn = {
  key: string;
  label: string;
  type?: ReferenceColumnType;
  primary?: boolean;
  secondaryKey?: string;
};

export type ReferenceResourceConfig = {
  resource: ReferenceResource;
  title: string;
  singular: string;
  description: string;
  createLabel: string;
  searchPlaceholder: string;
  statusOptions?: ReferenceOption[];
  columns: ReferenceTableColumn[];
  sections: ReferenceFormSection[];
};
