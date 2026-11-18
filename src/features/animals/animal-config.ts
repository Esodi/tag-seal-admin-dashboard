import { withCreatedColumn } from "@/lib/resource-table";
import type {
  AnimalOption,
  AnimalResource,
  AnimalResourceConfig,
} from "@/features/animals/types";

export const ANIMAL_RESOLVED_NAME_FIELD_MAP: Record<string, string> = {
  farm_uuid: "farmName",
  species_uuid: "speciesName",
  farmUuid: "farmName",
  livestockTypeId: "livestockTypeName",
  speciesId: "speciesName",
  breedId: "breedName",
  stageId: "stageName",
  livestockObtainedMethodId: "obtainedMethodName",
  motherUuid: "motherName",
  fatherUuid: "fatherName",
};

const genderOptions: AnimalOption[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const sexCodeOptions: AnimalOption[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unknown", label: "Unknown" },
];

const unitTypeOptions: AnimalOption[] = [
  { value: "individual", label: "Individual" },
  { value: "group", label: "Group" },
];

const livestockStatusOptions: AnimalOption[] = [
  { value: "active", label: "Active" },
  { value: "notActive", label: "Not active" },
];

const colorOptions: AnimalOption[] = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "brown", label: "Brown" },
  { value: "red", label: "Red" },
  { value: "gray", label: "Gray" },
];

export const animalResourceConfigs: Record<
  AnimalResource,
  AnimalResourceConfig
> = {
  animals: {
    resource: "animals",
    title: "Animals",
    singular: "animal",
    description:
      "Dynamic animal subjects, groups, RFID/visual identifiers and lifecycle state.",
    createLabel: "Register animal",
    searchPlaceholder: "Search by animal name, tag, species or farm...",
    softDeletable: true,
    statusOptions: livestockStatusOptions,
    columns: [
      {
        key: "display_name",
        label: "Animal / Group",
        primary: true,
        secondaryKey: "unitTypeLabel",
      },
      { key: "identifiersText", label: "RFID & Tags", type: "badge" },
      { key: "speciesName", label: "Species" },
      { key: "farmName", label: "Farm" },
      { key: "sex_code", label: "Sex" },
      { key: "birth_or_start_date", label: "Birth Date", type: "date" },
      { key: "current_stage_code", label: "Stage" },
      { key: "lifecycle_status", label: "Status", type: "status" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Subject Identity",
        description: "Animal or group name, tag and farm/species assignment.",
        fields: [
          {
            name: "display_name",
            label: "Animal / Group Name",
            required: true,
            placeholder: "Malkia #104",
          },
          {
            name: "primary_tag",
            label: "Primary RFID / Tag",
            placeholder: "TZ-RFID-00104",
          },
          {
            name: "farm_uuid",
            label: "Farm",
            type: "select",
            optionsKey: "farms",
            required: true,
          },
          {
            name: "species_uuid",
            label: "Species",
            type: "select",
            optionsKey: "dynamicSpecies",
            required: true,
          },
        ],
      },
      {
        title: "Profile & Lifecycle",
        description: "Mode, sex, birth date, quantity and current stage.",
        fields: [
          {
            name: "unit_type",
            label: "Mode",
            type: "select",
            options: unitTypeOptions,
            defaultValue: "individual",
            required: true,
          },
          {
            name: "sex_code",
            label: "Sex",
            type: "select",
            options: sexCodeOptions,
            defaultValue: "female",
          },
          {
            name: "birth_or_start_date",
            label: "Birth Date",
            type: "date",
          },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            defaultValue: 1,
          },
          {
            name: "current_stage_code",
            label: "Stage",
            placeholder: "lactating",
          },
          {
            name: "lifecycle_status",
            label: "Status",
            type: "select",
            options: livestockStatusOptions,
            defaultValue: "active",
            required: true,
          },
        ],
      },
    ],
  },
  "legacy-livestock": {
    resource: "legacy-livestock",
    title: "Livestocks",
    singular: "livestock",
    description:
      "Registered livestock records, identification tags, classification, parentage and acquisition details.",
    createLabel: "Add livestock",
    searchPlaceholder:
      "Search by livestock name, ID number, tag, farm, species or breed...",
    softDeletable: true,
    statusOptions: livestockStatusOptions,
    columns: [
      {
        key: "name",
        label: "Livestock Name",
        primary: true,
        secondaryKey: "identificationNumber",
      },
      { key: "identificationNumber", label: "ID Number", type: "badge" },
      { key: "farmName", label: "Farm" },
      { key: "speciesName", label: "Species" },
      { key: "breedName", label: "Breed" },
      { key: "livestockTypeName", label: "Type" },
      { key: "gender", label: "Gender" },
      { key: "dateOfBirth", label: "DOB", type: "date" },
      { key: "weightAsOnRegistration", label: "Weight (kg)" },
      { key: "stageName", label: "Stage" },
      { key: "isIdentified", label: "Identified", type: "boolean" },
      { key: "primaryColor", label: "Primary Color", type: "color" },
      { key: "status", label: "Status", type: "status" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Identification & Farm",
        description: "Core livestock name, farm and tag identifiers.",
        fields: [
          {
            name: "name",
            label: "Livestock Name",
            required: true,
            placeholder: "Subira",
          },
          {
            name: "farmUuid",
            label: "Farm",
            type: "select",
            optionsKey: "farms",
            required: true,
          },
          {
            name: "identificationNumber",
            label: "ID Number",
            placeholder: "TZS-2026-0041",
          },
          {
            name: "rfidTagId",
            label: "RFID Tag ID",
            placeholder: "982000410092",
          },
          {
            name: "barcodeTagId",
            label: "Barcode Tag ID",
          },
          {
            name: "dummyTagId",
            label: "Dummy Tag ID",
          },
          {
            name: "isIdentified",
            label: "Official Identification Assigned",
            type: "checkbox",
            defaultValue: true,
            full: true,
            helper: "Enable when the animal has an official tag or ID number.",
          },
        ],
      },
      {
        title: "Classification & Colors",
        description: "Livestock type, species, breed, stage, gender and coat colors.",
        fields: [
          {
            name: "livestockTypeId",
            label: "Livestock Type",
            type: "select",
            optionsKey: "livestockTypes",
            required: true,
          },
          {
            name: "speciesId",
            label: "Species",
            type: "select",
            optionsKey: "species",
            parentField: "livestockTypeId",
            required: true,
          },
          {
            name: "breedId",
            label: "Breed",
            type: "select",
            optionsKey: "breeds",
            parentField: "livestockTypeId",
            required: true,
          },
          {
            name: "stageId",
            label: "Stage",
            type: "select",
            optionsKey: "stages",
            parentField: "livestockTypeId",
          },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            options: genderOptions,
            defaultValue: "female",
            required: true,
          },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            required: true,
          },
          {
            name: "primaryColor",
            label: "Primary Color",
            type: "select",
            options: colorOptions,
          },
          {
            name: "secondaryColor",
            label: "Secondary Color",
            type: "select",
            options: colorOptions,
          },
        ],
      },
      {
        title: "Parentage & Acquisition",
        description: "Mother, father, acquisition method and registration weight.",
        fields: [
          {
            name: "motherUuid",
            label: "Mother",
            type: "select",
            optionsKey: "mothers",
          },
          {
            name: "fatherUuid",
            label: "Father",
            type: "select",
            optionsKey: "fathers",
          },
          {
            name: "livestockObtainedMethodId",
            label: "Obtained Method",
            type: "select",
            optionsKey: "obtainedMethods",
          },
          {
            name: "dateFirstEnteredToFarm",
            label: "Date First Entered Farm",
            type: "date",
          },
          {
            name: "weightAsOnRegistration",
            label: "Weight (kg)",
            type: "number",
            step: "0.01",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: livestockStatusOptions,
            defaultValue: "active",
            required: true,
          },
        ],
      },
    ],
  },
  "animal-types": {
    resource: "animal-types",
    title: "Animal Types",
    singular: "animal type",
    description:
      "High-level livestock usage classifications (e.g. Cattle, Goat, Sheep, Poultry, Swine).",
    createLabel: "Add type",
    searchPlaceholder: "Search by animal type name...",
    columns: [
      { key: "name", label: "Type Name", primary: true },
      { key: "speciesCount", label: "Species", type: "count" },
      { key: "breedsCount", label: "Breeds", type: "count" },
      { key: "livestocksCount", label: "Livestock", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Animal Type Details",
        description: "Define the livestock type classification name.",
        fields: [
          {
            name: "name",
            label: "Type Name",
            required: true,
            full: true,
            placeholder: "Cattle",
          },
        ],
      },
    ],
  },
  species: {
    resource: "species",
    title: "Species",
    singular: "species",
    description:
      "Legacy species catalogue and livestock type mappings.",
    createLabel: "Add species",
    searchPlaceholder: "Search by species name or livestock type...",
    columns: [
      { key: "name", label: "Species Name", primary: true },
      { key: "livestockTypeName", label: "Livestock Type" },
      { key: "livestocksCount", label: "Livestock", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Species Details",
        description: "Species name and linked livestock type.",
        fields: [
          {
            name: "name",
            label: "Species Name",
            required: true,
            full: true,
            placeholder: "Bos taurus",
          },
          {
            name: "livestockTypeId",
            label: "Livestock Type",
            type: "select",
            optionsKey: "livestockTypes",
            required: true,
            full: true,
          },
        ],
      },
    ],
  },
  breeds: {
    resource: "breeds",
    title: "Breeds",
    singular: "breed",
    description:
      "Breed catalogue, breed groups and livestock type associations.",
    createLabel: "Add breed",
    searchPlaceholder: "Search by breed name, group or livestock type...",
    columns: [
      { key: "name", label: "Breed Name", primary: true },
      { key: "group", label: "Breed Group" },
      { key: "livestockTypeName", label: "Livestock Type" },
      { key: "livestocksCount", label: "Livestock", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Breed Details",
        description: "Breed name, group and linked livestock type.",
        fields: [
          {
            name: "name",
            label: "Breed Name",
            required: true,
            placeholder: "Friesian",
          },
          {
            name: "group",
            label: "Breed Group",
            required: true,
            placeholder: "Dairy",
          },
          {
            name: "livestockTypeId",
            label: "Livestock Type",
            type: "select",
            optionsKey: "livestockTypes",
            required: true,
            full: true,
          },
        ],
      },
    ],
  },
  "acquisition-methods": {
    resource: "acquisition-methods",
    title: "Acquisition Methods",
    singular: "acquisition method",
    description:
      "Approved ways animals and livestock enter a farm or herd.",
    createLabel: "Add method",
    searchPlaceholder: "Search by method name...",
    columns: [
      { key: "name", label: "Method Name", primary: true },
      { key: "livestocksCount", label: "Livestock", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Acquisition Method Details",
        description: "Define how livestock was obtained or entered the farm.",
        fields: [
          {
            name: "name",
            label: "Method Name",
            required: true,
            full: true,
            placeholder: "Born on farm",
          },
        ],
      },
    ],
  },
  stages: {
    resource: "stages",
    title: "Livestock Stages",
    singular: "stage",
    description:
      "Manage development stages, animal type assignments, and tag requirement policies.",
    createLabel: "Add stage",
    searchPlaceholder: "Search stages by name, livestock type...",
    columns: [
      { key: "name", label: "Stage Name", primary: true },
      { key: "livestockTypeName", label: "Livestock Type", type: "badge" },
      { key: "isTagApplicable", label: "Tagging Requirement", type: "badge" },
      { key: "animalsCount", label: "Animals", type: "count" },
      { key: "createdAt", label: "Created At", type: "date" },
    ],
    sections: [
      {
        title: "Stage Details",
        description: "Specify the developmental stage name and target livestock type.",
        fields: [
          {
            name: "name",
            label: "Stage Name",
            required: true,
            full: true,
            placeholder: "e.g. Calf, Heifer, Kid, Grower",
          },
          {
            name: "livestockTypeId",
            label: "Livestock Type",
            type: "select",
            required: true,
            optionsKey: "livestockTypes",
          },
          {
            name: "is_tag_applicable",
            label: "Tagging Policy",
            type: "select",
            required: true,
            options: [
              { value: "1", label: "Tag Required (Mandatory on intake)" },
              { value: "0", label: "Tag Deferred (Untagged young / neonate)" },
            ],
          },
        ],
      },
    ],
  },
};


// Shared resource-table convention: creation date is the final data column.
Object.values(animalResourceConfigs).forEach((config) => {
  config.columns = withCreatedColumn(config.columns, { key: "createdAt", label: "Created at", type: "date" });
});

export function getAnimalResourceConfig(
  resource: AnimalResource,
): AnimalResourceConfig {
  return animalResourceConfigs[resource];
}

