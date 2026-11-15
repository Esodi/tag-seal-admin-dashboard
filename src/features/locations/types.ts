export const locationResources = [
  "countries",
  "regions",
  "districts",
  "divisions",
  "wards",
  "villages",
  "streets",
] as const;

export type LocationResource = (typeof locationResources)[number];

export type LocationRecord = {
  id: number;
  name: string;
  displayName?: string;
  shortName?: string | null;
  countryId?: number | null;
  countryName?: string | null;
  countryShortName?: string | null;
  regionId?: number | null;
  regionName?: string | null;
  districtId?: number | null;
  districtName?: string | null;
  wardId?: number | null;
  wardName?: string | null;
  regionsCount?: number;
  districtsCount?: number;
  divisionsCount?: number;
  wardsCount?: number;
  villagesCount?: number;
  streetsCount?: number;
  farmersCount?: number;
  farmsCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

export type LocationStat = {
  label: string;
  value: number;
  note: string;
};

export type LocationMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
  stats: LocationStat[];
};

export type LocationResponse = {
  status: boolean;
  message?: string;
  data: LocationRecord[];
  meta: LocationMeta;
};

export type LocationOption = {
  value: string;
  label: string;
  description?: string | null;
  parent?: string;
};

export type LocationOptions = {
  countries?: LocationOption[];
  regions?: LocationOption[];
  districts?: LocationOption[];
  wards?: LocationOption[];
  parents?: LocationOption[];
  [key: string]: LocationOption[] | undefined;
};

export type LocationOptionsResponse = {
  status: boolean;
  message?: string;
  data: LocationOptions;
};

export type LocationFieldType = "text" | "select";

export type LocationFormField = {
  name: string;
  label: string;
  type?: LocationFieldType;
  required?: boolean;
  full?: boolean;
  helper?: string;
  placeholder?: string;
  optionsKey?: keyof LocationOptions;
  /** Filter options where option.parent === values[parentField]. */
  parentField?: string;
  /** When false, field is UI-only cascade helper and is not submitted. Default true. */
  persist?: boolean;
};

export type LocationColumnType = "text" | "badge" | "count" | "date";

export type LocationTableColumn = {
  key: string;
  label: string;
  type?: LocationColumnType;
  primary?: boolean;
  secondaryKey?: string;
};

export type LocationDetailField = {
  key: string;
  label: string;
  type?: LocationColumnType;
};

export type LocationResourceConfig = {
  resource: LocationResource;
  title: string;
  singular: string;
  description: string;
  createLabel: string;
  searchPlaceholder: string;
  parentFilterLabel?: string;
  columns: LocationTableColumn[];
  fields: LocationFormField[];
  detailFields: LocationDetailField[];
};

