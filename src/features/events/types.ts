import { eventTypes } from "./event-types";

export const eventResources = eventTypes.map((et) => et.slug) as readonly string[];
export type EventResource = (typeof eventTypes)[number]["slug"];

export type EventRecordItem = {
  id: number;
  farmUuid?: string | null;
  farmName?: string | null;
  farmerName?: string | null;
  subjectUuid?: string | null;
  subjectIdentifier?: string | null;
  subjectLabel?: string | null;
  speciesName?: string | null;
  eventCode?: string | null;
  eventName?: string | null;
  behaviorCode?: string | null;
  familyCode?: string | null;
  occurredAt?: string | null;
  recordStatus?: string | null;
  revision?: number;
  payloadSummary?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

export type EventOption = {
  value: string;
  label: string;
  description?: string | null;
  farmUuid?: string | null;
};

export type EventOptions = {
  farms?: EventOption[];
  subjects?: EventOption[];
  livestock?: EventOption[];
  eventCodes?: EventOption[];
  [key: string]: EventOption[] | undefined;
};

export type EventResponse = {
  items: EventRecordItem[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
    deletedCount?: number;
  };
  summary: {
    total: number;
    active: number;
    secondary: number;
    tertiary: number;
  };
  options: EventOptions;
};

export type EventFieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "select";

export type EventFormField = {
  name: string;
  label: string;
  type: EventFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  optionsKey?: keyof EventOptions;
  staticOptions?: EventOption[];
  /** When set, this select stays disabled until the named parent field has a value. */
  dependsOn?: string;
  /** Client-side filter: keep options whose farmUuid matches the named form field. */
  filterByFarmField?: string;
};

export type EventFormSection = {
  title: string;
  description: string;
  fields: EventFormField[];
};

export type EventTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  badge?: "success" | "danger" | "info" | "warning" | "default";
  unit?: string;
};
