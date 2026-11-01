export const dairyResources = ["centres", "tanks", "batches", "intakes", "dispatches", "deliveries", "transporters", "factories", "trips", "factory-tanks"] as const;
export type DairyResource = (typeof dairyResources)[number];
export type DairyResponse = {
  data: Array<Record<string, unknown>>;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  meta?: Record<string, number>;
};
