export type AnalyticsPreset = "today" | "7" | "30" | "month" | "custom";
export type AnalyticsView = "analytics" | "reports";
export type AnalyticsTab = "overview" | "livestock" | "events" | "geography" | "production";
export type AnalyticsReportKey = string;

export type AnalyticsOption = { value: string; label: string; parent?: string; description?: string | null };
export type AnalyticsFarmOption = AnalyticsOption & { countryId?: string; regionId?: string };

export type AnalyticsStat = {
  key: string;
  label: string;
  value: number;
  previous: number | null;
  change: number | null;
  direction: "up" | "down" | "neutral";
  note: string;
  unit?: string | null;
};

export type ActivityPoint = {
  period: string;
  label: string;
  health: number;
  production: number;
  reproduction: number;
  movement: number;
  growth: number;
  other: number;
  total: number;
};

export type ProductionPoint = { period: string; label: string; quantity: number };
export type NamedValue = { name: string; value: number };
export type AnalyticsEventType = { value: string; label: string; count: number };
export type AnalyticsReportCatalogItem = { value: string; label: string; group: string; description: string };
export type MilkingAnalysis = {
  totalLitres: number;
  records: number;
  averageLitres: number;
  byFarm: NamedValue[];
  byFarmer: NamedValue[];
  byAnimal: NamedValue[];
  trend: ProductionPoint[];
};
export type AttentionItem = {
  key: string;
  severity: "success" | "info" | "warning" | "danger";
  value: number;
  title: string;
  description: string;
  href: string;
};
export type TopFarm = { farmName: string; country: string; region: string; animals: number; events: number; lastActivity?: string | null };
export type AnalyticsReport = { columns: string[]; rows: Array<Record<string, string | number | null>> };

export type AnalyticsResponse = {
  range: { from: string; to: string; previousFrom: string; previousTo: string; days: number };
  filters: { countries: AnalyticsOption[]; regions: AnalyticsOption[]; farms: AnalyticsFarmOption[] };
  stats: AnalyticsStat[];
  activityTrend: ActivityPoint[];
  productionTrend: ProductionPoint[];
  animalsBySpecies: NamedValue[];
  eventsByFamily: NamedValue[];
  eventTypes: AnalyticsEventType[];
  reportCatalog: AnalyticsReportCatalogItem[];
  milkingAnalysis: MilkingAnalysis;
  topFarms: TopFarm[];
  attention: AttentionItem[];
  regionalCoverage: AnalyticsReport;
  productionRecords: AnalyticsReport;
  healthSummary: AnalyticsReport;
  reports: Record<AnalyticsReportKey, AnalyticsReport>;
  generatedAt: string;
};

export type AnalyticsApiResponse = { status: boolean; data: AnalyticsResponse };
