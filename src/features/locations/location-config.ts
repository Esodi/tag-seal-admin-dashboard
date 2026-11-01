import type {
  LocationResource,
  LocationResourceConfig,
} from "@/features/locations/types";

export const LOCATION_RESOLVED_NAME_FIELD_MAP: Record<string, string> = {
  countryId: "countryName",
  regionId: "regionName",
  districtId: "districtName",
  wardId: "wardName",
};

export const locationResourceConfigs: Record<
  LocationResource,
  LocationResourceConfig
> = {
  countries: {
    resource: "countries",
    title: "Countries",
    singular: "country",
    description:
      "National jurisdictions and ISO short codes at the root of the geographical hierarchy.",
    createLabel: "Add country",
    searchPlaceholder: "Search by country name or short code...",
    columns: [
      { key: "name", label: "Country Name", primary: true },
      { key: "shortName", label: "Short Name", type: "badge" },
      { key: "regionsCount", label: "Regions", type: "count" },
      { key: "farmsCount", label: "Farms", type: "count" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "Country name",
        required: true,
        placeholder: "Tanzania",
      },
      {
        name: "shortName",
        label: "Short name",
        required: true,
        placeholder: "TZ",
        helper: "ISO or official administrative short code (e.g. TZ, KE, UG).",
      },
    ],
    detailFields: [
      { key: "name", label: "Country name" },
      { key: "shortName", label: "Short name", type: "badge" },
      { key: "regionsCount", label: "Linked regions", type: "count" },
      { key: "farmersCount", label: "Registered farmers", type: "count" },
      { key: "farmsCount", label: "Registered farms", type: "count" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
  regions: {
    resource: "regions",
    title: "Regions",
    singular: "region",
    description:
      "First-level administrative regions mapped under their parent countries.",
    createLabel: "Add region",
    searchPlaceholder: "Search by region name, code or country...",
    parentFilterLabel: "All countries",
    columns: [
      { key: "name", label: "Region Name", primary: true },
      { key: "shortName", label: "Short Name", type: "badge" },
      {
        key: "countryName",
        label: "Country",
        secondaryKey: "countryShortName",
      },
      { key: "districtsCount", label: "Districts", type: "count" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "Region name",
        required: true,
        placeholder: "Arusha",
      },
      {
        name: "shortName",
        label: "Short name",
        required: true,
        placeholder: "AR",
      },
      {
        name: "countryId",
        label: "Country",
        type: "select",
        optionsKey: "countries",
        required: true,
        full: true,
      },
    ],
    detailFields: [
      { key: "name", label: "Region name" },
      { key: "shortName", label: "Short name", type: "badge" },
      { key: "countryName", label: "Country" },
      { key: "districtsCount", label: "Linked districts", type: "count" },
      { key: "farmersCount", label: "Registered farmers", type: "count" },
      { key: "farmsCount", label: "Registered farms", type: "count" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
  districts: {
    resource: "districts",
    title: "Districts",
    singular: "district",
    description:
      "Districts and local councils linked to their parent regions.",
    createLabel: "Add district",
    searchPlaceholder: "Search by district, region or country...",
    parentFilterLabel: "All regions",
    columns: [
      { key: "name", label: "District Name", primary: true },
      { key: "regionName", label: "Region", secondaryKey: "countryName" },
      { key: "divisionsCount", label: "Divisions", type: "count" },
      { key: "wardsCount", label: "Wards", type: "count" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "District name",
        required: true,
        placeholder: "Arusha Urban",
        full: true,
      },
      {
        name: "regionId",
        label: "Region",
        type: "select",
        optionsKey: "regions",
        required: true,
        full: true,
      },
    ],
    detailFields: [
      { key: "name", label: "District name" },
      { key: "regionName", label: "Region" },
      { key: "countryName", label: "Country" },
      { key: "divisionsCount", label: "Linked divisions", type: "count" },
      { key: "wardsCount", label: "Linked wards", type: "count" },
      { key: "farmersCount", label: "Registered farmers", type: "count" },
      { key: "farmsCount", label: "Registered farms", type: "count" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
  divisions: {
    resource: "divisions",
    title: "Divisions",
    singular: "division",
    description:
      "Administrative divisions organized under districts and regions.",
    createLabel: "Add division",
    searchPlaceholder: "Search by division, district or region...",
    parentFilterLabel: "All districts",
    columns: [
      { key: "name", label: "Division Name", primary: true },
      { key: "districtName", label: "District" },
      { key: "regionName", label: "Region", secondaryKey: "countryName" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "Division name",
        required: true,
        placeholder: "Themi Division",
        full: true,
      },
      {
        name: "districtId",
        label: "District",
        type: "select",
        optionsKey: "districts",
        required: true,
        full: true,
      },
    ],
    detailFields: [
      { key: "name", label: "Division name" },
      { key: "districtName", label: "District" },
      { key: "regionName", label: "Region" },
      { key: "countryName", label: "Country" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
  wards: {
    resource: "wards",
    title: "Wards",
    singular: "ward",
    description:
      "Administrative wards linked to districts and serving villages and streets.",
    createLabel: "Add ward",
    searchPlaceholder: "Search by ward, district or region...",
    parentFilterLabel: "All districts",
    columns: [
      { key: "name", label: "Ward Name", primary: true },
      { key: "districtName", label: "District", secondaryKey: "regionName" },
      { key: "villagesCount", label: "Villages", type: "count" },
      { key: "streetsCount", label: "Streets", type: "count" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "Ward name",
        required: true,
        placeholder: "Sekei",
        full: true,
      },
      {
        name: "districtId",
        label: "District",
        type: "select",
        optionsKey: "districts",
        required: true,
        full: true,
      },
    ],
    detailFields: [
      { key: "name", label: "Ward name" },
      { key: "districtName", label: "District" },
      { key: "regionName", label: "Region" },
      { key: "countryName", label: "Country" },
      { key: "villagesCount", label: "Linked villages", type: "count" },
      { key: "streetsCount", label: "Linked streets", type: "count" },
      { key: "farmersCount", label: "Registered farmers", type: "count" },
      { key: "farmsCount", label: "Registered farms", type: "count" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
  villages: {
    resource: "villages",
    title: "Villages",
    singular: "village",
    description:
      "Rural and peri-urban villages mapped under administrative wards.",
    createLabel: "Add village",
    searchPlaceholder: "Search by village, ward or district...",
    parentFilterLabel: "All wards",
    columns: [
      { key: "name", label: "Village Name", primary: true },
      { key: "wardName", label: "Ward" },
      { key: "districtName", label: "District", secondaryKey: "regionName" },
      { key: "farmsCount", label: "Farms", type: "count" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "Village name",
        required: true,
        placeholder: "Sekei Village",
        full: true,
      },
      {
        name: "wardId",
        label: "Ward",
        type: "select",
        optionsKey: "wards",
        required: true,
        full: true,
      },
    ],
    detailFields: [
      { key: "name", label: "Village name" },
      { key: "wardName", label: "Ward" },
      { key: "districtName", label: "District" },
      { key: "regionName", label: "Region" },
      { key: "countryName", label: "Country" },
      { key: "farmersCount", label: "Registered farmers", type: "count" },
      { key: "farmsCount", label: "Registered farms", type: "count" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
  streets: {
    resource: "streets",
    title: "Streets",
    singular: "street",
    description:
      "Streets and sub-localities mapped under administrative wards.",
    createLabel: "Add street",
    searchPlaceholder: "Search by street, ward or district...",
    parentFilterLabel: "All wards",
    columns: [
      { key: "name", label: "Street Name", primary: true },
      { key: "wardName", label: "Ward" },
      { key: "districtName", label: "District", secondaryKey: "regionName" },
      { key: "createdAt", label: "Created", type: "date" },
    ],
    fields: [
      {
        name: "name",
        label: "Street name",
        required: true,
        placeholder: "Sanawari Street",
        full: true,
      },
      {
        name: "wardId",
        label: "Ward",
        type: "select",
        optionsKey: "wards",
        required: true,
        full: true,
      },
    ],
    detailFields: [
      { key: "name", label: "Street name" },
      { key: "wardName", label: "Ward" },
      { key: "districtName", label: "District" },
      { key: "regionName", label: "Region" },
      { key: "countryName", label: "Country" },
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Last updated", type: "date" },
    ],
  },
};

export function getLocationResourceConfig(
  resource: LocationResource,
): LocationResourceConfig {
  return locationResourceConfigs[resource];
}

