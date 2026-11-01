export const blueprintResources = [
  "animal-blueprints",
  "event-definitions",
  "form-definitions",
  "lookup-sets",
  "dynamic-species",
] as const;

export type BlueprintResource = (typeof blueprintResources)[number];

export type DefinitionStatus = "draft" | "published" | "retired";

export type LocalizedText = string | { en?: string; sw?: string; [key: string]: string | undefined };

export type FormFieldSchema = {
  key: string;
  component: string;
  label?: LocalizedText;
  placeholder?: LocalizedText;
  helpText?: LocalizedText;
  required?: string;
  unit?: string;
  role?: string;
  lookup_code?: string;
  options?: Array<{ value: string; label: LocalizedText }>;
  visibility_rule?: Record<string, unknown> | null;
  items?: Array<{
    key?: string;
    component?: string;
    label?: LocalizedText;
    unit?: string;
  }>;
  [key: string]: unknown;
};

export type FormSectionSchema = {
  key: string;
  title: LocalizedText;
  description?: LocalizedText;
  fields: FormFieldSchema[];
};

export type FormSchema = {
  sections: FormSectionSchema[];
  [key: string]: unknown;
};

export type AnimalBlueprintRecord = {
  id: number;
  uuid: string;
  code: string;
  version: number;
  species_uuid: string;
  registration_form_uuid: string;
  registration_form_version?: number;
  status: DefinitionStatus;
  animal_type?: string;
  events_count?: number;
  species?: {
    id: number;
    uuid: string;
    name: string;
    code: string;
    legacy_livestock_type_id?: number | null;
    translations_json?: Record<string, string>;
  };
  registrationForm?: {
    id: number;
    uuid: string;
    code: string;
    version: number;
    schema_json?: FormSchema;
  };
  settings_json?: {
    catalogBinding?: {
      livestockTypeId?: number;
      speciesId?: number;
    };
    subjectModes?: string[];
    allowedSexCodes?: string[];
    reproductionMode?: string;
    locales?: string[];
    identificationPolicy?: {
      allowed?: string[];
      required?: string[];
      allowWithoutTag?: boolean;
    };
  };
  events?: EventDefinitionRecord[];
  created_at: string;
  updated_at?: string;
};

export type EventDefinitionRecord = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  blueprint_uuid: string;
  blueprint_version?: number;
  form_uuid: string;
  form_version?: number;
  behavior_code?: string;
  family?: string;
  sort_order?: number;
  status: DefinitionStatus;
  translations_json?: Record<string, string>;
  eligibility_rule_json?: Record<string, unknown>;
  repeatability_rule_json?: Record<string, unknown>;
  result_rule_json?: Record<string, unknown>;
  blueprint?: {
    id: number;
    uuid: string;
    code: string;
    version: number;
  };
  form?: {
    id: number;
    uuid: string;
    code: string;
    version: number;
    schema_json?: FormSchema;
  };
  created_at: string;
  updated_at?: string;
};

export type FormDefinitionRecord = {
  id: number;
  uuid: string;
  code: string;
  version: number;
  purpose: "registration" | "event";
  status: DefinitionStatus;
  schema_json: FormSchema;
  checksum?: string;
  fields_count?: number;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
};

export type LookupOptionRecord = {
  id: number;
  uuid: string;
  lookup_set_uuid: string;
  code: string;
  label: string;
  translations_json?: Record<string, string>;
  sort_order: number;
  status: "active" | "inactive";
};

export type LookupSetRecord = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  version: number;
  parent_lookup_set_uuid?: string | null;
  status: DefinitionStatus;
  options_count?: number;
  options?: LookupOptionRecord[];
  parent?: {
    id: number;
    uuid: string;
    name: string;
    code: string;
  } | null;
  created_at: string;
  updated_at?: string;
};

export type DynamicSpeciesRecord = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  default_subject_mode: "individual" | "group";
  group_display_name?: string | null;
  legacy_livestock_type_id?: number | null;
  mobile_type_name?: string | null;
  status: DefinitionStatus;
  capabilities_json?: {
    reproduction?: string;
    [key: string]: unknown;
  };
  translations_json?: Record<string, string>;
  created_at: string;
  updated_at?: string;
};

export type BlueprintRecord =
  | AnimalBlueprintRecord
  | EventDefinitionRecord
  | FormDefinitionRecord
  | LookupSetRecord
  | DynamicSpeciesRecord;

export type BlueprintResponse = {
  status: boolean;
  message?: string;
  data: BlueprintRecord[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type BlueprintOptionsResponse = {
  status: boolean;
  message?: string;
  data: {
    statuses: string[];
    species: Array<{ uuid: string; name: string; code: string }>;
    blueprints: Array<{ uuid: string; code: string; version: number; status: string }>;
    registration_forms: Array<{ uuid: string; code: string; version: number; status: string }>;
    event_forms: Array<{ uuid: string; code: string; version: number; status: string }>;
    livestock_types: Array<{ id: number; name: string }>;
    catalog_species: Array<{ id: number; name: string; livestockTypeId: number }>;
    identifier_types: Array<{ code: string; name: string }>;
    families: Record<string, string>;
    reproduction_models: Record<string, string>;
    subject_modes: Record<string, string>;
  };
};

export type BlueprintPreviewFlow = {
  blueprint: {
    uuid: string;
    code: string;
    version: number;
    status: string;
    species?: { name: string; code: string };
    subjectModes?: string[];
    allowedSexCodes?: string[];
    reproductionMode?: string;
    identificationPolicy?: {
      allowed?: string[];
      required?: string[];
      allowWithoutTag?: boolean;
    };
  };
  registrationForm?: {
    uuid: string;
    code: string;
    version: number;
    schema_json?: FormSchema;
  };
  events: EventDefinitionRecord[];
};

