import type { FormField, PeopleOption, PeopleResource, PeopleResourceConfig } from "@/features/people/types";

const option = (value: string, label: string): PeopleOption => ({ value, label });
const activeOptions = [option("active", "Active"), option("notActive", "Not active")];
const farmStatusOptions = [option("active", "Active"), option("not-active", "Not active")];
const genders = [option("male", "Male"), option("female", "Female")];
const sizeUnits = [option("acre", "Acre"), option("hectare", "Hectare"), option("square_meter", "Square metre"), option("square_kilometer", "Square kilometre")];
const farmerTypes = [option("individual", "Individual"), option("organization", "Organization")];
const farmRoles = [
  option("farm-manager", "Farm Manager"), option("feeding-user", "Feeding User"), option("weight-change-user", "Weight Change User"),
  option("deworming-user", "Deworming User"), option("medication-user", "Medication User"), option("vaccination-user", "Vaccination User"),
  option("disposal-user", "Disposal User"), option("birth-event-user", "Birth Event User"), option("aborted-pregnancy-user", "Aborted Pregnancy User"),
  option("dryoff-user", "Dry-off User"), option("insemination-user", "Insemination User"), option("pregnancy-user", "Pregnancy User"),
  option("milking-user", "Milking User"), option("transfer-user", "Transfer User"),
];
const specializations = [
  option("livestock_management", "Livestock Management"), option("medication_management", "Medication Management"),
  option("vaccination_services", "Vaccination Services"), option("animal_health", "Animal Health"), option("disease_control", "Disease Control & Prevention"),
  option("livestock_breeding", "Livestock Breeding"), option("animal_nutrition", "Animal Nutrition & Feed Management"), option("dairy_management", "Dairy Management"),
  option("poultry_management", "Poultry Management"), option("livestock_records", "Livestock Records & Data Management"),
  option("reproductive_health", "Reproductive Health Management"), option("deworming_services", "Deworming Services"),
  option("veterinary_assistance", "Veterinary Assistance"), option("livestock_husbandry", "Livestock Husbandry"), option("animal_welfare", "Animal Welfare"),
  option("breeding_technologies", "Breeding Technologies"), option("milk_production", "Milk Production Management"),
  option("livestock_feed", "Livestock Feed & Nutrition"), option("disease_diagnosis", "Disease Diagnosis"),
  option("treatment_administration", "Treatment Administration"), option("livestock_monitoring", "Livestock Monitoring & Care"), option("other", "Other"),
];

const locationFields = (required: boolean | "country" = false, includeVillage = false): FormField[] => [
  { name: "countryId", label: "Country", type: "select", optionsKey: "countries", required: Boolean(required), defaultValue: "1" },
  { name: "regionId", label: "Region", type: "select", optionsKey: "regions", parentField: "countryId", required: required === true },
  { name: "districtId", label: "District", type: "select", optionsKey: "districts", parentField: "regionId", required: required === true },
  { name: "wardId", label: "Ward", type: "select", optionsKey: "wards", parentField: "districtId", required: required === true },
  ...(includeVillage ? [{ name: "villageId", label: "Village", type: "select" as const, optionsKey: "villages", parentField: "wardId" }] : []),
];

const configs: Record<PeopleResource, PeopleResourceConfig> = {
  farms: {
    resource: "farms", title: "Farms", singular: "farm", createLabel: "Register farm", deletable: true, softDeletable: true,
    description: "Manage registered farms, ownership, location, legal status and operational state.",
    searchPlaceholder: "Search farm, reference or owner…", statusOptions: farmStatusOptions,
    columns: [
      { key: "farmName", label: "Farm name", primary: true, secondaryKey: "referenceNo" }, { key: "farmerName", label: "Farmer" },
      { key: "sizeDisplay", label: "Size" }, { key: "wardName", label: "Ward" }, { key: "districtName", label: "District" },
      { key: "regionName", label: "Region" }, { key: "legalStatusName", label: "Legal status" }, { key: "status", label: "Farm status", type: "status" },
      { key: "createdAt", label: "Created", type: "date" }, { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      { title: "Ownership & registration", description: "The registered owner and official farm identifiers.", fields: [
        { name: "farmerId", label: "Farmer / owner", type: "select", optionsKey: "farmers", required: true, full: true },
        { name: "name", label: "Farm name", required: true }, { name: "referenceNo", label: "Reference number", required: true },
        { name: "regionalRegNo", label: "Regional registration number" }, { name: "legalStatusId", label: "Legal status", type: "select", optionsKey: "legalStatuses" },
      ] },
      { title: "Land & coordinates", description: "Farm size and optional geographic coordinates.", fields: [
        { name: "size", label: "Farm size", type: "number", step: "0.01" }, { name: "sizeUnit", label: "Size unit", type: "select", options: sizeUnits, required: true, defaultValue: "acre" },
        { name: "latitudes", label: "Latitude", type: "number", step: "any" }, { name: "longitudes", label: "Longitude", type: "number", step: "any" },
      ] },
      { title: "Location & status", description: "Administrative location and current operating state.", fields: [
        { name: "physicalAddress", label: "Physical address", type: "textarea", required: true, full: true },
        ...locationFields("country", true), { name: "status", label: "Farm status", type: "select", options: farmStatusOptions, required: true, defaultValue: "active" },
      ] },
    ],
  },
  farmers: {
    resource: "farmers", title: "Farmers", singular: "farmer", createLabel: "Register farmer", deletable: true, softDeletable: true,
    description: "Manage farmer identity, contact, demographic, location and membership information.",
    searchPlaceholder: "Search farmer number, name, phone or email…", statusOptions: activeOptions,
    columns: [
      { key: "farmerNo", label: "Farmer number" }, { key: "fullName", label: "Full name", primary: true, secondaryKey: "phone1" },
      { key: "email", label: "Email" }, { key: "gender", label: "Gender" }, { key: "dateOfBirth", label: "Date of birth", type: "date" },
      { key: "wardName", label: "Ward" }, { key: "districtName", label: "District" }, { key: "farmerType", label: "Type" },
      { key: "status", label: "Status", type: "status" }, { key: "createdAt", label: "Created", type: "date" }, { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      { title: "Farmer identity", description: "Core registration and personal information. Farmer number is generated automatically.", fields: [
        { name: "farmerType", label: "Farmer type", type: "select", options: farmerTypes, required: true, defaultValue: "individual" },
        { name: "firstName", label: "First name", required: true }, { name: "middleName", label: "Middle name" }, { name: "surname", label: "Surname", required: true },
        { name: "dateOfBirth", label: "Date of birth", type: "date" }, { name: "gender", label: "Gender", type: "select", options: genders, required: true },
      ] },
      { title: "Contact & membership", description: "Primary contact details and farmer organization membership.", fields: [
        { name: "phone1", label: "Primary phone", type: "tel", required: true }, { name: "phone2", label: "Secondary phone", type: "tel" },
        { name: "email", label: "Email address", type: "email" }, { name: "farmerOrganizationMembership", label: "Organization membership" },
        { name: "physicalAddress", label: "Physical address", type: "textarea", full: true },
      ] },
      { title: "Identification & education", description: "Government identity and education information.", fields: [
        { name: "identityCardTypeId", label: "Identity card type", type: "select", optionsKey: "identityCardTypes" },
        { name: "identityNumber", label: "Identity number" }, { name: "schoolLevelId", label: "School level", type: "select", optionsKey: "schoolLevels" },
      ] },
      { title: "Location & record state", description: "Administrative location, status and login credentials.", fields: [
        ...locationFields("country", true), { name: "streetId", label: "Street", type: "select", optionsKey: "streets", parentField: "wardId" },
        { name: "status", label: "Status", type: "select", options: activeOptions, required: true, defaultValue: "active" },
        { name: "username", label: "Login username", helper: "Optional — if blank on creation, a unique username is generated from the farmer's surname." },
        { name: "password", label: "Account password", type: "password", helper: "Saved to User Accounts for authentication. If blank on creation, defaults to email or primary phone." },
      ] },
    ],
  },
  "extension-officers": {
    resource: "extension-officers", title: "Extension Officers", singular: "extension officer", createLabel: "Add officer", deletable: true,
    description: "Manage extension officer profiles, service areas, verification and specializations.",
    searchPlaceholder: "Search officer, email, phone or organization…",
    statusOptions: [option("verified", "Verified"), option("unverified", "Unverified")],
    columns: [
      { key: "fullName", label: "Full name", primary: true, secondaryKey: "email" }, { key: "phone", label: "Phone" }, { key: "gender", label: "Gender" },
      { key: "countryName", label: "Country" }, { key: "regionName", label: "Region" }, { key: "districtName", label: "District" },
      { key: "wardName", label: "Ward" }, { key: "organization", label: "Organization" }, { key: "specialization", label: "Specialization" },
      { key: "isVerified", label: "Verified", type: "boolean" }, { key: "invitesCount", label: "Farm invites" },
      { key: "createdAt", label: "Created", type: "date" }, { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      { title: "Personal information", description: "Officer identity and contact details.", fields: [
        { name: "firstName", label: "First name", required: true }, { name: "middleName", label: "Middle name" }, { name: "lastName", label: "Last name", required: true },
        { name: "email", label: "Email address", type: "email", required: true }, { name: "phone", label: "Phone number", type: "tel", required: true },
        { name: "gender", label: "Gender", type: "select", options: genders, required: true }, { name: "address", label: "Address", type: "textarea", full: true },
      ] },
      { title: "Professional details", description: "Organization, credentials, specialization, verification and login account.", fields: [
        { name: "licenseNumber", label: "License number" }, { name: "organization", label: "Organization" },
        { name: "specialization", label: "Specialization", type: "select", options: specializations },
        { name: "isVerified", label: "Verified officer", type: "checkbox", helper: "Marks the officer's profile as administratively verified." },
        { name: "username", label: "Login username", helper: "Optional — if blank on creation, a unique username is generated from the officer's last name." },
        { name: "password", label: "Account password", type: "password", helper: "Saved to both Extension Officer and User Accounts. Defaults to “password” if blank on creation." },
      ] },
      { title: "Service location", description: "The officer's assigned administrative area.", fields: locationFields(true) },
    ],
  },
  "farm-users": {
    resource: "farm-users", title: "Farm Users", singular: "farm user", createLabel: "Add farm user", deletable: true,
    description: "Manage farm staff profiles, assigned farms, operational roles and linked login accounts.",
    searchPlaceholder: "Search staff name, phone, email or role…", statusOptions: activeOptions,
    columns: [
      { key: "fullName", label: "Full name", primary: true, secondaryKey: "phone" }, { key: "farmName", label: "Farm" },
      { key: "roleTitle", label: "Role" }, { key: "email", label: "Email" }, { key: "gender", label: "Gender" },
      { key: "status", label: "Status", type: "status" }, { key: "createdAt", label: "Created", type: "date" }, { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      { title: "Farm & role", description: "Assign the staff member to a farm and define their operational responsibility.", fields: [
        { name: "farmUuid", label: "Assigned farm", type: "select", optionsKey: "farms", required: true },
        { name: "roleTitle", label: "Farm role", type: "select", options: farmRoles, required: true },
        { name: "status", label: "Status", type: "select", options: activeOptions, defaultValue: "active" },
      ] },
      { title: "Personal information", description: "Contact details and credentials saved to User Accounts for login.", fields: [
        { name: "firstName", label: "First name", required: true }, { name: "middleName", label: "Middle name" }, { name: "lastName", label: "Last name", required: true },
        { name: "phone", label: "Phone number", type: "tel", required: true }, { name: "email", label: "Email address", type: "email", required: true },
        { name: "gender", label: "Gender", type: "select", options: genders, required: true },
        { name: "username", label: "Login username", helper: "Optional — if blank, generated from last name or email prefix." },
        { name: "password", label: "Account password", type: "password", helper: "If blank on creation, the email address is used as the initial password." },
      ] },
    ],
  },
  "farm-invites": {
    resource: "farm-invites", title: "Farm Invites", singular: "farm invite", createLabel: "Create invite", deletable: true,
    description: "Manage access codes that connect extension officers to farm owners.",
    searchPlaceholder: "Search access code, officer or owner…",
    columns: [
      { key: "officerName", label: "Extension officer", primary: true }, { key: "farmName", label: "Farm" }, { key: "farmerName", label: "Farmer / owner", secondaryKey: "ownerEmail" },
      { key: "access_code", label: "Access code" }, { key: "createdAt", label: "Created", type: "date" }, { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      { title: "Officer access", description: "Choose the officer and farm. The farm owner is derived automatically.", fields: [
        { name: "extensionOfficerId", label: "Extension officer", type: "select", optionsKey: "extensionOfficers", required: true, full: true },
        { name: "farmId", label: "Farm", type: "select", optionsKey: "farms", required: true, full: true },
        { name: "access_code", label: "Access code", helper: "Leave blank when creating to generate a unique code automatically.", full: true },
      ] },
    ],
  },
  "system-user-profiles": {
    resource: "system-user-profiles", title: "System User Profiles", singular: "system user profile", createLabel: "Add profile", deletable: true,
    description: "Manage administrative person profiles that can be linked to system and veterinary accounts.",
    searchPlaceholder: "Search name, username, email, phone or address…", statusOptions: activeOptions,
    columns: [
      { key: "fullName", label: "Full name", primary: true, secondaryKey: "phone" }, { key: "username", label: "Username" },
      { key: "email", label: "Email" }, { key: "address", label: "Address" },
      { key: "createdByName", label: "Created by" }, { key: "status", label: "Status", type: "status" },
      { key: "createdAt", label: "Created", type: "date" }, { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      { title: "Personal & profile details", description: "The administrator's identity, contact details and status.", fields: [
        { name: "firstName", label: "First name", required: true }, { name: "middleName", label: "Middle name" }, { name: "lastName", label: "Last name", required: true },
        { name: "phone", label: "Phone number", type: "tel", required: true }, { name: "address", label: "Address", type: "textarea", full: true },
        { name: "status", label: "Status", type: "select", options: activeOptions, defaultValue: "active" },
      ] },
      { title: "Account & login credentials", description: "User Account role and login credentials for authentication.", fields: [
        { name: "accountRole", label: "Account role", type: "select", options: [option("systemUser", "System User"), option("vet", "Veterinarian")], defaultValue: "systemUser" },
        { name: "username", label: "Login username", helper: "Optional — if blank, generated from last name." },
        { name: "email", label: "Login email", type: "email", helper: "Email saved to User Accounts for authentication." },
        { name: "password", label: "Account password", type: "password", helper: "Saved to User Accounts for authentication. Leave blank on update to retain it." },
      ] },
    ],
  },
};

export const RESOLVED_NAME_FIELD_MAP: Record<string, string> = {
  countryId: "countryName",
  regionId: "regionName",
  districtId: "districtName",
  wardId: "wardName",
  villageId: "villageName",
  streetId: "streetName",
  identityCardTypeId: "identityCardTypeName",
  schoolLevelId: "schoolLevelName",
  legalStatusId: "legalStatusName",
  farmerId: "farmerName",
  farmId: "farmName",
  farmUuid: "farmName",
  extensionOfficerId: "officerName",
  createdBy: "createdByName",
};

export function getPeopleResourceConfig(resource: PeopleResource) {
  return configs[resource];
}
