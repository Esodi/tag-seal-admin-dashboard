import { withCreatedColumn } from "@/lib/resource-table";
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpNarrowWide,
} from "lucide-react";
import type { CareerResource } from "./types";

export type CareerColumn = {
  key: string;
  label: string;
  kind?: "text" | "date" | "status" | "verified" | "capacity" | "badge";
  primary?: boolean;
  secondaryKey?: string;
};

export type SortOrder = "desc" | "asc" | "alpha-asc" | "alpha-desc";

export const SORT_OPTIONS: Array<{
  value: SortOrder;
  label: string;
  icon: typeof ArrowDownWideNarrow;
}> = [
  { value: "desc", label: "Newest first", icon: ArrowDownWideNarrow },
  { value: "asc", label: "Oldest first", icon: ArrowUpNarrowWide },
  { value: "alpha-asc", label: "Name (A–Z)", icon: ArrowDownAZ },
  { value: "alpha-desc", label: "Name (Z–A)", icon: ArrowUpAZ },
];

export const PAGE_SIZE_OPTIONS = [10, 30, 50, 100] as const;

export type StatusOption = {
  value: string;
  label: string;
};

export type ResourceConfig = {
  title: string;
  description: string;
  singular: string;
  searchPlaceholder: string;
  columns: CareerColumn[];
  statuses: string[];
  statusOptions: StatusOption[];
  create?: string;
  deletable: boolean;
};

/** Registries whose Create button opens the portal create form. */
export const careerCreatable = ["jobs", "applications", "job-seekers", "employers", "memberships", "onboardings"] as const;
export type CareerCreatable = (typeof careerCreatable)[number];
export const isCareerCreatable = (resource: CareerResource): resource is CareerCreatable =>
  (careerCreatable as readonly string[]).includes(resource);

const statusCol: CareerColumn = {
  key: "status",
  label: "Status",
  kind: "status",
};

export const reviewStatuses = [
  "submitted",
  "underReview",
  "shortlisted",
  "interview",
  "reserve",
  "declined",
];

export const joiningStatuses = [
  "draft",
  "sent",
  "confirmed",
  "declined",
  "cancelled",
  "not_joined",
  "activated",
  "ended",
];

const standardActiveOptions: StatusOption[] = [
  { value: "active", label: "Active" },
  { value: "not-active", label: "Inactive" },
];

const catalogStatusOptions: StatusOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const careerConfig: Record<CareerResource, ResourceConfig> = {
  jobs: {
    create: "Post vacancy",
    title: "Job Postings",
    singular: "Vacancy",
    description:
      "Review vacancies, position capacity, employer details and closing dates.",
    searchPlaceholder: "Search vacancy title, category, employer or farm…",
    statuses: ["active", "closed", "expired"],
    statusOptions: [
      { value: "active", label: "Active" },
      { value: "closed", label: "Closed" },
      { value: "expired", label: "Expired" },
    ],
    deletable: true,
    columns: [
      {
        key: "name",
        label: "Vacancy",
        primary: true,
        secondaryKey: "category",
      },
      {
        key: "employer_name",
        label: "Employer",
        primary: true,
        secondaryKey: "employer_identification",
      },
      { key: "details.jobNature", label: "Employment type" },
      { key: "positions_count", label: "Positions", kind: "capacity" },
      { key: "applications_count", label: "Applications" },
      { key: "closes_at", label: "Closing date", kind: "date" },
      statusCol,
    ],
  },
  applications: {
    create: "Submit application",
    title: "Job Applications",
    singular: "Application",
    description:
      "Review candidate applications, qualifications and review workflow.",
    searchPlaceholder: "Search candidate name, phone, vacancy, employer…",
    statuses: [
      ...reviewStatuses,
      "accepted",
      "hired",
      "offerDeclined",
      "notJoined",
      "employmentEnded",
    ],
    statusOptions: [
      { value: "submitted", label: "Submitted" },
      { value: "underReview", label: "Under review" },
      { value: "shortlisted", label: "Shortlisted" },
      { value: "interview", label: "Interview" },
      { value: "reserve", label: "On reserve" },
      { value: "hired", label: "Hired / Placed" },
      { value: "declined", label: "Declined" },
    ],
    deletable: true,
    columns: [
      {
        key: "candidate_name",
        label: "Candidate",
        primary: true,
        secondaryKey: "candidate_phone",
      },
      {
        key: "candidate_location",
        label: "Candidate Details",
        secondaryKey: "candidate_gender",
      },
      {
        key: "job_title",
        label: "Applied Vacancy & Category",
        primary: true,
        secondaryKey: "job_category",
      },
      {
        key: "employer_name",
        label: "Employer & Farm",
        secondaryKey: "farm_name",
      },
      { key: "status", label: "Review status", kind: "status" },
      { key: "joining_status", label: "Joining stage", kind: "status" },
      { key: "created_at", label: "Applied", kind: "date" },
    ],
  },
  "job-seekers": {
    create: "Register job seeker",
    title: "Job Seekers",
    singular: "Job seeker",
    description:
      "Registered farm worker CV profiles, qualifications, skills and availability.",
    searchPlaceholder: "Search candidate name, phone, NIDA, region, skills…",
    statuses: ["active", "not-active"],
    statusOptions: standardActiveOptions,
    deletable: true,
    columns: [
      {
        key: "candidate_name",
        label: "Candidate",
        primary: true,
        secondaryKey: "candidate_phone",
      },
      { key: "candidate_nida", label: "NIDA / Identity" },
      { key: "preferred_role", label: "Preferred role" },
      { key: "candidate_location", label: "Location" },
      { key: "candidate_gender", label: "Gender" },
      { key: "skills_summary", label: "Skills" },
      statusCol,
      { key: "created_at", label: "Registered", kind: "date" },
    ],
  },
  employers: {
    create: "Register employer",
    title: "Farm Employers",
    singular: "Employer",
    description:
      "Registered farm owners and hiring organizations with employer memberships.",
    searchPlaceholder: "Search employer name, organization, phone…",
    statuses: ["active", "not-active"],
    statusOptions: standardActiveOptions,
    deletable: true,
    columns: [
      {
        key: "name",
        label: "Employer / Owner",
        primary: true,
        secondaryKey: "phone",
      },
      { key: "organization_name", label: "Organization" },
      { key: "total_jobs", label: "Posted vacancies" },
      { key: "registered_farms", label: "Registered farms" },
      statusCol,
      { key: "created_at", label: "Joined", kind: "date" },
    ],
  },
  memberships: {
    create: "Add membership",
    title: "Feature Memberships",
    singular: "Membership",
    description:
      "Account memberships across services (Farmer, Job Seeker, Job Owner, Milking, Shop).",
    searchPlaceholder: "Search member account, phone, organization…",
    statuses: ["active", "not-active"],
    statusOptions: standardActiveOptions,
    deletable: true,
    columns: [
      {
        key: "name",
        label: "Member account",
        primary: true,
        secondaryKey: "phone",
      },
      { key: "feature", label: "Membership", kind: "badge" },
      { key: "organization_name", label: "Organization" },
      { key: "phone_verified", label: "Phone identity", kind: "verified" },
      {
        key: "account_role",
        label: "Account Role",
        kind: "badge",
      },
      statusCol,
      { key: "created_at", label: "Joined", kind: "date" },
    ],
  },
  onboardings: {
    create: "Send joining details",
    title: "Joining & Onboarding",
    singular: "Joining record",
    description:
      "Monitor terms, applicant replies, expected arrival and farm owner approvals.",
    searchPlaceholder: "Search worker name, role, farm or employer…",
    statuses: joiningStatuses,
    statusOptions: [
      { value: "draft", label: "Draft" },
      { value: "sent", label: "Sent / Pending reply" },
      { value: "confirmed", label: "Applicant confirmed" },
      { value: "activated", label: "Access activated" },
      { value: "declined", label: "Declined" },
      { value: "cancelled", label: "Cancelled" },
      { value: "not_joined", label: "Not joined" },
      { value: "ended", label: "Employment ended" },
    ],
    deletable: true,
    columns: [
      {
        key: "name",
        label: "Worker",
        primary: true,
        secondaryKey: "role_title",
      },
      {
        key: "farm_name",
        label: "Farm",
        secondaryKey: "employer_name",
      },
      { key: "source", label: "Source", kind: "badge" },
      { key: "terms.startDate", label: "Proposed start", kind: "date" },
      { key: "terms.responseDate", label: "Reply by", kind: "date" },
      statusCol,
    ],
  },
  workers: {
    create: "Register pending worker",
    title: "Farm Workers",
    singular: "Worker assignment",
    description:
      "Farm workers, manual registrations and Career hires with approved duties and farm access.",
    searchPlaceholder: "Search worker name, phone, role, farm…",
    statuses: joiningStatuses,
    statusOptions: [
      { value: "active", label: "Active" },
      { value: "confirmed", label: "Confirmed" },
      { value: "pending", label: "Pending" },
      { value: "ended", label: "Ended" },
    ],
    deletable: true,
    columns: [
      {
        key: "name",
        label: "Worker",
        primary: true,
        secondaryKey: "phone",
      },
      { key: "farm_name", label: "Farm" },
      { key: "role_title", label: "Role" },
      { key: "source", label: "Source", kind: "badge" },
      statusCol,
      { key: "access_status", label: "Farm access", kind: "status" },
      { key: "activated_at", label: "Activated", kind: "date" },
    ],
  },
  "job-types": {
    create: "Add job category",
    title: "Job Categories",
    singular: "Job category",
    description:
      "Standardized agricultural specializations and categories used for job advertisements.",
    searchPlaceholder: "Search category code or name…",
    statuses: ["active", "inactive"],
    statusOptions: catalogStatusOptions,
    deletable: true,
    columns: [
      {
        key: "name_en",
        label: "English name",
        primary: true,
        secondaryKey: "code",
      },
      { key: "name_sw", label: "Swahili name" },
      statusCol,
    ],
  },
  "job-options": {
    create: "Add career option",
    title: "Career Form Options",
    singular: "Form option",
    description:
      "Bilingual options for employment type, workplace model, requirements and candidate qualifications.",
    searchPlaceholder: "Search option code, label or group…",
    statuses: ["active", "inactive"],
    statusOptions: catalogStatusOptions,
    deletable: true,
    columns: [
      {
        key: "name_en",
        label: "English label",
        primary: true,
        secondaryKey: "code",
      },
      { key: "group", label: "Field group", kind: "badge" },
      { key: "name_sw", label: "Swahili label" },
      statusCol,
    ],
  },
};

export const labels: Record<string, string> = {
  underReview: "Under review",
  offerDeclined: "Joining declined",
  notJoined: "Not joined",
  employmentEnded: "Employment ended",
  not_joined: "Not joined",
  activated: "Access activated",
  confirmed: "Applicant confirmed",
  draft: "Pending registration",
  jobSeeker: "Job Seeker",
  jobOwner: "Job Owner",
  farmer: "Farmer",
  milking: "Milking",
  shop: "Shop",
  marketplaceBuyer: "Marketplace Buyer",
  marketplaceSeller: "Marketplace Seller",
  jobNature: "Employment type",
  workingModel: "Working model",
  experienceLevel: "Experience level",
  educationLevel: "Education level",
  specialization: "Specialization",
  manual: "Manual registration",
  career: "Career hire",
  "not-active": "Inactive",
  fullName: "Full name",
  role_title: "Worker role",
  responseDate: "Reply by",
  startDate: "Proposed start date",
  arrivalDate: "Expected arrival",
  reportingName: "Reporting person",
  reportingPhone: "Reporting phone",
  farmUuid: "Registered farm",
  active: "Active",
  closed: "Closed",
  expired: "Expired",
  reserve: "On reserve",
  shortlisted: "Shortlisted",
  interview: "Interview",
  hired: "Hired",
  declined: "Declined",
  cancelled: "Cancelled",
  ended: "Ended",
  pending: "Pending",
};

export function label(value: string): string {
  if (!value) return "—";
  return (
    labels[value] ??
    value
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[-_.]/g, " ")
      .replace(/^./, (c) => c.toUpperCase())
  );
}

export function at(record: unknown, path: string): unknown {
  if (!record || typeof record !== "object") return undefined;
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value !== null && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      record,
    );
}

export function text(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value))
    return (
      value
        .map(text)
        .filter((v) => v !== "—")
        .join(", ") || "—"
    );
  return typeof value === "object" ? "—" : String(value);
}

export function dateText(value: unknown): string {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

// Shared resource-table convention: creation date is the final data column.
Object.values(careerConfig).forEach((config) => {
  config.columns = withCreatedColumn(config.columns, { key: "created_at", label: "Created at", kind: "date" });
});

