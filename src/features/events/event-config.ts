import { withCreatedColumn } from "@/lib/resource-table";
import {
  eventTypes,
  getEventType,
  type EventTypeDefinition,
} from "@/features/events/event-types";
import type {
  EventFormField,
  EventFormSection,
  EventResource,
  EventTableColumn,
} from "@/features/events/types";

export const EVENT_RESOLVED_NAME_FIELD_MAP: Record<string, string> = {
  farmUuid: "farmName",
  subjectUuid: "subjectLabel",
  livestockUuid: "livestockLabel",
  toFarmUuid: "destinationFarmName",
};

export type EventResourceConfig = {
  resource: EventResource;
  title: string;
  singularLabel: string;
  description: string;
  primaryAction: string;
  searchPlaceholder: string;
  supportsTabs: boolean;
  stats: {
    totalLabel: string;
    totalNote: string;
    activeLabel: string;
    activeNote: string;
    secondaryLabel: string;
    secondaryNote: string;
    tertiaryLabel: string;
    tertiaryNote: string;
  };
  columns: EventTableColumn[];
  formSections: EventFormSection[];
};

const commonSubjectFields: EventFormField[] = [
  {
    name: "farmUuid",
    label: "Farm",
    type: "select",
    required: true,
    optionsKey: "farms",
    placeholder: "Select farm",
  },
  {
    name: "subjectUuid",
    label: "Animal / Group",
    type: "select",
    required: true,
    optionsKey: "subjects",
    placeholder: "Select animal or group",
  },
  {
    name: "occurredAt",
    label: "Date Recorded",
    type: "date",
    required: true,
  },
  {
    name: "recordStatus",
    label: "Record Status",
    type: "select",
    staticOptions: [
      { value: "confirmed", label: "Confirmed" },
      { value: "submitted", label: "Submitted" },
    ],
  },
];

export function buildDynamicEventConfig(
  eventType: EventTypeDefinition,
): EventResourceConfig {
  const isAllEvents = eventType.slug === "all-events";
  const isIdentification = eventType.slug === "identification-events";

  const columns: EventTableColumn[] = isAllEvents
    ? [
        { key: "subject", label: "Animal / Group" },
        { key: "farm", label: "Farm" },
        { key: "eventName", label: "Event Name" },
        { key: "species", label: "Species" },
        { key: "family", label: "Family" },
        { key: "payloadSummary", label: "Recorded Values" },
        { key: "occurredAt", label: "Date Recorded" },
        { key: "status", label: "Status" },
      ]
    : isIdentification
      ? [
          { key: "farm", label: "Farm" },
          { key: "livestockLabel", label: "Livestock Tag" },
          { key: "identificationNumber", label: "Identification Number" },
          { key: "eventDate", label: "Event Date" },
          { key: "remarks", label: "Remarks" },
          { key: "createdAt", label: "Created At" },
        ]
      : [
          { key: "subject", label: "Animal / Group" },
          { key: "farm", label: "Farm" },
          ...eventType.fields.map((f) => ({
            key: f.key,
            label: f.label,
            unit: f.unit,
            badge: f.badge,
          })),
          { key: "occurredAt", label: "Date Recorded" },
          { key: "status", label: "Status" },
        ];

  const formSections: EventFormSection[] = isIdentification
    ? [
        {
          title: "Identification Event Details",
          description: "Select the farm, livestock record and identification number.",
          fields: eventType.fields.map((f) => ({
            name: f.key,
            label: f.label,
            type: f.type,
            required: f.required,
            placeholder: f.placeholder,
            description: f.description,
            optionsKey: f.optionsKey,
            staticOptions: f.staticOptions,
          })),
        },
      ]
    : isAllEvents
      ? [
          {
            title: "Event & Subject Context",
            description: "Select the event type, farm and animal subject.",
            fields: [
              eventType.fields[0]
                ? {
                    name: eventType.fields[0].key,
                    label: eventType.fields[0].label,
                    type: eventType.fields[0].type,
                    required: eventType.fields[0].required,
                    optionsKey: eventType.fields[0].optionsKey,
                    placeholder: eventType.fields[0].placeholder,
                  }
                : commonSubjectFields[0],
              ...commonSubjectFields,
            ],
          },
          {
            title: "Event Notes & Summary",
            description: "Provide clinical or operational notes for this event.",
            fields: eventType.fields.slice(1).map((f) => ({
              name: f.key,
              label: f.label,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder,
              description: f.description,
            })),
          },
        ]
      : [
          {
            title: "Subject & Farm Context",
            description: "Select the farm, animal subject and event occurrence timestamp.",
            fields: commonSubjectFields,
          },
          {
            title: `${eventType.name} Details`,
            description: `Record payload values for ${eventType.name.toLowerCase()}.`,
            fields: eventType.fields.map((f) => ({
              name: f.key,
              label: f.label,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder,
              description: f.description,
              optionsKey: f.optionsKey,
              staticOptions: f.staticOptions,
            })),
          },
        ];

  return {
    resource: eventType.slug as EventResource,
    title: eventType.name,
    singularLabel: isIdentification
      ? "Identification Event"
      : isAllEvents
        ? "Event Record"
        : `${eventType.name} Event`,
    description: eventType.description,
    primaryAction: eventType.primaryAction,
    searchPlaceholder:
      eventType.searchPlaceholder ?? `Search ${eventType.name.toLowerCase()}…`,
    supportsTabs: eventType.supportsTabs ?? true,
    stats: {
      totalLabel: `Total ${eventType.name}`,
      totalNote: `Active ${eventType.name.toLowerCase()} records`,
      activeLabel: "Confirmed",
      activeNote: "Verified ledger entries",
      secondaryLabel: "Last 30 Days",
      secondaryNote: "Recent field activity",
      tertiaryLabel: isIdentification ? "Farms Covered" : "Archived",
      tertiaryNote: isIdentification
        ? "Farms with identification events"
        : "Voided records",
    },
    columns: withCreatedColumn(columns, { key: "createdAt", label: "Created at" }),
    formSections,
  };
}

export function getEventResourceConfig(resource: EventResource): EventResourceConfig {
  const eventType = getEventType(resource) ?? eventTypes[0];
  return buildDynamicEventConfig(eventType);
}
