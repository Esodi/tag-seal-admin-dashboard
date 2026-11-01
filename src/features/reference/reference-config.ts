import type {
  ReferenceOption,
  ReferenceResource,
  ReferenceResourceConfig,
} from "@/features/reference/types";

export const REFERENCE_RESOLVED_NAME_FIELD_MAP: Record<string, string> = {
  farmUuid: "farmName",
  vaccineTypeId: "vaccineTypeName",
};

const formulationOptions: ReferenceOption[] = [
  { value: "live-attenuated", label: "Live Attenuated" },
  { value: "inactivated", label: "Inactivated" },
];

const vaccineStatusOptions: ReferenceOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

const vaccineScheduleOptions: ReferenceOption[] = [
  { value: "regular", label: "Regular Schedule" },
  { value: "booster", label: "Booster" },
  { value: "seasonal", label: "Seasonal" },
  { value: "emergency", label: "Emergency" },
];

export const referenceResourceConfigs: Record<
  ReferenceResource,
  ReferenceResourceConfig
> = {
  vaccines: {
    resource: "vaccines",
    title: "Vaccines",
    singular: "vaccine",
    description:
      "Vaccine products, farm inventory lots, formulation types, dosing and schedules.",
    createLabel: "Add vaccine",
    searchPlaceholder: "Search by vaccine name, lot, farm or type...",
    statusOptions: vaccineStatusOptions,
    columns: [
      { key: "name", label: "Vaccine Name", primary: true },
      { key: "farmName", label: "Farm" },
      { key: "lot", label: "Lot", type: "badge" },
      { key: "formulationLabel", label: "Formulation", type: "badge" },
      { key: "dose", label: "Dose" },
      { key: "status", label: "Status", type: "status" },
      { key: "vaccineTypeName", label: "Type" },
      { key: "scheduleLabel", label: "Schedule" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Vaccine & Farm Assignment",
        description: "Vaccine product name, lot number, farm and vaccine type.",
        fields: [
          {
            name: "name",
            label: "Vaccine Name",
            required: true,
            placeholder: "FMD Trivalent Vaccine",
          },
          {
            name: "lot",
            label: "Lot Number",
            required: true,
            placeholder: "LOT-2026-084",
          },
          {
            name: "farmUuid",
            label: "Farm",
            type: "select",
            optionsKey: "farms",
            required: true,
          },
          {
            name: "vaccineTypeId",
            label: "Vaccine Type",
            type: "select",
            optionsKey: "vaccineTypes",
            required: true,
          },
        ],
      },
      {
        title: "Formulation, Dose & Schedule",
        description: "Formulation type, dosage, schedule and lot status.",
        fields: [
          {
            name: "formulationType",
            label: "Formulation Type",
            type: "select",
            options: formulationOptions,
            required: true,
          },
          {
            name: "dose",
            label: "Dose",
            placeholder: "2 ml SC",
          },
          {
            name: "vaccineSchedule",
            label: "Vaccine Schedule",
            type: "select",
            options: vaccineScheduleOptions,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: vaccineStatusOptions,
            defaultValue: "active",
            required: true,
          },
        ],
      },
    ],
  },
  "vaccine-types": {
    resource: "vaccine-types",
    title: "Vaccine Types",
    singular: "vaccine type",
    description:
      "Classification of vaccine products referenced across vaccination events.",
    createLabel: "Add type",
    searchPlaceholder: "Search by vaccine type name...",
    columns: [
      { key: "name", label: "Type Name", primary: true },
      { key: "vaccinesCount", label: "Vaccines", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Vaccine Type Details",
        description: "Define the vaccine type classification name.",
        fields: [
          {
            name: "name",
            label: "Vaccine Type Name",
            required: true,
            full: true,
            placeholder: "Viral Vaccine",
          },
        ],
      },
    ],
  },
  "medicine-types": {
    resource: "medicine-types",
    title: "Medicine Types",
    singular: "medicine type",
    description:
      "Classification of veterinary treatments and medicines.",
    createLabel: "Add type",
    searchPlaceholder: "Search by medicine type name...",
    columns: [
      { key: "name", label: "Medicine Type Name", primary: true },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Medicine Type Details",
        description: "Define the medicine type classification name.",
        fields: [
          {
            name: "name",
            label: "Medicine Type Name",
            required: true,
            full: true,
            placeholder: "Antibiotic",
          },
        ],
      },
    ],
  },
  "marking-types": {
    resource: "marking-types",
    title: "Marking Types",
    singular: "marking type",
    description:
      "Supported livestock marking and physical identification methods.",
    createLabel: "Add method",
    searchPlaceholder: "Search by marking type name...",
    columns: [
      { key: "name", label: "Type Name", primary: true },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Marking Type Details",
        description: "Define the livestock marking method name.",
        fields: [
          {
            name: "name",
            label: "Type Name",
            required: true,
            full: true,
            placeholder: "Ear Notching",
          },
        ],
      },
    ],
  },
  "tail-docking-methods": {
    resource: "tail-docking-methods",
    title: "Tail Docking Methods",
    singular: "tail docking method",
    description:
      "Approved tail docking methods used in husbandry logs.",
    createLabel: "Add method",
    searchPlaceholder: "Search by tail docking method name...",
    columns: [
      { key: "name", label: "Method Name", primary: true },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Tail Docking Method Details",
        description: "Define the approved tail docking method name.",
        fields: [
          {
            name: "name",
            label: "Method Name",
            required: true,
            full: true,
            placeholder: "Rubber Ring Elastrator",
          },
        ],
      },
    ],
  },
  "teeth-clipping-methods": {
    resource: "teeth-clipping-methods",
    title: "Teeth Clipping Methods",
    singular: "teeth clipping method",
    description:
      "Approved teeth clipping methods used in husbandry logs.",
    createLabel: "Add method",
    searchPlaceholder: "Search by teeth clipping method name...",
    columns: [
      { key: "name", label: "Method Name", primary: true },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Teeth Clipping Method Details",
        description: "Define the approved teeth clipping method name.",
        fields: [
          {
            name: "name",
            label: "Method Name",
            required: true,
            full: true,
            placeholder: "Grinding / Filing",
          },
        ],
      },
    ],
  },
  "id-card-types": {
    resource: "id-card-types",
    title: "ID Card Types",
    singular: "ID card type",
    description:
      "Supported personal identification documents for farmers and officers.",
    createLabel: "Add ID type",
    searchPlaceholder: "Search by ID card type...",
    columns: [
      { key: "name", label: "ID Card Type", primary: true },
      { key: "farmersCount", label: "Farmers", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "ID Card Type Details",
        description: "Define the accepted identification document type.",
        fields: [
          {
            name: "name",
            label: "ID Card Type",
            required: true,
            full: true,
            placeholder: "National ID (NIDA)",
          },
        ],
      },
    ],
  },
  "school-levels": {
    resource: "school-levels",
    title: "School Levels",
    singular: "school level",
    description:
      "Education levels used in farmer and veterinary profiles.",
    createLabel: "Add level",
    searchPlaceholder: "Search by education level...",
    columns: [
      { key: "name", label: "Education Level", primary: true },
      { key: "farmersCount", label: "Farmers", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "School Level Details",
        description: "Define the education level name.",
        fields: [
          {
            name: "name",
            label: "Education Level",
            required: true,
            full: true,
            placeholder: "Secondary Education",
          },
        ],
      },
    ],
  },
  "legal-statuses": {
    resource: "legal-statuses",
    title: "Legal Statuses",
    singular: "legal status",
    description:
      "Legal ownership structures used for farms and agricultural organizations.",
    createLabel: "Add legal status",
    searchPlaceholder: "Search by legal status name...",
    columns: [
      { key: "name", label: "Legal Status Name", primary: true },
      { key: "farmsCount", label: "Farms", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Legal Status Details",
        description: "Define the legal structure name.",
        fields: [
          {
            name: "name",
            label: "Legal Status Name",
            required: true,
            full: true,
            placeholder: "Sole Proprietorship",
          },
        ],
      },
    ],
  },
};

export function getReferenceResourceConfig(
  resource: ReferenceResource,
): ReferenceResourceConfig {
  return referenceResourceConfigs[resource];
}
