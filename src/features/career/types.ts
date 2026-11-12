export const careerResources = [
  "jobs",
  "applications",
  "job-seekers",
  "employers",
  "memberships",
  "onboardings",
  "workers",
  "job-types",
  "job-options",
] as const;
export type CareerResource = (typeof careerResources)[number];
export type CareerRecord = {
  id: number;
  name: string;
  status: string;
  details?: Record<string, unknown>;
  applicant_snapshot?: Record<string, unknown>;
  terms?: Record<string, unknown>;
  response?: Record<string, unknown>;
  permissions?: string[];
  memberships?: Array<{
    id: number;
    feature: string;
    organization_id?: number;
    farmer_id?: number;
  }>;
  history?: Array<{
    id: number;
    role_title: string;
    status: string;
    activated_at?: string;
    ended_at?: string;
    termination_reason?: string;
  }>;
  onboarding?: { id: number; status: string } | null;
  [key: string]: unknown;
};
export type CareerResponse = {
  data: CareerRecord[];
  meta: {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
    stats: Array<{ label: string; value: number; note: string }>;
  };
};
export type CareerOptions = {
  farms?: Array<{ value: string; label: string; ownerId: number }>;
  groups: string[];
  features: string[];
  applicationStatuses: string[];
};
export type CareerOverview = {
  stats: Array<{ label: string; value: number; href: CareerResource }>;
  applications: Array<{ status: string; total: number }>;
  joining: Array<{ status: string; total: number }>;
  memberships: Array<{ feature: string; total: number }>;
};
