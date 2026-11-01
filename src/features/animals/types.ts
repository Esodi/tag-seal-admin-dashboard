export const animalResources = [
  "animals",
  "legacy-livestock",
  "animal-types",
  "species",
  "breeds",
  "acquisition-methods",
] as const;

export type AnimalResource = (typeof animalResources)[number];

export type AnimalRecord = {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  [key: string]: unknown;
};

export type AnimalStat = {
  label: string;
  value: number;
  note: string;
};

export type AnimalMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
  deletedCount?: number;
  stats: AnimalStat[];
};

export type AnimalResponse = {
  status: boolean;
  message?: string;
  data: AnimalRecord[];
  meta: AnimalMeta;
};

export type AnimalOption = {
  value: string;
  label: string;
  description?: string | null;
  parent?: string | null;
};

export type AnimalOptions = Record<string, AnimalOption[]>;

export type AnimalOptionsResponse = {
  status: boolean;
  message?: string;
  data: AnimalOptions;
};

export type AnimalFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "checkbox";

export type AnimalFormField = {
  name: string;
  label: string;
  type?: AnimalFieldType;
  required?: boolean;
  full?: boolean;
  helper?: string;
  placeholder?: string;
  optionsKey?: string;
  options?: AnimalOption[];
  parentField?: string;
  defaultValue?: string | number | boolean;
  step?: string;
};

export type AnimalFormSection = {
  title: string;
  description: string;
  fields: AnimalFormField[];
};

export type AnimalColumnType =
  | "text"
  | "badge"
  | "count"
  | "date"
  | "status"
  | "boolean"
  | "color";

export type AnimalTableColumn = {
  key: string;
  label: string;
  type?: AnimalColumnType;
  primary?: boolean;
  secondaryKey?: string;
};

export type AnimalResourceConfig = {
  resource: AnimalResource;
  title: string;
  singular: string;
  description: string;
  createLabel: string;
  searchPlaceholder: string;
  softDeletable?: boolean;
  statusOptions?: AnimalOption[];
  columns: AnimalTableColumn[];
  sections: AnimalFormSection[];
};

