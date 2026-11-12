export type TransporterTab = "all" | "pending" | "archived";

export type TransporterRow = {
  uuid: string;
  name: string;
  mcu_uuid: string | null;
  mcu_name: string | null;
  license_number: string;
  tin_number: string | null;
  phone: string;
  email: string | null;
  contact_person: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_title: string | null;
  region_name: string | null;
  district_name: string | null;
  physical_address: string | null;
  website: string | null;
  approval_status: "pending" | "approved" | "rejected";
  approval_remarks: string | null;
  is_active: boolean | number;
  archived_at: string | null;
  vehicles_count: number;
  drivers_count: number;
  created_at: string | null;
};

export type PageMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type TransporterResponse = {
  data: TransporterRow[];
  meta: PageMeta & {
    stats: { total: number; pending: number; approved: number; rejected: number; vehicles: number; drivers: number };
  };
};

export type FleetKind = "vehicles" | "drivers";

export type TransportVehicleRow = {
  created_at?: string | null;
  uuid: string;
  transporter_company_uuid: string;
  registration_number: string;
  vehicle_type: string | null;
  color: string | null;
  tanker_capacity_liters: number | string | null;
  tare_weight_kg: number | string | null;
  is_active: boolean | number;
  company_name: string;
  driver_first_name: string | null;
  driver_middle_name?: string | null;
  driver_last_name: string | null;
};

export type TransportDriverRow = {
  created_at?: string | null;
  uuid: string;
  transporter_company_uuid: string;
  first_name: string | null;
  middle_name?: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  driver_license_number: string | null;
  licence_class: string | null;
  licence_expiry: string | null;
  national_id: string | null;
  is_active: boolean | number;
  company_name: string;
  assigned_vehicle_plate: string | null;
  pin_pending: boolean | number | null;
};

export type FleetRow = TransportVehicleRow | TransportDriverRow;

export type FleetResponse = {
  data: FleetRow[];
  meta: PageMeta & {
    stats: { total: number; active: number; assigned: number; capacity?: number; awaiting_login?: number };
  };
};

export const isVehicle = (row: FleetRow): row is TransportVehicleRow => "registration_number" in row;

export const driverName = (row: TransportDriverRow) =>
  [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ") || row.display_name || "—";
