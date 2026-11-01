export const peopleResources = [
  "farms",
  "farmers",
  "extension-officers",
  "farm-users",
  "farm-invites",
  "system-user-profiles",
] as const;

export type PeopleResource = (typeof peopleResources)[number];

export type PeopleRecord = {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

export type PeopleStat = { label: string; value: number; note: string };
export type PeopleMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
  deletedCount?: number;
  stats: PeopleStat[];
};
export type PeopleResponse = { status: boolean; data: PeopleRecord[]; meta: PeopleMeta };

export type PeopleOption = {
  value: string;
  label: string;
  description?: string | null;
  parent?: string;
};
export type PeopleOptions = Record<string, PeopleOption[]>;
export type PeopleOptionsResponse = { status: boolean; data: PeopleOptions };

export type FieldType = "text" | "email" | "tel" | "password" | "number" | "date" | "select" | "checkbox" | "textarea";
export type FormField = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  requiredOnCreate?: boolean;
  full?: boolean;
  helper?: string;
  placeholder?: string;
  optionsKey?: string;
  options?: PeopleOption[];
  parentField?: string;
  defaultValue?: string | number | boolean;
  step?: string;
};
export type FormSectionConfig = { title: string; description: string; fields: FormField[] };

export type ColumnType = "text" | "date" | "status" | "boolean";
export type TableColumn = { key: string; label: string; type?: ColumnType; primary?: boolean; secondaryKey?: string };

export type PeopleResourceConfig = {
  resource: PeopleResource;
  title: string;
  singular: string;
  description: string;
  createLabel: string;
  searchPlaceholder: string;
  deletable: boolean;
  softDeletable?: boolean;
  statusOptions?: PeopleOption[];
  columns: TableColumn[];
  sections: FormSectionConfig[];
};
