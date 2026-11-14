export type RegistryType = "mcus" | "amcos" | "centres" | "factories";
export type OrganisationType = Exclude<RegistryType, "centres">;

export type RegistryRow = {
  created_at?: string | null;
  document_urls?: string | Record<string, string> | string[] | null;
  uuid: string;
  name: string;
  mcu_code?: string;
  amcos_code?: string;
  factory_code?: string;
  mcu_name?: string | null;
  mcu_uuid?: string | null;
  amcos_name?: string | null;
  amcos_uuid?: string | null;
  region_name?: string | null;
  ward_name?: string | null;
  district_name?: string | null;
  country_name?: string | null;
  country_id?: number | null;
  /** Unions only: covers every region of its country. */
  all_regions?: boolean | number | null;
  region_id?: number | null;
  district_id?: number | null;
  ward_id?: number | null;
  village_id?: number | null;
  registration_number: string | null;
  address?: string | null;
  dairy_board_license_no?: string | null;
  tin_number?: string | null;
  website?: string | null;
  contact_name: string | null;
  contact_title?: string | null;
  contact_email?: string | null;
  contact_phone: string | null;
  operator_type?: "company" | "individual" | null;
  operator_name?: string | null;
  operator_phone?: string | null;
  operator_registration_number?: string | null;
  is_active: boolean | number;
};

export type RegistryResponse = {
  data: RegistryRow[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
    canManage: boolean;
    stats: { total: number; active: number; extra: number };
  };
};
