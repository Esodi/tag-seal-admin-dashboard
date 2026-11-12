import "server-only";

import { cookies } from "next/headers";
import type {
  AnimalBlueprintRecord,
  BlueprintOptionsResponse,
  BlueprintRecord,
  BlueprintResource,
  BlueprintResponse,
  DynamicSpeciesRecord,
  EventDefinitionRecord,
  FormDefinitionRecord,
  LookupSetRecord,
} from "@/features/blueprints/types";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

// Standard Registration Form Schema for Fallback & Simulation
const standardRegistrationSchema = {
  sections: [
    {
      key: "identification_section",
      title: { en: "Identification & Tagging", sw: "Utambulisho na Hereni" },
      description: {
        en: "Primary visual tag and paired electronic RFID identifiers.",
        sw: "Hereni kuu ya kuona na kitambulisho cha kielektroniki.",
      },
      fields: [
        {
          key: "identifier_primary",
          component: "identifier_scanner",
          label: { en: "Ear Tag Number / Barcode", sw: "Namba ya Hereni / Barcode" },
          placeholder: { en: "Scan tag or type RFID...", sw: "Changanua hereni..." },
          required: "always",
          role: "Primary Identifier",
        },
        {
          key: "tag_color",
          component: "single_select",
          label: { en: "Ear Tag Color", sw: "Rangi ya Hereni" },
          options: [
            { value: "yellow", label: { en: "Yellow", sw: "Manjano" } },
            { value: "green", label: { en: "Green", sw: "Kijani" } },
            { value: "white", label: { en: "White", sw: "Nyeupe" } },
            { value: "blue", label: { en: "Blue", sw: "Bluu" } },
          ],
        },
      ],
    },
    {
      key: "subject_profile",
      title: { en: "Animal Profile & Biological Traits", sw: "Sifa za Kibiolojia" },
      description: {
        en: "Physical traits, birth metrics, breed, and sex.",
        sw: "Sifa za maumbile, uzito wa kuzaliwa, na jinsia.",
      },
      fields: [
        {
          key: "name_alias",
          component: "text",
          label: { en: "Animal Name or Farm Alias", sw: "Jina la Mnyama au Namba ya Shamba" },
          placeholder: { en: "e.g. Daisy or Cow-04", sw: "mfano: Daisy" },
        },
        {
          key: "birth_date",
          component: "date",
          label: { en: "Date of Birth", sw: "Tarehe ya Kuzaliwa" },
          required: "always",
        },
        {
          key: "birth_weight",
          component: "measurement",
          label: { en: "Birth Weight", sw: "Uzito wa Kuzaliwa" },
          unit: "kg",
          placeholder: { en: "e.g. 32.5", sw: "mfano 32.5" },
        },
        {
          key: "photo_intake",
          component: "photo",
          label: { en: "Animal Profile Photo", sw: "Picha ya Mnyama" },
        },
      ],
    },
  ],
};

const standardEventSchema = {
  sections: [
    {
      key: "event_metrics",
      title: { en: "Event Readings & Metrics", sw: "Vipimo vya Tukio" },
      fields: [
        {
          key: "measurement_value",
          component: "measurement",
          label: { en: "Recorded Quantity / Weight", sw: "Kiasi / Uzito Uliorekodiwa" },
          unit: "kg",
          required: "always",
        },
        {
          key: "event_date",
          component: "date",
          label: { en: "Date Recorded", sw: "Tarehe ya Tukio" },
          required: "always",
        },
        {
          key: "operator_notes",
          component: "multiline_text",
          label: { en: "Field Operator Notes", sw: "Maoni ya Afisa" },
        },
      ],
    },
  ],
};

const mockBlueprints: AnimalBlueprintRecord[] = [
  {
    id: 1,
    uuid: "bp-cattle-std-v1",
    code: "cattle.standard",
    version: 1,
    species_uuid: "sp-cattle-uuid",
    registration_form_uuid: "form-reg-cattle-v1",
    registration_form_version: 1,
    status: "published",
    animal_type: "Cattle",
    events_count: 6,
    species: {
      id: 1,
      uuid: "sp-cattle-uuid",
      name: "Dairy Cattle (Ng'ombe wa Maziwa)",
      code: "cattle",
    },
    registrationForm: {
      id: 1,
      uuid: "form-reg-cattle-v1",
      code: "reg_cattle_standard_v1",
      version: 1,
      schema_json: standardRegistrationSchema,
    },
    settings_json: {
      catalogBinding: { livestockTypeId: 1, speciesId: 1 },
      subjectModes: ["individual"],
      allowedSexCodes: ["female", "male", "unknown"],
      reproductionMode: "live_birth",
      locales: ["en", "sw"],
      identificationPolicy: {
        allowed: ["paired_rfid_barcode", "visual_ear_tag"],
        required: ["paired_rfid_barcode"],
        allowWithoutTag: true,
      },
    },
    created_at: "2026-10-28 14:20:00",
  },
  {
    id: 2,
    uuid: "bp-swine-std-v1",
    code: "swine.commercial",
    version: 1,
    species_uuid: "sp-swine-uuid",
    registration_form_uuid: "form-reg-swine-v1",
    registration_form_version: 1,
    status: "published",
    animal_type: "Swine",
    events_count: 5,
    species: {
      id: 2,
      uuid: "sp-swine-uuid",
      name: "Commercial Swine (Nguruwe)",
      code: "swine",
    },
    registrationForm: {
      id: 2,
      uuid: "form-reg-swine-v1",
      code: "reg_swine_standard_v1",
      version: 1,
      schema_json: standardRegistrationSchema,
    },
    settings_json: {
      catalogBinding: { livestockTypeId: 2, speciesId: 2 },
      subjectModes: ["individual", "group"],
      allowedSexCodes: ["female", "male", "intersex"],
      reproductionMode: "live_birth",
      locales: ["en", "sw"],
      identificationPolicy: {
        allowed: ["paired_rfid_barcode", "tattoo"],
        required: [],
        allowWithoutTag: true,
      },
    },
    created_at: "2026-10-28 15:30:00",
  },
  {
    id: 3,
    uuid: "bp-goat-std-v1",
    code: "goat.standard",
    version: 1,
    species_uuid: "sp-goat-uuid",
    registration_form_uuid: "form-reg-goat-v1",
    registration_form_version: 1,
    status: "published",
    animal_type: "Goat",
    events_count: 4,
    species: {
      id: 3,
      uuid: "sp-goat-uuid",
      name: "East African Goat (Mbuzi)",
      code: "goat",
    },
    registrationForm: {
      id: 3,
      uuid: "form-reg-goat-v1",
      code: "reg_goat_standard_v1",
      version: 1,
      schema_json: standardRegistrationSchema,
    },
    settings_json: {
      catalogBinding: { livestockTypeId: 3, speciesId: 3 },
      subjectModes: ["individual"],
      allowedSexCodes: ["female", "male", "unknown"],
      reproductionMode: "live_birth",
      locales: ["en", "sw"],
      identificationPolicy: {
        allowed: ["visual_ear_tag"],
        required: [],
        allowWithoutTag: true,
      },
    },
    created_at: "2026-10-29 09:15:00",
  },
  {
    id: 4,
    uuid: "bp-cattle-v2-draft",
    code: "cattle.standard",
    version: 2,
    species_uuid: "sp-cattle-uuid",
    registration_form_uuid: "form-reg-cattle-v1",
    registration_form_version: 1,
    status: "draft",
    animal_type: "Cattle",
    events_count: 7,
    species: {
      id: 1,
      uuid: "sp-cattle-uuid",
      name: "Dairy Cattle (Ng'ombe wa Maziwa)",
      code: "cattle",
    },
    registrationForm: {
      id: 1,
      uuid: "form-reg-cattle-v1",
      code: "reg_cattle_standard_v1",
      version: 1,
      schema_json: standardRegistrationSchema,
    },
    settings_json: {
      catalogBinding: { livestockTypeId: 1, speciesId: 1 },
      subjectModes: ["individual"],
      allowedSexCodes: ["female", "male", "unknown"],
      reproductionMode: "live_birth",
      locales: ["en", "sw"],
      identificationPolicy: {
        allowed: ["paired_rfid_barcode"],
        required: ["paired_rfid_barcode"],
        allowWithoutTag: false,
      },
    },
    created_at: "2026-10-30 11:00:00",
  },
];

const mockEvents: EventDefinitionRecord[] = [
  {
    id: 1,
    uuid: "ev-feed-v1",
    name: "Daily Feeding & Ration",
    code: "record_feeding",
    blueprint_uuid: "bp-cattle-std-v1",
    blueprint_version: 1,
    form_uuid: "form-feed-v1",
    form_version: 1,
    behavior_code: "Feeding",
    family: "feeding",
    status: "published",
    translations_json: { en: "Daily Feeding & Ration", sw: "Kurekodi Chakula cha Kila Siku" },
    blueprint: { id: 1, uuid: "bp-cattle-std-v1", code: "cattle.standard", version: 1 },
    form: { id: 10, uuid: "form-feed-v1", code: "form_feeding_v1", version: 1, schema_json: standardEventSchema },
    created_at: "2026-10-28 14:30:00",
  },
  {
    id: 2,
    uuid: "ev-weight-v1",
    name: "Growth Weight Record",
    code: "record_weight",
    blueprint_uuid: "bp-cattle-std-v1",
    blueprint_version: 1,
    form_uuid: "form-weight-v1",
    form_version: 1,
    behavior_code: "WeightChange",
    family: "inventory",
    status: "published",
    translations_json: { en: "Growth Weight Record", sw: "Kupima Uzito wa Ukuaji" },
    blueprint: { id: 1, uuid: "bp-cattle-std-v1", code: "cattle.standard", version: 1 },
    form: { id: 11, uuid: "form-weight-v1", code: "form_weight_v1", version: 1, schema_json: standardEventSchema },
    created_at: "2026-10-28 14:35:00",
  },
  {
    id: 3,
    uuid: "ev-insem-v1",
    name: "Artificial Insemination",
    code: "record_insemination",
    blueprint_uuid: "bp-cattle-std-v1",
    blueprint_version: 1,
    form_uuid: "form-insem-v1",
    form_version: 1,
    behavior_code: "Insemination",
    family: "reproduction",
    status: "published",
    translations_json: { en: "Artificial Insemination", sw: "Upandikizaji wa Mbegu" },
    blueprint: { id: 1, uuid: "bp-cattle-std-v1", code: "cattle.standard", version: 1 },
    form: { id: 12, uuid: "form-insem-v1", code: "form_insemination_v1", version: 1, schema_json: standardEventSchema },
    created_at: "2026-10-28 14:40:00",
  },
  {
    id: 4,
    uuid: "ev-preg-v1",
    name: "Pregnancy Diagnosis",
    code: "record_pregnancy_test",
    blueprint_uuid: "bp-cattle-std-v1",
    blueprint_version: 1,
    form_uuid: "form-preg-v1",
    form_version: 1,
    behavior_code: "PregnancyTest",
    family: "reproduction",
    status: "published",
    translations_json: { en: "Pregnancy Diagnosis", sw: "Kupima Mimba" },
    blueprint: { id: 1, uuid: "bp-cattle-std-v1", code: "cattle.standard", version: 1 },
    form: { id: 13, uuid: "form-preg-v1", code: "form_pregnancy_test_v1", version: 1, schema_json: standardEventSchema },
    created_at: "2026-10-28 14:45:00",
  },
  {
    id: 5,
    uuid: "ev-trans-v1",
    name: "Farm Movement & Transfer",
    code: "record_transfer",
    blueprint_uuid: "bp-cattle-std-v1",
    blueprint_version: 1,
    form_uuid: "form-trans-v1",
    form_version: 1,
    behavior_code: "Transfer",
    family: "lifecycle",
    status: "published",
    translations_json: { en: "Farm Movement & Transfer", sw: "Uhamisho wa Shamba" },
    blueprint: { id: 1, uuid: "bp-cattle-std-v1", code: "cattle.standard", version: 1 },
    form: { id: 14, uuid: "form-trans-v1", code: "form_transfer_v1", version: 1, schema_json: standardEventSchema },
    created_at: "2026-10-28 14:50:00",
  },
  {
    id: 6,
    uuid: "ev-disp-v1",
    name: "Disposal & Sale",
    code: "record_disposal",
    blueprint_uuid: "bp-cattle-std-v1",
    blueprint_version: 1,
    form_uuid: "form-disp-v1",
    form_version: 1,
    behavior_code: "Disposal",
    family: "lifecycle",
    status: "published",
    translations_json: { en: "Disposal & Sale", sw: "Uuzaji au Utupaji wa Mnyama" },
    blueprint: { id: 1, uuid: "bp-cattle-std-v1", code: "cattle.standard", version: 1 },
    form: { id: 15, uuid: "form-disp-v1", code: "form_disposal_v1", version: 1, schema_json: standardEventSchema },
    created_at: "2026-10-28 14:55:00",
  },
];

const mockForms: FormDefinitionRecord[] = [
  {
    id: 1,
    uuid: "form-reg-cattle-v1",
    code: "reg_cattle_standard_v1",
    version: 1,
    purpose: "registration",
    status: "published",
    checksum: "sha256:8f4c27a9018e47b3...",
    schema_json: standardRegistrationSchema,
    created_at: "2026-10-28 12:00:00",
  },
  {
    id: 2,
    uuid: "form-reg-swine-v1",
    code: "reg_swine_standard_v1",
    version: 1,
    purpose: "registration",
    status: "published",
    checksum: "sha256:4b219cf90176ef9a...",
    schema_json: standardRegistrationSchema,
    created_at: "2026-10-28 12:15:00",
  },
  {
    id: 3,
    uuid: "form-weight-v1",
    code: "form_weight_v1",
    version: 1,
    purpose: "event",
    status: "published",
    checksum: "sha256:7e09bca3482181bc...",
    schema_json: standardEventSchema,
    created_at: "2026-10-28 12:30:00",
  },
  {
    id: 4,
    uuid: "form-feed-v1",
    code: "form_feeding_v1",
    version: 1,
    purpose: "event",
    status: "published",
    checksum: "sha256:32cfa098234ea781...",
    schema_json: standardEventSchema,
    created_at: "2026-10-28 12:45:00",
  },
  {
    id: 5,
    uuid: "form-vacc-draft",
    code: "form_custom_vaccine_v2",
    version: 2,
    purpose: "event",
    status: "draft",
    schema_json: standardEventSchema,
    created_at: "2026-10-30 16:00:00",
  },
];

const mockLookups: LookupSetRecord[] = [
  {
    id: 1,
    uuid: "ls-sex-uuid",
    name: "Animal Sex Classifications",
    code: "animal_sex",
    version: 1,
    status: "published",
    options_count: 5,
    created_at: "2026-10-28 10:00:00",
  },
  {
    id: 2,
    uuid: "ls-feed-uuid",
    name: "Feed Types & Rations",
    code: "feed_type",
    version: 1,
    status: "published",
    options_count: 8,
    created_at: "2026-10-28 10:10:00",
  },
  {
    id: 3,
    uuid: "ls-disp-uuid",
    name: "Disposal & Culling Reasons",
    code: "disposal_type",
    version: 1,
    status: "published",
    options_count: 6,
    created_at: "2026-10-28 10:20:00",
  },
  {
    id: 4,
    uuid: "ls-insem-uuid",
    name: "Insemination Delivery Service",
    code: "insemination_service",
    version: 1,
    status: "published",
    options_count: 4,
    created_at: "2026-10-28 10:30:00",
  },
];

const mockSpecies: DynamicSpeciesRecord[] = [
  {
    id: 1,
    uuid: "sp-cattle-uuid",
    name: "Dairy Cattle (Ng'ombe wa Maziwa)",
    code: "cattle",
    default_subject_mode: "individual",
    group_display_name: "Herd",
    legacy_livestock_type_id: 1,
    mobile_type_name: "Cattle",
    status: "published",
    capabilities_json: { reproduction: "live_birth" },
    created_at: "2026-10-28 09:00:00",
  },
  {
    id: 2,
    uuid: "sp-swine-uuid",
    name: "Commercial Swine (Nguruwe)",
    code: "swine",
    default_subject_mode: "individual",
    group_display_name: "Pen",
    legacy_livestock_type_id: 2,
    mobile_type_name: "Swine",
    status: "published",
    capabilities_json: { reproduction: "live_birth" },
    created_at: "2026-10-28 09:10:00",
  },
  {
    id: 3,
    uuid: "sp-goat-uuid",
    name: "East African Goat (Mbuzi)",
    code: "goat",
    default_subject_mode: "individual",
    group_display_name: "Flock",
    legacy_livestock_type_id: 3,
    mobile_type_name: "Goat",
    status: "published",
    capabilities_json: { reproduction: "live_birth" },
    created_at: "2026-10-28 09:20:00",
  },
  {
    id: 4,
    uuid: "sp-sheep-uuid",
    name: "Indigenous Sheep (Kondoo)",
    code: "sheep",
    default_subject_mode: "individual",
    group_display_name: "Flock",
    legacy_livestock_type_id: 4,
    mobile_type_name: "Sheep",
    status: "published",
    capabilities_json: { reproduction: "live_birth" },
    created_at: "2026-10-28 09:30:00",
  },
  {
    id: 5,
    uuid: "sp-poultry-uuid",
    name: "Layer Poultry (Kuku wa Mayai)",
    code: "poultry",
    default_subject_mode: "group",
    group_display_name: "Flock",
    status: "draft",
    capabilities_json: { reproduction: "egg_laying" },
    created_at: "2026-10-30 14:00:00",
  },
];

export async function getInitialBlueprintResource(
  resource: BlueprintResource,
): Promise<{ data: BlueprintResponse | null; error?: string }> {
  try {
    const token = (await cookies()).get("tagseal_admin_token")?.value;
    if (token) {
      const response = await fetch(`${apiUrl}/api/v1/admin/blueprints/${resource}?per_page=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.data) {
        return {
          data: {
            status: true,
            data: payload.data,
            current_page: payload.current_page ?? 1,
            per_page: payload.per_page ?? 20,
            total: payload.total ?? payload.data.length,
            last_page: payload.last_page ?? 1,
          },
        };
      }
    }
  } catch {
    // Fall back to comprehensive mock data
  }

  // Graceful fallback data
  let fallbackData: BlueprintRecord[] = [];
  if (resource === "animal-blueprints") fallbackData = mockBlueprints;
  else if (resource === "event-definitions") fallbackData = mockEvents;
  else if (resource === "form-definitions") fallbackData = mockForms;
  else if (resource === "lookup-sets") fallbackData = mockLookups;
  else if (resource === "dynamic-species") fallbackData = mockSpecies;

  return {
    data: {
      status: true,
      data: fallbackData,
      current_page: 1,
      per_page: 20,
      total: fallbackData.length,
      last_page: 1,
    },
  };
}

export async function getBlueprintOptions(
  resource: BlueprintResource,
): Promise<{ data: BlueprintOptionsResponse["data"] | null }> {
  try {
    const token = (await cookies()).get("tagseal_admin_token")?.value;
    if (token) {
      const response = await fetch(`${apiUrl}/api/v1/admin/blueprints/${resource}/options`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.data) {
        return { data: payload.data };
      }
    }
  } catch {
    // Fallback options below
  }

  return {
    data: {
      statuses: ["draft", "published", "retired"],
      species: mockSpecies.map((s) => ({ uuid: s.uuid, name: s.name, code: s.code })),
      blueprints: mockBlueprints.map((b) => ({ uuid: b.uuid, code: b.code, version: b.version, status: b.status })),
      registration_forms: mockForms.filter((f) => f.purpose === "registration").map((f) => ({ uuid: f.uuid, code: f.code, version: f.version, status: f.status })),
      event_forms: mockForms.filter((f) => f.purpose === "event").map((f) => ({ uuid: f.uuid, code: f.code, version: f.version, status: f.status })),
      livestock_types: [
        { id: 1, name: "Cattle" },
        { id: 2, name: "Swine" },
        { id: 3, name: "Goat" },
        { id: 4, name: "Sheep" },
      ],
      catalog_species: [
        { id: 1, name: "Dairy Cattle", livestockTypeId: 1 },
        { id: 2, name: "Commercial Swine", livestockTypeId: 2 },
        { id: 3, name: "East African Goat", livestockTypeId: 3 },
      ],
      identifier_types: [
        { code: "paired_rfid_barcode", name: "Paired RFID Ear Tag & Barcode" },
        { code: "visual_ear_tag", name: "Visual Ear Tag" },
        { code: "tattoo", name: "Ear Tattoo" },
      ],
      families: {
        health: "Health & Veterinary",
        reproduction: "Breeding & Reproduction",
        production: "Milk & Yield Production",
        inventory: "Inventory & Growth",
        feeding: "Nutrition & Feeding",
        lifecycle: "Lifecycle & Movement",
        other: "General Husbandry",
      },
      reproduction_models: {
        live_birth: "Live birth",
        egg_laying: "Egg laying",
        spawning: "Spawning",
        none: "Not tracked",
      },
      subject_modes: {
        individual: "Individual animal",
        group: "Group / population",
      },
    },
  };
}

